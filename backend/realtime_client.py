"""
OpenAI Realtime API Client for Voice-Guided E-Commerce.

This client handles:
- WebSocket connection to OpenAI Realtime API
- Audio streaming (send/receive)
- Function calling with UI event emission
- Session management and interruption handling
"""

import asyncio
import websockets
import json
import base64
from typing import Optional, Callable, Dict, Any
import logging
from tools import TOOLS, FUNCTION_MAP, reset_session_state

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RealtimeClient:
    """Client for OpenAI Realtime API with UI event support"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = "gpt-realtime-mini-2025-12-15"
        self.url = f"wss://api.openai.com/v1/realtime?model={self.model}"
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.connected = False

        # Interruption tracking
        self.current_response_id = None
        self.audio_samples_sent = 0

        # Callback for sending UI updates to frontend
        self._on_ui_update: Optional[Callable] = None

    async def connect(
        self,
        on_audio_delta: Callable,
        on_event: Callable,
        on_ui_update: Optional[Callable] = None
    ):
        """
        Connect to OpenAI Realtime API.

        Args:
            on_audio_delta: Callback for audio data (bytes)
            on_event: Callback for all events (dict)
            on_ui_update: Callback for UI updates when functions execute
        """
        try:
            self._on_ui_update = on_ui_update

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "OpenAI-Beta": "realtime=v1"
            }

            logger.info(f"Connecting to OpenAI Realtime API: {self.url}")
            self.ws = await websockets.connect(
                self.url,
                extra_headers=headers,
                ping_interval=20,
                ping_timeout=10
            )

            self.connected = True
            logger.info("Connected to OpenAI Realtime API")

            # Reset session state for new connection
            reset_session_state()

            # Configure session
            await self.configure_session()

            # Start listening for events
            asyncio.create_task(self._listen_events(on_audio_delta, on_event))

            # Send initial greeting
            await self.send_initial_greeting()

        except Exception as e:
            logger.error(f"Connection error: {e}")
            self.connected = False
            raise

    async def configure_session(self):
        """Configure the Realtime API session for e-commerce voice assistant"""
        session_config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": """You are BitBot, the helpful voice assistant for BitComm - a voice-guided e-commerce store by Bitcot.

CRITICAL RULES:
1. ALWAYS speak in clear, concise ENGLISH.
2. Use the appropriate function for each request:
   - search_products: Find and filter products
   - get_product_details: Show specs/details popup for a product
   - compare_products: Compare 2+ products side by side
   - add_to_cart: Add product to shopping cart
   - navigate_to_page: Go to different pages (home, products, cart, checkout)

VOICE INTERACTION GUIDELINES:
1. Be conversational but efficient - users want quick results.
2. After showing products, briefly summarize: "I found X products..."
3. Use natural price formatting: "fifteen thousand rupees" not "15000 INR"
4. When users say "under 10k", interpret as max_price: 10000
5. Products are numbered #1, #2, #3 etc. Use position numbers for references.

EXAMPLE INTERACTIONS:
- "Show me mobile phones" → search_products(category: "mobiles")
- "Laptops under 50000" → search_products(category: "laptops", max_price: 50000)
- "Filter by Samsung" → search_products(brand: "Samsung")
- "Tell me about the first one" → get_product_details(position: 1)
- "What are the specs of second product" → get_product_details(position: 2)
- "Compare first and third" → compare_products(positions: [1, 3])
- "Add the first one to cart" → add_to_cart(position: 1)
- "Go to cart" → navigate_to_page(page: "cart")
- "Checkout" → navigate_to_page(page: "checkout")

RESPONSE FORMAT:
- After search: "I found X products. Here are the top options..."
- After details: "Here are the specifications for [product name]..."
- After compare: "I'm showing you a comparison of these products..."
- After add to cart: "Done! I've added [product] to your cart..."
- After navigation: "Taking you to [page]..."

Remember: The UI automatically updates when you call functions. Focus on helpful voice narration.""",
                "voice": "sage",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 600
                },
                "tools": TOOLS,
                "tool_choice": "auto",
                "temperature": 0.7
            }
        }

        await self.ws.send(json.dumps(session_config))
        logger.info("Session configured for e-commerce assistant")

    async def send_initial_greeting(self):
        """Trigger the assistant to greet the user"""
        await asyncio.sleep(0.5)

        greeting_event = {
            "type": "response.create",
            "response": {
                "modalities": ["text", "audio"],
                "instructions": """Greet the user warmly and briefly. Say something like:
"Hi! I'm BitBot, your shopping assistant at BitComm. You can ask me to find products, filter by category or price, or get details about any item. What are you looking for today?"
Keep it under 10 seconds."""
            }
        }

        await self.ws.send(json.dumps(greeting_event))
        logger.info("Initial greeting triggered")

    async def send_audio(self, audio_data: bytes):
        """Send audio data to OpenAI"""
        if not self.connected or not self.ws:
            return

        try:
            audio_event = {
                "type": "input_audio_buffer.append",
                "audio": base64.b64encode(audio_data).decode('utf-8')
            }
            await self.ws.send(json.dumps(audio_event))
        except Exception as e:
            logger.error(f"Error sending audio: {e}")

    async def _listen_events(self, on_audio_delta: Callable, on_event: Callable):
        """Listen for events from OpenAI Realtime API"""
        try:
            async for message in self.ws:
                event = json.loads(message)
                event_type = event.get("type")

                # =============================================================
                # AUDIO RESPONSE HANDLING
                # =============================================================
                if event_type == "response.audio.delta":
                    item_id = event.get("item_id")
                    if item_id:
                        self.current_response_id = item_id

                    audio_data = event.get("delta")
                    if audio_data:
                        decoded_audio = base64.b64decode(audio_data)
                        self.audio_samples_sent += len(decoded_audio) // 2
                        await on_audio_delta(decoded_audio)

                # =============================================================
                # INTERRUPTION HANDLING
                # =============================================================
                elif event_type == "input_audio_buffer.speech_started":
                    logger.info("User interrupting - truncating response")

                    if self.current_response_id:
                        audio_end_ms = self.audio_samples_sent // 24

                        truncate_event = {
                            "type": "conversation.item.truncate",
                            "item_id": self.current_response_id,
                            "content_index": 0,
                            "audio_end_ms": audio_end_ms
                        }

                        await self.ws.send(json.dumps(truncate_event))
                        logger.info(f"Truncated at {audio_end_ms}ms")

                        self.current_response_id = None
                        self.audio_samples_sent = 0

                    # Signal frontend to clear audio queue
                    await on_event({"type": "clear_audio_queue"})

                # =============================================================
                # RESPONSE COMPLETE
                # =============================================================
                elif event_type == "response.audio.done":
                    self.current_response_id = None
                    self.audio_samples_sent = 0

                # =============================================================
                # FUNCTION CALLING - THE KEY PART
                # =============================================================
                elif event_type == "response.function_call_arguments.done":
                    await self._handle_function_call(event, on_event)

                # =============================================================
                # TRANSCRIPT EVENTS (for UI display)
                # =============================================================
                elif event_type == "conversation.item.input_audio_transcription.completed":
                    transcript = event.get("transcript", "")
                    logger.info(f"User: {transcript}")
                    # Send to frontend for display
                    await on_event({
                        "type": "user_transcript",
                        "transcript": transcript
                    })

                elif event_type == "response.audio_transcript.done":
                    transcript = event.get("transcript", "")
                    logger.info(f"Assistant: {transcript}")
                    # Send to frontend for display
                    await on_event({
                        "type": "assistant_transcript",
                        "transcript": transcript
                    })

                # =============================================================
                # ERROR HANDLING
                # =============================================================
                elif event_type == "error":
                    logger.error(f"OpenAI API Error: {event}")
                    await on_event({
                        "type": "error",
                        "error": event.get("error", {})
                    })

                # Forward all events to handler
                await on_event(event)

        except websockets.exceptions.ConnectionClosed:
            logger.info("WebSocket connection closed")
            self.connected = False
        except Exception as e:
            logger.error(f"Error in event listener: {e}")
            self.connected = False

    async def _handle_function_call(self, event: Dict[str, Any], on_event: Callable):  # noqa: ARG002
        """
        Handle function calls from OpenAI.

        KEY FEATURE: After executing the function, we emit a ui_update event
        to the frontend so the UI can update based on the function result.
        """
        try:
            call_id = event.get("call_id")
            name = event.get("name")
            arguments = event.get("arguments", "{}")

            logger.info(f"Function call: {name}")
            logger.info(f"Arguments: {arguments}")

            # Parse arguments
            args = json.loads(arguments) if arguments else {}

            # Execute function
            if name in FUNCTION_MAP:
                result = FUNCTION_MAP[name](**args)
                logger.info(f"Function result: {result}")

                # ==========================================================
                # CRITICAL: Emit UI update to frontend
                # This is what makes voice control the UI!
                # ==========================================================
                if self._on_ui_update and result.get("ui_action"):
                    ui_update = {
                        "type": "ui_update",
                        "action": result["ui_action"].get("type"),
                        "navigate_to": result["ui_action"].get("navigate_to"),
                        "filters": result["ui_action"].get("filters", {}),
                        "data": result.get("data", {}),
                        "success": result.get("success", True)
                    }
                    await self._on_ui_update(ui_update)
                    logger.info(f"UI update emitted: {ui_update['action']}")

                # Send result back to OpenAI for voice response generation
                function_output = {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": json.dumps(result)
                    }
                }

                await self.ws.send(json.dumps(function_output))

                # Trigger OpenAI to generate voice response based on result
                await self.ws.send(json.dumps({"type": "response.create"}))

            else:
                logger.error(f"Unknown function: {name}")
                # Send error result
                function_output = {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": json.dumps({"error": f"Unknown function: {name}"})
                    }
                }
                await self.ws.send(json.dumps(function_output))
                await self.ws.send(json.dumps({"type": "response.create"}))

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing function arguments: {e}")
        except Exception as e:
            logger.error(f"Error handling function call: {e}")

    async def disconnect(self):
        """Disconnect from OpenAI Realtime API"""
        self.connected = False
        if self.ws:
            await self.ws.close()
            logger.info("Disconnected from OpenAI Realtime API")
