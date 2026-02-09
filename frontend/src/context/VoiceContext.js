import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Voice Context
 *
 * Manages global voice state:
 * - WebSocket connection to backend
 * - Audio streaming (microphone → backend → speakers)
 * - UI updates from voice commands
 * - Transcripts for display
 */

const VoiceContext = createContext(null);

// WebSocket URL - adjust for production
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8005/ws';

export function VoiceProvider({ children }) {
  const navigate = useNavigate();

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Transcripts
  const [userTranscript, setUserTranscript] = useState('');
  const [assistantTranscript, setAssistantTranscript] = useState('');

  // Last products (for reference in components)
  const [lastProducts, setLastProducts] = useState([]);
  const [lastFilters, setLastFilters] = useState({});

  // Mute state for microphone
  const [isMuted, setIsMuted] = useState(false);

  // Flag to indicate voice-triggered update (prevents HTTP fetch race condition)
  const voiceUpdateFlagRef = useRef(false);

  // Pending voice data for navigation scenarios (consumed by Products on mount)
  const pendingVoiceUpdateRef = useRef(null);

  // Callbacks for UI updates (set by Products page)
  const onProductsUpdateRef = useRef(null);
  const onFiltersUpdateRef = useRef(null);
  const onProductDetailRef = useRef(null);
  const onCompareRef = useRef(null);
  const onAddToCartRef = useRef(null);

  // WebSocket and Audio refs
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const playbackQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  /**
   * Register callbacks for UI updates
   */
  const registerProductsCallback = useCallback((callback) => {
    onProductsUpdateRef.current = callback;
  }, []);

  const registerFiltersCallback = useCallback((callback) => {
    onFiltersUpdateRef.current = callback;
  }, []);

  const registerProductDetailCallback = useCallback((callback) => {
    onProductDetailRef.current = callback;
  }, []);

  const registerCompareCallback = useCallback((callback) => {
    onCompareRef.current = callback;
  }, []);

  const registerAddToCartCallback = useCallback((callback) => {
    onAddToCartRef.current = callback;
  }, []);

  /**
   * Handle UI update events from backend
   */
  const handleUIUpdate = useCallback((event) => {
    console.log('UI Update received:', event);

    const { action, navigate_to, data, filters } = event;

    // Handle navigation
    if (navigate_to) {
      navigate(navigate_to);
    }

    // Handle different actions
    switch (action) {
      case 'SHOW_PRODUCTS':
        if (data?.products) {
          setLastProducts(data.products);
          setLastFilters(filters || {});

          // Set flag to prevent HTTP fetch race condition
          voiceUpdateFlagRef.current = true;

          // Store pending data for navigation scenarios
          // (Products component may not be mounted yet if navigating from another page)
          if (navigate_to) {
            pendingVoiceUpdateRef.current = {
              products: data.products,
              total: data.total,
              filters: filters || {}
            };
          }

          // Call registered callback to update Products page
          if (onProductsUpdateRef.current) {
            onProductsUpdateRef.current(data.products, data.total);
          }
          if (onFiltersUpdateRef.current && filters) {
            onFiltersUpdateRef.current(filters);
          }

          // Clear flag after a short delay to allow React to batch updates
          setTimeout(() => {
            voiceUpdateFlagRef.current = false;
          }, 500);
        }
        break;

      case 'SHOW_PRODUCT_DETAILS':
        // Open product detail modal
        if (data?.product && onProductDetailRef.current) {
          onProductDetailRef.current(data.product);
        }
        break;

      case 'COMPARE_PRODUCTS':
        // Open comparison modal
        if (data?.products && onCompareRef.current) {
          onCompareRef.current(data.products);
        }
        break;

      case 'ADD_TO_CART':
        // Add product to cart
        if (data?.product && onAddToCartRef.current) {
          onAddToCartRef.current(data.product);
        }
        break;

      case 'NAVIGATE':
        // Navigation already handled above
        break;

      default:
        console.log('Unknown UI action:', action);
    }
  }, [navigate]);

  /**
   * Connect to WebSocket and start voice session
   */
  const startVoice = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      mediaStreamRef.current = stream;

      // Create AudioContext for playback
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000
      });

      // Connect WebSocket
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Voice WebSocket connected');
        setIsConnected(true);
        setIsListening(true);

        // Start streaming audio
        startAudioStreaming(stream);
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          // Audio data from AI - queue for playback
          const arrayBuffer = await event.data.arrayBuffer();
          playbackQueueRef.current.push(arrayBuffer);
          setIsSpeaking(true);
          playNextAudio();
        } else {
          // JSON event
          try {
            const data = JSON.parse(event.data);
            handleWebSocketEvent(data);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsListening(false);
        cleanup();
      };

    } catch (error) {
      console.error('Failed to start voice:', error);
      alert('Failed to access microphone. Please grant permission and try again.');
    }
  }, [handleUIUpdate]);

  /**
   * Handle WebSocket events
   */
  const handleWebSocketEvent = useCallback((data) => {
    const { type } = data;

    switch (type) {
      case 'user_transcript':
        setUserTranscript(data.transcript);
        setIsProcessing(true);
        break;

      case 'assistant_transcript':
        setAssistantTranscript(data.transcript);
        setIsProcessing(false);
        break;

      case 'ui_update':
        handleUIUpdate(data);
        break;

      case 'clear_audio_queue':
        // User interrupted - clear playback queue
        playbackQueueRef.current = [];
        setIsSpeaking(false);
        break;

      case 'error':
        console.error('Voice error:', data.error);
        break;

      default:
        // Ignore other events
        break;
    }
  }, [handleUIUpdate]);

  /**
   * Start streaming microphone audio to backend
   */
  const startAudioStreaming = useCallback((stream) => {
    const audioContext = new AudioContext({ sampleRate: 24000 });
    const source = audioContext.createMediaStreamSource(stream);

    // Create ScriptProcessor for audio processing
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);

        // Convert float32 to int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send as binary
        wsRef.current.send(pcm16.buffer);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  }, []);

  /**
   * Play audio from queue
   */
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0) {
      if (playbackQueueRef.current.length === 0) {
        setIsSpeaking(false);
      }
      return;
    }

    isPlayingRef.current = true;
    const audioData = playbackQueueRef.current.shift();

    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      // Ensure AudioContext is running (browsers often suspend it)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Convert PCM16 to Float32
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      // Play with volume boost
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Create a GainNode to increase volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 8.0; // Extreme boost (8x)
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
      };
      source.start();
    } catch (error) {
      console.error('Audio playback error:', error);
      isPlayingRef.current = false;
      playNextAudio();
    }
  }, []);

  /**
   * Stop voice session
   */
  const stopVoice = useCallback(() => {
    cleanup();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setIsMuted(false);
  }, []);

  /**
   * Toggle voice session (for keyboard shortcut)
   */
  const toggleVoice = useCallback(async () => {
    if (isConnected) {
      stopVoice();
    } else {
      await startVoice();
    }
  }, [isConnected, startVoice, stopVoice]);

  /**
   * Toggle microphone mute
   */
  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  /**
   * Check if voice update is in progress (to prevent HTTP fetch race condition)
   */
  const isVoiceUpdateInProgress = useCallback(() => {
    return voiceUpdateFlagRef.current;
  }, []);

  /**
   * Consume pending voice data (called by Products on mount)
   * Returns the pending data and clears it, or null if nothing pending
   */
  const consumePendingVoiceData = useCallback(() => {
    const data = pendingVoiceUpdateRef.current;
    pendingVoiceUpdateRef.current = null;
    return data;
  }, []);

  /**
   * Cleanup resources
   */
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    playbackQueueRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  /**
   * Keyboard shortcuts:
   * - Spacebar: Toggle voice session (start/stop)
   * - Ctrl+M: Toggle microphone mute/unmute
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      const activeElement = document.activeElement;
      const isInputField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );

      // Spacebar - Toggle voice session
      if (e.code === 'Space' && !isInputField) {
        e.preventDefault();
        toggleVoice();
      }

      // Ctrl+M - Toggle mute
      if (e.ctrlKey && e.code === 'KeyM') {
        e.preventDefault();
        if (isConnected) {
          toggleMute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleVoice, toggleMute, isConnected]);

  const value = {
    // State
    isConnected,
    isListening,
    isProcessing,
    isSpeaking,
    isMuted,
    userTranscript,
    assistantTranscript,
    lastProducts,
    lastFilters,

    // Actions
    startVoice,
    stopVoice,
    toggleVoice,
    toggleMute,
    isVoiceUpdateInProgress,
    consumePendingVoiceData,
    registerProductsCallback,
    registerFiltersCallback,
    registerProductDetailCallback,
    registerCompareCallback,
    registerAddToCartCallback,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
