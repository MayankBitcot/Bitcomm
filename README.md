# Voice-Guided E-Commerce System

A production-grade POC demonstrating voice-controlled shopping interface using OpenAI's Realtime API.

## Features

- **Voice Shopping**: Speak naturally to search, filter, and explore products
- **Same API for All**: Both manual UI and voice use the same `search_products` function
- **Real-time Response**: Instant UI updates when voice commands are processed
- **Multi-page Navigation**: Voice can navigate between Home, Products, and Profile pages

## Tech Stack

- **Frontend**: React (JavaScript, no TypeScript), Tailwind CSS
- **Backend**: Python FastAPI
- **Voice**: OpenAI Realtime API (WebSocket)
- **Transport**: HTTP for REST, WebSocket for voice

## Project Structure

```
BitComm/
├── backend/
│   ├── main.py              # FastAPI app with HTTP + WebSocket endpoints
│   ├── products.py          # Product data + search_products function
│   ├── tools.py             # OpenAI function definitions
│   ├── realtime_client.py   # OpenAI Realtime API client
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML with Tailwind CSS
│   ├── src/
│   │   ├── App.js           # Main app with routing
│   │   ├── pages/
│   │   │   ├── Home.js      # Landing page
│   │   │   ├── Products.js  # Product listing with filters
│   │   │   └── Profile.js   # User profile page
│   │   ├── components/
│   │   │   ├── Navbar.js    # Navigation bar
│   │   │   └── VoiceController.js  # Floating voice button
│   │   └── context/
│   │       └── VoiceContext.js     # Global voice state management
│   └── package.json
└── PRD.md                   # Product Requirements Document
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Run server
python main.py
```

Backend will run on http://localhost:8000

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start
```

Frontend will run on http://localhost:3000

## Voice Commands

| Command | Action |
|---------|--------|
| "Show me mobile phones" | Navigate to products, filter by mobiles |
| "Laptops under 50000" | Filter laptops with max price ₹50,000 |
| "Filter by Samsung" | Apply brand filter |
| "Sort by price low to high" | Apply sort |
| "Sort by rating" | Sort by highest rated |
| "Tell me about the first product" | Get details of product #1 |
| "Go to home page" | Navigate to home |
| "Show all products" | Clear filters, show all |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │  Products   │  │   Filters   │  │   VoiceController    │ │
│  │    Page     │◄─┤   Sidebar   │  │   (Global Button)    │ │
│  └──────┬──────┘  └─────────────┘  └──────────┬───────────┘ │
│         │                                      │             │
│    HTTP │ /api/products               WebSocket│ /ws        │
└─────────┼──────────────────────────────────────┼─────────────┘
          │                                      │
          ▼                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   REST Endpoints    │    │    WebSocket Handler        │ │
│  │  GET /api/products  │    │         /ws                 │ │
│  └──────────┬──────────┘    └──────────────┬──────────────┘ │
│             │                              │                 │
│             ▼                              ▼                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              search_products() - SINGLE SOURCE          ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   RealtimeClient                        ││
│  │              (OpenAI WebSocket)                         ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                      ┌────────────────────────┐
                      │  OpenAI Realtime API   │
                      │  (STT + LLM + TTS)     │
                      └────────────────────────┘
```

## Key Design Decisions

1. **Single API**: Both manual UI filters and voice commands call the same `search_products()` function
2. **UI Events**: When OpenAI calls a function, we emit `ui_update` events to the frontend via WebSocket
3. **State Sync**: Products page registers callbacks to receive voice-triggered updates
4. **No LLM for Data**: LLM only extracts intent; actual product data comes from backend

## API Reference

### GET /api/products

Search and filter products.

**Query Parameters:**
- `query` - Text search
- `category` - mobiles, laptops, accessories
- `min_price`, `max_price` - Price range
- `brand` - Brand name
- `sort_by` - price_asc, price_desc, rating, relevance

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 15,
    "filters_applied": {...}
  },
  "metadata": {
    "available_categories": [...],
    "available_brands": [...],
    "price_range": {"min": 199, "max": 249999}
  }
}
```

### WebSocket /ws

Real-time voice communication.

**Events to Frontend:**
- `ui_update` - Update UI based on voice command
- `user_transcript` - What user said
- `assistant_transcript` - AI response text
- `clear_audio_queue` - Stop playback on interruption

## License

MIT
