"""
OpenAI Realtime API Tool Definitions.

This module defines the tools (functions) that OpenAI can call during voice interactions.
The key principle: these tools call the SAME search_products function used by HTTP API.
"""

from typing import Dict, Any, Optional, List, Callable
from products import search_products, get_product_by_index, get_product_by_id, PRODUCTS

# =============================================================================
# TOOL DEFINITIONS (OpenAI Function Calling Schema)
# =============================================================================

TOOLS = [
    {
        "type": "function",
        "name": "search_products",
        "description": """Search and filter products in the e-commerce store.
Use this function when the user wants to:
- Find products (e.g., "show me laptops", "find phones under 20000")
- Filter products by category, brand, or price
- Sort products by price or rating
- Clear filters and show all products

The function returns matching products that will be displayed in the UI.""",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Text to search in product names and descriptions. Use for specific product searches."
                },
                "category": {
                    "type": "string",
                    "enum": ["mobiles", "laptops", "accessories"],
                    "description": "Filter by product category. Use 'mobiles' for phones/smartphones."
                },
                "min_price": {
                    "type": "integer",
                    "description": "Minimum price in INR (Indian Rupees). Example: 10000 for ₹10,000"
                },
                "max_price": {
                    "type": "integer",
                    "description": "Maximum price in INR (Indian Rupees). Example: 50000 for ₹50,000. Common shortcuts: '10k' = 10000, '1 lakh' = 100000"
                },
                "brand": {
                    "type": "string",
                    "description": "Filter by brand name. Examples: Samsung, Apple, OnePlus, Dell, HP, Sony"
                },
                "sort_by": {
                    "type": "string",
                    "enum": ["price_asc", "price_desc", "rating", "relevance"],
                    "description": "Sort order. price_asc = low to high, price_desc = high to low, rating = best rated first"
                }
            },
            "required": []
        }
    },
    {
        "type": "function",
        "name": "get_product_details",
        "description": """Get detailed information about a specific product and show it in a popup.
Use when the user asks about a particular product by:
- Position: "tell me about the first product", "details of the third one", "what are the specs of second one"
- Name: "tell me more about the iPhone", "show me details of MacBook"

This opens a popup showing full specifications and details.""",
        "parameters": {
            "type": "object",
            "properties": {
                "position": {
                    "type": "integer",
                    "description": "Position of the product in the current list (1-based). Use when user says 'first', 'second', 'third', etc. First=1, Second=2, Third=3."
                },
                "product_name": {
                    "type": "string",
                    "description": "Partial or full product name to search for"
                }
            },
            "required": []
        }
    },
    {
        "type": "function",
        "name": "compare_products",
        "description": """Compare two or more products side by side.
Use when the user wants to compare products:
- "compare first and third product"
- "compare iPhone and Samsung"
- "show me comparison of first three products"

This opens a comparison popup showing products side by side.""",
        "parameters": {
            "type": "object",
            "properties": {
                "positions": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "List of product positions (1-based) to compare. Example: [1, 3] for first and third products."
                },
                "product_names": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of product names to compare"
                }
            },
            "required": []
        }
    },
    {
        "type": "function",
        "name": "add_to_cart",
        "description": """Add a product to the shopping cart.
Use when the user wants to:
- "add first product to cart"
- "add this to my cart"
- "I want to buy the second one"
- "put the iPhone in cart"

This adds the product to cart and updates the UI.""",
        "parameters": {
            "type": "object",
            "properties": {
                "position": {
                    "type": "integer",
                    "description": "Position of the product in the current list (1-based)."
                },
                "product_name": {
                    "type": "string",
                    "description": "Product name to add to cart"
                }
            },
            "required": []
        }
    },
    {
        "type": "function",
        "name": "navigate_to_page",
        "description": """Navigate to a different page in the application.
Use when the user wants to:
- Go to home page: "take me home", "go to homepage"
- Go to products: "show products", "go to shop"
- Go to profile: "open my profile", "go to account"
- Go to cart: "open my cart", "show cart", "go to cart"
- Checkout: "checkout", "proceed to payment", "place order"
""",
        "parameters": {
            "type": "object",
            "properties": {
                "page": {
                    "type": "string",
                    "enum": ["home", "products", "profile", "cart", "checkout"],
                    "description": "The page to navigate to"
                }
            },
            "required": ["page"]
        }
    }
]


# =============================================================================
# STATE MANAGEMENT
# Storage for last shown products (for follow-up queries)
# =============================================================================

class SessionState:
    """Manages state for voice sessions to handle follow-up queries"""

    def __init__(self):
        self._last_products: List[Dict[str, Any]] = []
        self._last_filters: Dict[str, Any] = {}

    def set_products(self, products: List[Dict[str, Any]], filters: Dict[str, Any]):
        """Store the last shown products for follow-up queries"""
        self._last_products = products
        self._last_filters = filters

    def get_last_products(self) -> List[Dict[str, Any]]:
        """Get the last shown products"""
        return self._last_products

    def get_last_filters(self) -> Dict[str, Any]:
        """Get the last applied filters"""
        return self._last_filters

    def clear(self):
        """Clear session state"""
        self._last_products = []
        self._last_filters = {}


# Global session state (per-connection state should be managed by RealtimeClient)
_session_state = SessionState()


# =============================================================================
# FUNCTION IMPLEMENTATIONS
# =============================================================================

def handle_search_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    brand: Optional[str] = None,
    sort_by: str = "relevance",
    **kwargs  # Catch any extra args
) -> Dict[str, Any]:
    """
    Handle search_products function call from OpenAI.

    This wraps the core search_products function and adds:
    - State management for follow-up queries
    - UI action metadata for frontend
    """

    # Call the core search function (SINGLE SOURCE OF TRUTH)
    result = search_products(
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
        brand=brand,
        sort_by=sort_by
    )

    # Store products for follow-up queries
    if result["success"]:
        _session_state.set_products(
            result["data"]["products"],
            result["data"]["filters_applied"]
        )

    # Add UI action for frontend
    result["ui_action"] = {
        "type": "SHOW_PRODUCTS",
        "navigate_to": "/products",
        "filters": result["data"]["filters_applied"]
    }

    return result


def handle_get_product_details(
    position: Optional[int] = None,
    product_name: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Handle get_product_details function call from OpenAI.
    Opens a popup with product details.
    """

    product = None
    last_products = _session_state.get_last_products()

    # Try to find by position in last shown products
    if position is not None:
        if last_products:
            product = get_product_by_index(last_products, position)
        else:
            # No products shown yet, search all products
            if 1 <= position <= len(PRODUCTS):
                product = PRODUCTS[position - 1]

    # Try to find by name
    elif product_name:
        name_lower = product_name.lower()
        # First try in last shown products
        for p in last_products:
            if name_lower in p["name"].lower():
                product = p
                break
        # If not found, try all products
        if not product:
            for p in PRODUCTS:
                if name_lower in p["name"].lower():
                    product = p
                    break

    if product:
        return {
            "success": True,
            "data": {
                "product": product,
                "position": position
            },
            "ui_action": {
                "type": "SHOW_PRODUCT_DETAILS",
                "product_id": product["id"]
            }
        }
    else:
        return {
            "success": False,
            "error": "Could not find the requested product. Please try again with a different position or name.",
            "ui_action": {"type": "NO_ACTION"}
        }


def handle_compare_products(
    positions: Optional[List[int]] = None,
    product_names: Optional[List[str]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Handle compare_products function call from OpenAI.
    Opens a comparison popup with selected products.
    """

    products_to_compare = []
    last_products = _session_state.get_last_products()

    # Find by positions
    if positions:
        for pos in positions:
            if last_products:
                product = get_product_by_index(last_products, pos)
            else:
                product = PRODUCTS[pos - 1] if 1 <= pos <= len(PRODUCTS) else None

            if product and product not in products_to_compare:
                products_to_compare.append(product)

    # Find by names
    if product_names:
        for name in product_names:
            name_lower = name.lower()
            # Search in last products first
            found = False
            for p in last_products:
                if name_lower in p["name"].lower() and p not in products_to_compare:
                    products_to_compare.append(p)
                    found = True
                    break
            # Search all products if not found
            if not found:
                for p in PRODUCTS:
                    if name_lower in p["name"].lower() and p not in products_to_compare:
                        products_to_compare.append(p)
                        break

    if len(products_to_compare) >= 2:
        return {
            "success": True,
            "data": {
                "products": products_to_compare,
                "count": len(products_to_compare)
            },
            "ui_action": {
                "type": "COMPARE_PRODUCTS"
            }
        }
    else:
        return {
            "success": False,
            "error": f"Need at least 2 products to compare. Found {len(products_to_compare)}.",
            "ui_action": {"type": "NO_ACTION"}
        }


def handle_add_to_cart(
    position: Optional[int] = None,
    product_name: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Handle add_to_cart function call from OpenAI.
    Adds product to cart and updates UI.
    """

    product = None
    last_products = _session_state.get_last_products()

    # Find by position
    if position is not None:
        if last_products:
            product = get_product_by_index(last_products, position)
        else:
            if 1 <= position <= len(PRODUCTS):
                product = PRODUCTS[position - 1]

    # Find by name
    elif product_name:
        name_lower = product_name.lower()
        for p in last_products:
            if name_lower in p["name"].lower():
                product = p
                break
        if not product:
            for p in PRODUCTS:
                if name_lower in p["name"].lower():
                    product = p
                    break

    if product:
        if not product.get("in_stock", True):
            return {
                "success": False,
                "error": f"{product['name']} is currently out of stock.",
                "ui_action": {"type": "NO_ACTION"}
            }

        return {
            "success": True,
            "data": {
                "product": product,
                "message": f"Added {product['name']} to cart"
            },
            "ui_action": {
                "type": "ADD_TO_CART"
            }
        }
    else:
        return {
            "success": False,
            "error": "Could not find the product. Please specify which product you want to add.",
            "ui_action": {"type": "NO_ACTION"}
        }


def handle_navigate_to_page(page: str, **kwargs) -> Dict[str, Any]:
    """
    Handle navigation requests from voice commands.
    """

    page_routes = {
        "home": "/",
        "products": "/products",
        "profile": "/profile",
        "cart": "/cart",
        "checkout": "/checkout"
    }

    if page not in page_routes:
        return {
            "success": False,
            "error": f"Unknown page: {page}",
            "ui_action": {"type": "NO_ACTION"}
        }

    return {
        "success": True,
        "data": {
            "page": page,
            "route": page_routes[page]
        },
        "ui_action": {
            "type": "NAVIGATE",
            "navigate_to": page_routes[page]
        }
    }


# =============================================================================
# FUNCTION MAP - Maps function names to implementations
# =============================================================================

FUNCTION_MAP: Dict[str, Callable] = {
    "search_products": handle_search_products,
    "get_product_details": handle_get_product_details,
    "compare_products": handle_compare_products,
    "add_to_cart": handle_add_to_cart,
    "navigate_to_page": handle_navigate_to_page
}


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_session_state() -> SessionState:
    """Get the current session state"""
    return _session_state


def reset_session_state():
    """Reset the session state (call on new connection)"""
    _session_state.clear()
