# Voice-Guided E-Commerce UI System

## Project Overview

A production-grade POC demonstrating voice-guided UI workflow for an e-commerce application.

**Key Principle**: Voice is an alternative input method, NOT a chatbot. It controls the same UI, calls the same APIs, and behaves exactly like typing or clicking.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (JavaScript, no TypeScript) |
| Backend | Python (FastAPI) |
| Voice Transport | WebSocket (OpenAI Realtime API) |
| API Transport | HTTP REST |
| Styling | Tailwind CSS |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────────────┐   │
│  │  Home   │  │Products │  │ Profile │  │   VoiceController    │   │
│  │  Page   │  │  Page   │  │  Page   │  │   (Global, Sticky)   │   │
│  └─────────┘  └────┬────┘  └─────────┘  └──────────┬───────────┘   │
│                    │                               │               │
│              ┌─────┴─────┐                   ┌─────┴─────┐         │
│              │  Filters  │                   │ WebSocket │         │
│              │  + Grid   │                   │  Client   │         │
│              └─────┬─────┘                   └─────┬─────┘         │
│                    │                               │               │
└────────────────────┼───────────────────────────────┼───────────────┘
                     │ HTTP                          │ WebSocket
                     │ /api/products                 │ /ws
                     ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND (FastAPI)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐           ┌────────────────────────────┐   │
│  │   REST Endpoints   │           │    WebSocket Handler       │   │
│  │  GET /api/products │           │         /ws                │   │
│  └─────────┬──────────┘           └──────────┬─────────────────┘   │
│            │                                  │                     │
│            │         ┌────────────────────────┤                     │
│            │         │                        │                     │
│            ▼         ▼                        ▼                     │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐    │
│  │    search_products()    │    │     RealtimeClient          │    │
│  │   (Single Source API)   │◄───│  (OpenAI WebSocket)         │    │
│  └─────────────────────────┘    └──────────────┬──────────────┘    │
│            │                                   │                    │
│            ▼                                   │                    │
│  ┌─────────────────────────┐                   │                    │
│  │     Product Data        │                   │                    │
│  │   (In-memory/JSON)      │                   │                    │
│  └─────────────────────────┘                   │                    │
└────────────────────────────────────────────────┼────────────────────┘
                                                 │
                                                 ▼
                                    ┌────────────────────────┐
                                    │  OpenAI Realtime API   │
                                    │  (STT + LLM + TTS)     │
                                    └────────────────────────┘
```

---

## Data Flow

### Manual Interaction (Type/Click)
```
User clicks filter → Frontend state updates → HTTP call to /api/products → UI renders
```

### Voice Interaction
```
User speaks → Audio → WebSocket → OpenAI transcribes →
OpenAI calls search_products function → Backend executes →
Result sent to:
  1. OpenAI (for voice response generation)
  2. Frontend via WebSocket (ui_update event for UI rendering)
→ OpenAI speaks response + Frontend updates UI simultaneously
```

### Critical Design Decision
Both flows end up calling the **same `search_products()` function**. Voice doesn't have special APIs.

---

## Directory Structure

```
BitComm/
├── PRD.md                    # This document
├── backend/
│   ├── main.py              # FastAPI app, HTTP + WebSocket endpoints
│   ├── realtime_client.py   # OpenAI Realtime API WebSocket client
│   ├── tools.py             # Function definitions for OpenAI
│   ├── products.py          # Product data + search_products function
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (OPENAI_API_KEY)
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── pages/
        │   ├── Home.js
        │   ├── Products.js
        │   └── Profile.js
        ├── components/
        │   ├── Navbar.js
        │   ├── ProductGrid.js
        │   ├── ProductCard.js
        │   ├── FilterSidebar.js
        │   ├── SearchBar.js
        │   └── VoiceController.js
        ├── hooks/
        │   ├── useProducts.js
        │   └── useVoice.js
        ├── context/
        │   └── VoiceContext.js
        └── styles/
            └── index.css
```

---

## Backend API

### HTTP Endpoints

#### GET /api/products
Search and filter products.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| query | string | null | Text search in name/description |
| category | string | null | Filter by category |
| min_price | int | null | Minimum price filter |
| max_price | int | null | Maximum price filter |
| brand | string | null | Filter by brand |
| sort_by | string | "relevance" | Sort: price_asc, price_desc, rating, relevance |
| limit | int | 20 | Max products to return |

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 15,
    "filters_applied": {
      "category": "mobiles",
      "max_price": 10000
    }
  },
  "metadata": {
    "available_categories": ["mobiles", "laptops", "accessories"],
    "available_brands": ["Samsung", "Apple", "OnePlus", ...],
    "price_range": {"min": 199, "max": 149999}
  }
}
```

### WebSocket Endpoint

#### WS /ws
Real-time voice communication.

**Client → Server:**
- Binary audio data (PCM16, 24kHz)
- JSON control messages (optional)

**Server → Client:**
- Binary audio data (AI response)
- JSON events:
  - `ui_update`: Update UI based on voice command
  - `transcript_update`: Show transcription
  - `clear_audio_queue`: Handle interruption
  - `error`: Error messages

**ui_update Event Format:**
```json
{
  "type": "ui_update",
  "action": "SHOW_PRODUCTS",
  "navigate_to": "/products",
  "filters": {
    "category": "mobiles",
    "max_price": 10000
  },
  "data": {
    "products": [...],
    "total": 7
  },
  "assistant_message": "Here are 7 mobile phones under ₹10,000"
}
```

---

## Product Data Schema

```json
{
  "id": "MOB001",
  "name": "Samsung Galaxy M14 5G",
  "category": "mobiles",
  "brand": "Samsung",
  "price": 11999,
  "rating": 4.2,
  "thumbnail": "/images/mob001.jpg",
  "specs": {
    "display": "6.6 inch FHD+",
    "processor": "Exynos 1330",
    "ram": "4GB",
    "storage": "64GB",
    "battery": "6000mAh",
    "camera": "50MP Triple"
  },
  "in_stock": true,
  "description": "Budget 5G smartphone with massive battery"
}
```

### Product Categories & Counts
| Category | Products | Price Range |
|----------|----------|-------------|
| Mobiles | 12 | ₹6,999 - ₹1,49,999 |
| Laptops | 10 | ₹29,999 - ₹2,49,999 |
| Accessories | 12 | ₹199 - ₹24,999 |

---

## Voice Commands Supported

### Product Search
| Voice Command | Action | Parameters |
|--------------|--------|------------|
| "Show me mobile phones" | Navigate + Filter | category: mobiles |
| "Show laptops under 50000" | Navigate + Filter | category: laptops, max_price: 50000 |
| "Filter by Samsung" | Apply Filter | brand: Samsung |
| "Sort by price low to high" | Apply Sort | sort_by: price_asc |
| "Show me everything" | Clear Filters | (none) |

### Product Details
| Voice Command | Action |
|--------------|--------|
| "Tell me about the first product" | Show details of product at index 0 |
| "What are the specs of the second one" | Show specs of product at index 1 |
| "Compare first and third" | Show comparison view |

### Navigation
| Voice Command | Action |
|--------------|--------|
| "Go to home page" | Navigate to / |
| "Show all products" | Navigate to /products |
| "Open my profile" | Navigate to /profile |

---

## OpenAI Function Definition

```json
{
  "type": "function",
  "name": "search_products",
  "description": "Search and filter products in the e-commerce store. Use this when user wants to find, filter, or browse products.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search text to find in product names"
      },
      "category": {
        "type": "string",
        "enum": ["mobiles", "laptops", "accessories"],
        "description": "Product category to filter by"
      },
      "min_price": {
        "type": "integer",
        "description": "Minimum price in INR"
      },
      "max_price": {
        "type": "integer",
        "description": "Maximum price in INR"
      },
      "brand": {
        "type": "string",
        "description": "Brand name to filter by"
      },
      "sort_by": {
        "type": "string",
        "enum": ["price_asc", "price_desc", "rating", "relevance"],
        "description": "Sort order for results"
      }
    }
  }
}
```

---

## Frontend State Management

### Global State (Context)
- `voiceSession`: WebSocket connection state
- `isListening`: Whether voice is active
- `lastProducts`: Products from last query (for follow-ups)

### Products Page State
- `products`: Current product list
- `filters`: Active filters
- `sortBy`: Current sort order
- `loading`: Loading state

### State Sync (Voice → UI)
When `ui_update` event received:
1. If `navigate_to` present → Router navigates
2. Update `filters` state
3. Update `products` from `data.products`
4. Display `assistant_message` in voice transcript area

---

## UI Components

### VoiceController (Global)
- Floating button (bottom-right, z-50)
- Persistent across all pages
- Visual states: idle, listening, processing, speaking
- Shows real-time transcript
- Waveform animation when active

### FilterSidebar
- Category checkboxes
- Price range slider (₹0 - ₹250,000)
- Brand multi-select
- Clear all filters button

### ProductGrid
- Responsive grid (1-4 columns)
- ProductCard with image, name, price, rating
- Loading skeleton
- Empty state

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| OpenAI connection fails | Show error toast, disable voice button |
| Invalid voice command | AI asks for clarification |
| No products match | Show empty state + AI explains |
| Network error | Retry with exponential backoff |
| Audio permission denied | Show permission request modal |

---

## Success Criteria

1. **Functional Parity**: Voice search returns identical results to typed search
2. **UI Stability**: UI never breaks due to LLM errors
3. **Single API**: Same `search_products()` powers all interactions
4. **Responsiveness**: UI updates < 200ms after voice command processed
5. **Professional UX**: Demo feels like a real e-commerce site

---

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] PRD documentation
- [ ] Backend product data
- [ ] search_products API
- [ ] Basic React app with routing

### Phase 2: UI Components
- [ ] Product grid and cards
- [ ] Filter sidebar
- [ ] Navigation

### Phase 3: Voice Integration
- [ ] WebSocket endpoint
- [ ] OpenAI Realtime client
- [ ] VoiceController component
- [ ] ui_update event handling

### Phase 4: Polish
- [ ] Animations and transitions
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsiveness

