import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Loader2, X, Bot, Power, VolumeX } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

/**
 * Voice Controller Component - BitBot
 *
 * Floating button that:
 * - Starts/stops voice session
 * - Shows current state (listening, processing, speaking)
 * - Displays transcripts
 * - Persists across all pages
 * - BitBot branding
 */
function VoiceController() {
  const {
    isConnected,
    isListening,
    isProcessing,
    isSpeaking,
    isMuted,
    userTranscript,
    assistantTranscript,
    startVoice,
    stopVoice,
    toggleMute,
  } = useVoice();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = async () => {
    if (isConnected) {
      stopVoice();
      setIsExpanded(false);
    } else {
      await startVoice();
      setIsExpanded(true);
    }
  };

  const handleDisable = () => {
    stopVoice();
    setIsExpanded(false);
  };

  // Determine current state
  const getState = () => {
    if (!isConnected) return 'idle';
    if (isMuted) return 'muted';
    if (isSpeaking) return 'speaking';
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    return 'connected';
  };

  const state = getState();

  // State-based styling - Bitcot orange theme
  const stateStyles = {
    idle: 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
    listening: 'bg-gradient-to-br from-green-500 to-emerald-600 voice-pulse',
    processing: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    speaking: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    connected: 'bg-gradient-to-br from-orange-500 to-red-500',
    muted: 'bg-gradient-to-br from-red-600 to-red-700',
  };

  const stateIcons = {
    idle: <Bot className="w-6 h-6" />,
    listening: <Mic className="w-6 h-6" />,
    processing: <Loader2 className="w-6 h-6 animate-spin" />,
    speaking: <Volume2 className="w-6 h-6" />,
    connected: <Bot className="w-6 h-6" />,
    muted: <MicOff className="w-6 h-6" />,
  };

  const stateLabels = {
    idle: 'Start BitBot',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
    connected: 'BitBot Active',
    muted: 'Muted (Ctrl+M)',
  };

  const stateColors = {
    idle: 'from-orange-500 to-red-500',
    listening: 'from-green-500 to-emerald-600',
    processing: 'from-yellow-500 to-orange-500',
    speaking: 'from-blue-500 to-indigo-600',
    connected: 'from-orange-500 to-red-500',
    muted: 'from-red-600 to-red-700',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
      {/* Transcript Panel */}
      {isExpanded && isConnected && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className={`bg-gradient-to-r ${stateColors[state]} px-4 py-3 flex justify-between items-center`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-white text-sm font-semibold">BitBot</span>
                <p className="text-white/80 text-xs">{stateLabels[state]}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {/* Mute/Unmute Button */}
              <button
                onClick={toggleMute}
                className={`p-1.5 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                }`}
                title={isMuted ? 'Unmute (Ctrl+M)' : 'Mute (Ctrl+M)'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </button>
              {/* Disable/End Session Button */}
              <button
                onClick={handleDisable}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="End Voice Session"
              >
                <Power className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Minimize"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Waveform animation when active */}
          {(isListening || isSpeaking) && (
            <div className="bg-gray-50 py-2 flex justify-center items-center space-x-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-green-500'}`}
                  style={{
                    height: `${8 + Math.random() * 16}px`,
                    animation: `wave 0.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcripts */}
          <div className="p-4 max-h-64 overflow-y-auto space-y-3">
            {/* User transcript */}
            {userTranscript && (
              <div className="flex justify-end">
                <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-2xl rounded-br-md max-w-[85%] text-sm">
                  <p className="text-[10px] text-orange-500 mb-1 font-medium">You said:</p>
                  {userTranscript}
                </div>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-orange-500" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Assistant transcript */}
            {assistantTranscript && !isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-bl-md max-w-[85%] text-sm">
                  <p className="text-[10px] text-orange-500 mb-1 font-medium flex items-center space-x-1">
                    <Bot className="w-3 h-3" />
                    <span>BitBot:</span>
                  </p>
                  {assistantTranscript}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!userTranscript && !assistantTranscript && !isProcessing && (
              <div className="text-center text-gray-400 py-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">Hi! I'm BitBot</p>
                <p className="text-xs mt-1 text-gray-400">Try saying:</p>
                <p className="text-xs mt-1 italic text-orange-500">"Show me mobile phones under 10,000"</p>
              </div>
            )}
          </div>

          {/* Footer with tips */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {isMuted ? '🔇 Muted - Press Ctrl+M to unmute' :
               isSpeaking ? '🔊 BitBot is speaking...' :
               isListening ? '🎤 Listening...' : 'Ready to help!'}
            </p>
            <p className="text-[10px] text-gray-400 text-center mt-1">
              Space: Toggle | Ctrl+M: Mute
            </p>
          </div>
        </div>
      )}

      {/* Main Voice Button - BitBot */}
      <div className="relative">
        <button
          onClick={handleToggle}
          className={`
            w-14 h-14 rounded-full shadow-lg flex items-center justify-center
            text-white transition-all duration-300 transform hover:scale-105
            focus:outline-none focus:ring-4 focus:ring-orange-300
            ${stateStyles[state]}
          `}
          title={isConnected ? 'Click or press Space to stop BitBot' : 'Click or press Space to start BitBot'}
        >
          {isConnected ? (
            state === 'idle' ? <MicOff className="w-6 h-6" /> : stateIcons[state]
          ) : (
            <Bot className="w-6 h-6" />
          )}
        </button>

        {/* Active indicator ring */}
        {isConnected && isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75" />
        )}
      </div>

      {/* Quick tip when idle */}
      {!isConnected && (
        <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-orange-200 flex items-center space-x-2">
          <Bot className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Space</kbd> or click to talk to <span className="font-semibold text-orange-600">BitBot</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default VoiceController;
