"""
Voice-Guided E-Commerce Backend

FastAPI application providing:
- HTTP REST API for product search (used by UI filters)
- WebSocket endpoint for voice interactions (OpenAI Realtime API)

Architecture principle: Both HTTP and Voice use the SAME search_products function.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import asyncio
import os
from dotenv import load_dotenv
import logging

from products import search_products, get_product_by_id, get_all_brands, get_all_categories, get_price_range
from realtime_client import RealtimeClient

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Voice-Guided E-Commerce API",
    description="E-commerce backend with voice-controlled product search",
    version="1.0.0"
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not found - voice features will be disabled")


# =============================================================================
# HTTP ENDPOINTS - Used by frontend UI filters
# =============================================================================

@app.get("/api/products")
async def api_search_products(
    query: Optional[str] = Query(None, description="Search text"),
    category: Optional[str] = Query(None, description="Category filter"),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    sort_by: str = Query("relevance", description="Sort order"),
    limit: int = Query(20, description="Max products to return")
):
    """
    Search and filter products.

    This endpoint uses the SAME search_products function as voice commands.
    This ensures consistent behavior between manual UI interaction and voice.
    """
    result = search_products(
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
        brand=brand,
        sort_by=sort_by,
        limit=limit
    )
    return result


@app.get("/api/products/{product_id}")
async def api_get_product(product_id: str):
    """Get a single product by ID"""
    product = get_product_by_id(product_id)
    if product:
        return {"success": True, "data": product}
    return {"success": False, "error": "Product not found"}


@app.get("/api/metadata")
async def api_get_metadata():
    """Get available filters metadata"""
    return {
        "categories": get_all_categories(),
        "brands": get_all_brands(),
        "price_range": get_price_range()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "voice-ecommerce-api",
        "voice_enabled": bool(OPENAI_API_KEY)
    }


# =============================================================================
# WEBSOCKET ENDPOINT - Voice interactions
# =============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for voice communication.

    Flow:
    1. Client connects and starts sending audio
    2. Audio is forwarded to OpenAI Realtime API
    3. OpenAI transcribes, understands intent, calls functions
    4. Function results trigger ui_update events to frontend
    5. OpenAI generates voice response sent back to client
    """
    await websocket.accept()
    logger.info("Voice client connected")

    if not OPENAI_API_KEY:
        await websocket.send_json({
            "type": "error",
            "error": {"message": "Voice features not configured - missing API key"}
        })
        await websocket.close()
        return

    # Create Realtime client
    realtime_client = RealtimeClient(OPENAI_API_KEY)

    # Audio queue for sending to client
    audio_queue = asyncio.Queue()

    async def on_audio_delta(audio_data: bytes):
        """Handle audio chunks from OpenAI - queue for sending to client"""
        await audio_queue.put(audio_data)

    async def on_event(event: dict):
        """
        Handle events from OpenAI.

        Some events need to be forwarded to the frontend:
        - clear_audio_queue: Stop playback on interruption
        - user_transcript: Show what user said
        - assistant_transcript: Show AI response text
        - error: Display errors
        """
        event_type = event.get("type")

        # Events to forward to frontend
        forward_events = [
            "clear_audio_queue",
            "user_transcript",
            "assistant_transcript",
            "error",
            "response.audio_transcript.delta"  # Real-time transcript
        ]

        if event_type in forward_events:
            try:
                await websocket.send_json(event)
            except Exception as e:
                logger.warning(f"Failed to send event to client: {e}")

    async def on_ui_update(ui_event: dict):
        """
        Handle UI update events - CRITICAL for voice-controlled UI.

        When OpenAI calls a function like search_products, we emit the
        result to the frontend so it can update the UI (show products,
        navigate, etc.)
        """
        try:
            await websocket.send_json(ui_event)
            logger.info(f"UI update sent: {ui_event.get('action')}")
        except Exception as e:
            logger.warning(f"Failed to send UI update: {e}")

    try:
        # Connect to OpenAI Realtime API
        await realtime_client.connect(on_audio_delta, on_event, on_ui_update)

        # Task to send audio back to client
        async def send_audio_to_client():
            while realtime_client.connected:
                try:
                    audio_data = await asyncio.wait_for(audio_queue.get(), timeout=0.1)
                    await websocket.send_bytes(audio_data)
                except asyncio.TimeoutError:
                    continue
                except Exception as e:
                    logger.error(f"Error sending audio to client: {e}")
                    break

        # Start audio sender task
        sender_task = asyncio.create_task(send_audio_to_client())

        # Main loop - receive audio from client and forward to OpenAI
        while True:
            message = await websocket.receive()

            if "bytes" in message:
                # Audio data from client microphone
                audio_data = message["bytes"]
                await realtime_client.send_audio(audio_data)

            elif "text" in message:
                # JSON control messages (if needed for future extensions)
                try:
                    data = message["text"]
                    logger.debug(f"Received text message: {data}")
                except Exception:
                    pass

    except WebSocketDisconnect:
        logger.info("Voice client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Cleanup
        await realtime_client.disconnect()
        try:
            sender_task.cancel()
        except:
            pass
        logger.info("Voice connection closed")


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8005,
        reload=True,
        log_level="info"
    )
