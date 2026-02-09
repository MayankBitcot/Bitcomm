# CLAUDE.md - Voice-Guided E-Commerce Project

## Project Overview

This is a **voice-guided e-commerce UI workflow system** - NOT a chatbot. Voice is an alternative input method that controls the SAME UI and calls the SAME APIs as manual interactions.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
│  Pages: Home, Products, Profile, Cart, Checkout, PaymentSuccess     │
│  Components: Navbar, VoiceController, ProductModal, CompareModal    │
│  Context: VoiceContext (WebSocket), CartContext (cart state)        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP: /api/products
                            │ WebSocket: /ws
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                             │
│  main.py: HTTP endpoints + WebSocket handler                        │
│  products.py: Product data + search_products() - SINGLE SOURCE      │
│  tools.py: OpenAI function definitions + handlers                   │
│  realtime_client.py: OpenAI Realtime API WebSocket client           │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    OpenAI Realtime API                               │
│              Speech-to-Text → LLM → Text-to-Speech                  │
│              Function Calling for UI control                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Critical Design Principles

### 1. Single Source of Truth
```python
# products.py - search_products() is used by BOTH:
# - HTTP API (GET /api/products)
# - Voice commands (via tools.py)

def search_products(query, category, min_price, max_price, brand, sort_by, limit):
    # This function is THE ONLY place product filtering happens
    pass
```

### 2. Voice → UI Event Flow
```
User speaks → OpenAI transcribes → OpenAI calls function →
Backend executes → Emits ui_update event → Frontend updates UI
```

### 3. UI Actions
```python
# tools.py - Each function returns a ui_action
result = {
    "success": True,
    "data": {...},
    "ui_action": {
        "type": "SHOW_PRODUCTS",      # Action type
        "navigate_to": "/products",    # Optional navigation
        "filters": {...}               # Applied filters
    }
}
```

## File Structure

```
BitComm/
├── backend/
│   ├── main.py              # FastAPI app, routes, WebSocket
│   ├── products.py          # Product data + search_products()
│   ├── tools.py             # OpenAI function definitions
│   ├── realtime_client.py   # OpenAI WebSocket client
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js           # Routes
│   │   ├── index.js         # Entry, providers
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Products.js  # Main shopping page
│   │   │   ├── Profile.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   └── PaymentSuccess.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── VoiceController.js  # Floating voice button
│   │   │   ├── ProductModal.js     # Product details popup
│   │   │   └── CompareModal.js     # Comparison popup
│   │   └── context/
│   │       ├── VoiceContext.js     # WebSocket, voice state
│   │       └── CartContext.js      # Cart state
│   └── package.json
├── PRD.md
├── README.md
└── CLAUDE.md                # This file
```

## Key Functions

### Backend

#### products.py
```python
def search_products(query, category, min_price, max_price, brand, sort_by, limit) -> dict:
    """Single source of truth for product queries"""

def get_product_by_id(product_id) -> dict:
    """Get single product"""

def get_product_by_index(products, index) -> dict:
    """Get product from list by 1-based index"""
```

#### tools.py
```python
TOOLS = [...]  # OpenAI function schemas
FUNCTION_MAP = {
    "search_products": handle_search_products,
    "get_product_details": handle_get_product_details,
    "compare_products": handle_compare_products,
    "add_to_cart": handle_add_to_cart,
    "navigate_to_page": handle_navigate_to_page
}
```

#### realtime_client.py
```python
class RealtimeClient:
    async def connect(on_audio_delta, on_event, on_ui_update):
        """Connect to OpenAI, set up callbacks"""

    async def _handle_function_call(event, on_event):
        """Execute function, emit ui_update to frontend"""
```

### Frontend

#### VoiceContext.js
```javascript
// Callbacks registered by Products page
registerProductsCallback(callback)      // Update product grid
registerFiltersCallback(callback)       // Update filter state
registerProductDetailCallback(callback) // Open product modal
registerCompareCallback(callback)       // Open compare modal
registerAddToCartCallback(callback)     // Add to cart

// Handle ui_update events from backend
handleUIUpdate(event) {
    switch (event.action) {
        case 'SHOW_PRODUCTS': ...
        case 'SHOW_PRODUCT_DETAILS': ...
        case 'COMPARE_PRODUCTS': ...
        case 'ADD_TO_CART': ...
        case 'NAVIGATE': ...
    }
}
```

#### CartContext.js
```javascript
addToCart(product)
removeFromCart(productId)
updateQuantity(productId, quantity)
clearCart()
isInCart(productId) -> boolean
totals: { itemCount, subtotal }
```

## Voice Commands

| Command | Function | UI Action |
|---------|----------|-----------|
| "Show me mobiles" | search_products | Navigate to /products, filter |
| "Laptops under 50k" | search_products | Navigate, filter by price |
| "Filter by Samsung" | search_products | Apply brand filter |
| "Sort by rating" | search_products | Apply sort |
| "Tell me about first one" | get_product_details | Open ProductModal |
| "Compare first and third" | compare_products | Open CompareModal |
| "Add first to cart" | add_to_cart | Add to CartContext |
| "Go to cart" | navigate_to_page | Navigate to /cart |
| "Checkout" | navigate_to_page | Navigate to /checkout |

## Adding New Features

### Adding a New Voice Command

1. **Add function schema to `tools.py`:**
```python
TOOLS.append({
    "type": "function",
    "name": "new_function",
    "description": "...",
    "parameters": {...}
})
```

2. **Add handler function:**
```python
def handle_new_function(**kwargs):
    # Do something
    return {
        "success": True,
        "data": {...},
        "ui_action": {
            "type": "NEW_ACTION",
            "navigate_to": "/some-page"  # optional
        }
    }
```

3. **Add to FUNCTION_MAP:**
```python
FUNCTION_MAP["new_function"] = handle_new_function
```

4. **Handle in VoiceContext.js:**
```javascript
case 'NEW_ACTION':
    // Update UI accordingly
    break;
```

### Adding a New Page

1. Create `frontend/src/pages/NewPage.js`
2. Add route in `App.js`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```
3. Add to navigation in `Navbar.js`
4. Add to `navigate_to_page` in `tools.py`:
```python
page_routes["new_page"] = "/new-page"
```

### Adding a New Product Field

1. Update product objects in `products.py`
2. Update `ProductCard` and `ProductModal` in frontend
3. Update comparison table in `CompareModal.js`

## Testing

### Manual Testing
1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm start`
3. Open http://localhost:3000
4. Test manual filters work
5. Click voice button, test voice commands

### Voice Commands to Test
```
"Show me mobile phones"
"Filter by Samsung"
"Laptops under 50000"
"Sort by price low to high"
"Tell me about the first product"
"Compare first and second"
"Add the first one to cart"
"Go to cart"
"Checkout"
```

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=sk-...
```

### Frontend (optional)
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
```

## Common Issues

### WebSocket Connection Failed
- Check OPENAI_API_KEY is set
- Check backend is running on port 8000
- Check browser console for errors

### Voice Not Working
- Check microphone permissions
- Use Chrome for best WebRTC support
- Check if AudioContext is created

### Products Not Updating from Voice
- Check VoiceContext callbacks are registered
- Check ui_update events in console
- Verify function returns correct ui_action

## Code Style

- **Python**: Follow PEP 8, use type hints
- **JavaScript**: Use functional components, hooks
- **No TypeScript**: Project uses plain JavaScript
- **Tailwind CSS**: Use utility classes for styling

## Dependencies

### Backend
- fastapi, uvicorn: Web framework
- websockets: OpenAI WebSocket client
- python-dotenv: Environment variables

### Frontend
- react, react-dom: UI framework
- react-router-dom: Routing
- lucide-react: Icons
- Tailwind CSS (via CDN): Styling
