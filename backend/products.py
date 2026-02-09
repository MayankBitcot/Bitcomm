"""
Product data and search functionality.
This is the SINGLE SOURCE OF TRUTH for all product operations.
Used by both HTTP API and voice commands.
"""

from typing import Optional, List, Dict, Any

# =============================================================================
# PRODUCT DATA
# Realistic e-commerce products with Indian pricing
# =============================================================================

PRODUCTS: List[Dict[str, Any]] = [
    # =========================================================================
    # MOBILES (12 products)
    # =========================================================================
    {
        "id": "MOB001",
        "name": "Samsung Galaxy M14 5G",
        "category": "mobiles",
        "brand": "Samsung",
        "price": 11999,
        "rating": 4.2,
        "thumbnail": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.6 inch FHD+ LCD",
            "processor": "Exynos 1330",
            "ram": "4GB",
            "storage": "64GB",
            "battery": "6000mAh",
            "camera": "50MP Triple Camera"
        },
        "in_stock": True,
        "description": "Budget 5G smartphone with massive 6000mAh battery and 50MP camera"
    },
    {
        "id": "MOB002",
        "name": "iPhone 15",
        "category": "mobiles",
        "brand": "Apple",
        "price": 79999,
        "rating": 4.7,
        "thumbnail": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.1 inch Super Retina XDR OLED",
            "processor": "A16 Bionic",
            "ram": "6GB",
            "storage": "128GB",
            "battery": "3349mAh",
            "camera": "48MP Dual Camera"
        },
        "in_stock": True,
        "description": "Latest iPhone with Dynamic Island, USB-C, and advanced camera system"
    },
    {
        "id": "MOB003",
        "name": "OnePlus 12",
        "category": "mobiles",
        "brand": "OnePlus",
        "price": 64999,
        "rating": 4.5,
        "thumbnail": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.82 inch 2K LTPO AMOLED",
            "processor": "Snapdragon 8 Gen 3",
            "ram": "12GB",
            "storage": "256GB",
            "battery": "5400mAh",
            "camera": "50MP Hasselblad Triple"
        },
        "in_stock": True,
        "description": "Flagship killer with Hasselblad cameras and 100W fast charging"
    },
    {
        "id": "MOB004",
        "name": "Redmi Note 13 Pro",
        "category": "mobiles",
        "brand": "Xiaomi",
        "price": 24999,
        "rating": 4.3,
        "thumbnail": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.67 inch AMOLED 120Hz",
            "processor": "Snapdragon 7s Gen 2",
            "ram": "8GB",
            "storage": "128GB",
            "battery": "5100mAh",
            "camera": "200MP Main Camera"
        },
        "in_stock": True,
        "description": "200MP camera phone with premium AMOLED display"
    },
    {
        "id": "MOB005",
        "name": "Samsung Galaxy S24 Ultra",
        "category": "mobiles",
        "brand": "Samsung",
        "price": 134999,
        "rating": 4.8,
        "thumbnail": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.8 inch QHD+ Dynamic AMOLED",
            "processor": "Snapdragon 8 Gen 3",
            "ram": "12GB",
            "storage": "256GB",
            "battery": "5000mAh",
            "camera": "200MP Quad Camera with S Pen"
        },
        "in_stock": True,
        "description": "Ultimate Android flagship with S Pen and Galaxy AI features"
    },
    {
        "id": "MOB006",
        "name": "Realme Narzo 60",
        "category": "mobiles",
        "brand": "Realme",
        "price": 14999,
        "rating": 4.1,
        "thumbnail": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.4 inch AMOLED 90Hz",
            "processor": "MediaTek Dimensity 6020",
            "ram": "6GB",
            "storage": "128GB",
            "battery": "5000mAh",
            "camera": "64MP Dual Camera"
        },
        "in_stock": True,
        "description": "Stylish mid-range phone with AMOLED display and fast charging"
    },
    {
        "id": "MOB007",
        "name": "iPhone 15 Pro Max",
        "category": "mobiles",
        "brand": "Apple",
        "price": 149999,
        "rating": 4.9,
        "thumbnail": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.7 inch Super Retina XDR OLED",
            "processor": "A17 Pro",
            "ram": "8GB",
            "storage": "256GB",
            "battery": "4422mAh",
            "camera": "48MP Pro Camera System"
        },
        "in_stock": False,
        "description": "Most powerful iPhone ever with titanium design and A17 Pro chip"
    },
    {
        "id": "MOB008",
        "name": "Poco X6 Pro",
        "category": "mobiles",
        "brand": "Poco",
        "price": 26999,
        "rating": 4.4,
        "thumbnail": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.67 inch AMOLED 120Hz",
            "processor": "MediaTek Dimensity 8300 Ultra",
            "ram": "8GB",
            "storage": "256GB",
            "battery": "5000mAh",
            "camera": "64MP OIS Triple Camera"
        },
        "in_stock": True,
        "description": "Performance beast with flagship-level gaming capabilities"
    },
    {
        "id": "MOB009",
        "name": "Vivo V30 Pro",
        "category": "mobiles",
        "brand": "Vivo",
        "price": 46999,
        "rating": 4.3,
        "thumbnail": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.78 inch AMOLED 120Hz",
            "processor": "MediaTek Dimensity 8200",
            "ram": "12GB",
            "storage": "256GB",
            "battery": "5000mAh",
            "camera": "50MP ZEISS Triple Camera"
        },
        "in_stock": True,
        "description": "Camera-focused phone with ZEISS optics and studio-quality portraits"
    },
    {
        "id": "MOB010",
        "name": "Motorola Edge 50 Pro",
        "category": "mobiles",
        "brand": "Motorola",
        "price": 35999,
        "rating": 4.2,
        "thumbnail": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.7 inch pOLED 144Hz",
            "processor": "Snapdragon 7 Gen 3",
            "ram": "8GB",
            "storage": "256GB",
            "battery": "4500mAh",
            "camera": "50MP Triple Camera"
        },
        "in_stock": True,
        "description": "Premium design with 125W TurboPower charging"
    },
    {
        "id": "MOB011",
        "name": "Nothing Phone 2a",
        "category": "mobiles",
        "brand": "Nothing",
        "price": 23999,
        "rating": 4.4,
        "thumbnail": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.7 inch AMOLED 120Hz",
            "processor": "MediaTek Dimensity 7200 Pro",
            "ram": "8GB",
            "storage": "128GB",
            "battery": "5000mAh",
            "camera": "50MP Dual Camera"
        },
        "in_stock": True,
        "description": "Unique Glyph interface with clean Nothing OS experience"
    },
    {
        "id": "MOB012",
        "name": "iQOO Neo 9 Pro",
        "category": "mobiles",
        "brand": "iQOO",
        "price": 36999,
        "rating": 4.5,
        "thumbnail": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&h=300&fit=crop",
        "specs": {
            "display": "6.78 inch AMOLED 144Hz",
            "processor": "Snapdragon 8 Gen 2",
            "ram": "8GB",
            "storage": "256GB",
            "battery": "5160mAh",
            "camera": "50MP OIS Dual Camera"
        },
        "in_stock": True,
        "description": "Gaming powerhouse with flagship Snapdragon processor"
    },

    # =========================================================================
    # LAPTOPS (10 products)
    # =========================================================================
    {
        "id": "LAP001",
        "name": "MacBook Air M3",
        "category": "laptops",
        "brand": "Apple",
        "price": 114999,
        "rating": 4.8,
        "thumbnail": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
        "specs": {
            "display": "13.6 inch Liquid Retina",
            "processor": "Apple M3 8-core",
            "ram": "8GB",
            "storage": "256GB SSD",
            "battery": "18 hours",
            "graphics": "10-core GPU"
        },
        "in_stock": True,
        "description": "Supercharged by M3 chip with all-day battery life"
    },
    {
        "id": "LAP002",
        "name": "Dell XPS 15",
        "category": "laptops",
        "brand": "Dell",
        "price": 169999,
        "rating": 4.6,
        "thumbnail": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&h=300&fit=crop",
        "specs": {
            "display": "15.6 inch 3.5K OLED",
            "processor": "Intel Core i7-13700H",
            "ram": "16GB",
            "storage": "512GB SSD",
            "battery": "13 hours",
            "graphics": "NVIDIA RTX 4060"
        },
        "in_stock": True,
        "description": "Premium ultrabook with stunning OLED display"
    },
    {
        "id": "LAP003",
        "name": "HP Pavilion 15",
        "category": "laptops",
        "brand": "HP",
        "price": 54999,
        "rating": 4.2,
        "thumbnail": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
        "specs": {
            "display": "15.6 inch FHD IPS",
            "processor": "AMD Ryzen 5 7530U",
            "ram": "8GB",
            "storage": "512GB SSD",
            "battery": "8 hours",
            "graphics": "AMD Radeon Graphics"
        },
        "in_stock": True,
        "description": "Reliable everyday laptop with modern design"
    },
    {
        "id": "LAP004",
        "name": "Lenovo ThinkPad X1 Carbon",
        "category": "laptops",
        "brand": "Lenovo",
        "price": 189999,
        "rating": 4.7,
        "thumbnail": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&h=300&fit=crop",
        "specs": {
            "display": "14 inch 2.8K OLED",
            "processor": "Intel Core Ultra 7 155H",
            "ram": "32GB",
            "storage": "1TB SSD",
            "battery": "15 hours",
            "graphics": "Intel Arc Graphics"
        },
        "in_stock": True,
        "description": "Ultimate business ultrabook with military-grade durability"
    },
    {
        "id": "LAP005",
        "name": "ASUS ROG Strix G16",
        "category": "laptops",
        "brand": "ASUS",
        "price": 134999,
        "rating": 4.5,
        "thumbnail": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=300&fit=crop",
        "specs": {
            "display": "16 inch QHD 240Hz",
            "processor": "Intel Core i9-13980HX",
            "ram": "16GB",
            "storage": "1TB SSD",
            "battery": "4 hours",
            "graphics": "NVIDIA RTX 4070"
        },
        "in_stock": True,
        "description": "High-performance gaming laptop with RGB lighting"
    },
    {
        "id": "LAP006",
        "name": "Acer Aspire 5",
        "category": "laptops",
        "brand": "Acer",
        "price": 42999,
        "rating": 4.1,
        "thumbnail": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
        "specs": {
            "display": "15.6 inch FHD IPS",
            "processor": "Intel Core i5-1235U",
            "ram": "8GB",
            "storage": "512GB SSD",
            "battery": "10 hours",
            "graphics": "Intel Iris Xe"
        },
        "in_stock": True,
        "description": "Budget-friendly laptop perfect for students"
    },
    {
        "id": "LAP007",
        "name": "MacBook Pro 14 M3 Pro",
        "category": "laptops",
        "brand": "Apple",
        "price": 199999,
        "rating": 4.9,
        "thumbnail": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
        "specs": {
            "display": "14.2 inch Liquid Retina XDR",
            "processor": "Apple M3 Pro 12-core",
            "ram": "18GB",
            "storage": "512GB SSD",
            "battery": "17 hours",
            "graphics": "18-core GPU"
        },
        "in_stock": False,
        "description": "Pro laptop for demanding creative workflows"
    },
    {
        "id": "LAP008",
        "name": "MSI Katana 15",
        "category": "laptops",
        "brand": "MSI",
        "price": 84999,
        "rating": 4.3,
        "thumbnail": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=300&fit=crop",
        "specs": {
            "display": "15.6 inch FHD 144Hz",
            "processor": "Intel Core i7-13620H",
            "ram": "16GB",
            "storage": "512GB SSD",
            "battery": "5 hours",
            "graphics": "NVIDIA RTX 4060"
        },
        "in_stock": True,
        "description": "Affordable gaming laptop with great performance"
    },
    {
        "id": "LAP009",
        "name": "HP Spectre x360",
        "category": "laptops",
        "brand": "HP",
        "price": 159999,
        "rating": 4.6,
        "thumbnail": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&h=300&fit=crop",
        "specs": {
            "display": "13.5 inch 3K2K OLED Touch",
            "processor": "Intel Core Ultra 7 155H",
            "ram": "16GB",
            "storage": "1TB SSD",
            "battery": "14 hours",
            "graphics": "Intel Arc Graphics"
        },
        "in_stock": True,
        "description": "Stunning 2-in-1 convertible with pen support"
    },
    {
        "id": "LAP010",
        "name": "Lenovo IdeaPad Slim 3",
        "category": "laptops",
        "brand": "Lenovo",
        "price": 36999,
        "rating": 4.0,
        "thumbnail": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
        "specs": {
            "display": "15.6 inch FHD",
            "processor": "AMD Ryzen 3 7320U",
            "ram": "8GB",
            "storage": "256GB SSD",
            "battery": "8 hours",
            "graphics": "AMD Radeon Graphics"
        },
        "in_stock": True,
        "description": "Entry-level laptop for basic computing needs"
    },

    # =========================================================================
    # ACCESSORIES (12 products)
    # =========================================================================
    {
        "id": "ACC001",
        "name": "Sony WH-1000XM5",
        "category": "accessories",
        "brand": "Sony",
        "price": 29999,
        "rating": 4.8,
        "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        "specs": {
            "type": "Over-ear Headphones",
            "connectivity": "Bluetooth 5.2",
            "battery": "30 hours",
            "features": "ANC, LDAC, Multipoint"
        },
        "in_stock": True,
        "description": "Industry-leading noise cancellation headphones"
    },
    {
        "id": "ACC002",
        "name": "Apple AirPods Pro 2",
        "category": "accessories",
        "brand": "Apple",
        "price": 24999,
        "rating": 4.7,
        "thumbnail": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop",
        "specs": {
            "type": "True Wireless Earbuds",
            "connectivity": "Bluetooth 5.3",
            "battery": "6 hours (30 with case)",
            "features": "ANC, Adaptive Audio, USB-C"
        },
        "in_stock": True,
        "description": "Premium earbuds with Adaptive Audio and USB-C"
    },
    {
        "id": "ACC003",
        "name": "Samsung Galaxy Watch 6",
        "category": "accessories",
        "brand": "Samsung",
        "price": 28999,
        "rating": 4.4,
        "thumbnail": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
        "specs": {
            "type": "Smartwatch",
            "display": "1.5 inch AMOLED",
            "battery": "40 hours",
            "features": "Health tracking, GPS, NFC"
        },
        "in_stock": True,
        "description": "Advanced health tracking with sleek design"
    },
    {
        "id": "ACC004",
        "name": "Logitech MX Master 3S",
        "category": "accessories",
        "brand": "Logitech",
        "price": 9999,
        "rating": 4.6,
        "thumbnail": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
        "specs": {
            "type": "Wireless Mouse",
            "connectivity": "Bluetooth, USB receiver",
            "battery": "70 days",
            "features": "8000 DPI, MagSpeed scroll"
        },
        "in_stock": True,
        "description": "Professional productivity mouse with quiet clicks"
    },
    {
        "id": "ACC005",
        "name": "Apple Watch Ultra 2",
        "category": "accessories",
        "brand": "Apple",
        "price": 89999,
        "rating": 4.9,
        "thumbnail": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
        "specs": {
            "type": "Smartwatch",
            "display": "1.92 inch OLED",
            "battery": "36 hours",
            "features": "Diving, GPS, Action Button"
        },
        "in_stock": True,
        "description": "Most rugged Apple Watch for extreme adventures"
    },
    {
        "id": "ACC006",
        "name": "JBL Flip 6",
        "category": "accessories",
        "brand": "JBL",
        "price": 9999,
        "rating": 4.5,
        "thumbnail": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
        "specs": {
            "type": "Portable Speaker",
            "connectivity": "Bluetooth 5.1",
            "battery": "12 hours",
            "features": "IP67, PartyBoost"
        },
        "in_stock": True,
        "description": "Portable waterproof speaker with powerful bass"
    },
    {
        "id": "ACC007",
        "name": "Anker PowerCore 26800",
        "category": "accessories",
        "brand": "Anker",
        "price": 4999,
        "rating": 4.4,
        "thumbnail": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop",
        "specs": {
            "type": "Power Bank",
            "capacity": "26800mAh",
            "output": "3A Max",
            "features": "Dual USB, PowerIQ"
        },
        "in_stock": True,
        "description": "High-capacity power bank for multiple charges"
    },
    {
        "id": "ACC008",
        "name": "Razer DeathAdder V3",
        "category": "accessories",
        "brand": "Razer",
        "price": 6999,
        "rating": 4.6,
        "thumbnail": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
        "specs": {
            "type": "Gaming Mouse",
            "connectivity": "Wired",
            "sensor": "30000 DPI",
            "features": "Ergonomic, Optical switches"
        },
        "in_stock": True,
        "description": "Esports-grade gaming mouse with ultra-fast switches"
    },
    {
        "id": "ACC009",
        "name": "Bose QuietComfort Earbuds II",
        "category": "accessories",
        "brand": "Bose",
        "price": 22999,
        "rating": 4.6,
        "thumbnail": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop",
        "specs": {
            "type": "True Wireless Earbuds",
            "connectivity": "Bluetooth 5.3",
            "battery": "6 hours (24 with case)",
            "features": "CustomTune ANC, Aware Mode"
        },
        "in_stock": True,
        "description": "World-class noise cancellation in compact earbuds"
    },
    {
        "id": "ACC010",
        "name": "SanDisk Extreme Pro 256GB",
        "category": "accessories",
        "brand": "SanDisk",
        "price": 3499,
        "rating": 4.5,
        "thumbnail": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop",
        "specs": {
            "type": "USB Flash Drive",
            "capacity": "256GB",
            "speed": "420MB/s Read",
            "features": "USB 3.2, Password Protection"
        },
        "in_stock": True,
        "description": "Ultra-fast USB drive for professionals"
    },
    {
        "id": "ACC011",
        "name": "Keychron K2 V2",
        "category": "accessories",
        "brand": "Keychron",
        "price": 7499,
        "rating": 4.5,
        "thumbnail": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop",
        "specs": {
            "type": "Mechanical Keyboard",
            "connectivity": "Bluetooth, USB-C",
            "battery": "72 hours",
            "features": "Hot-swappable, RGB backlight"
        },
        "in_stock": True,
        "description": "Compact wireless mechanical keyboard for Mac & Windows"
    },
    {
        "id": "ACC012",
        "name": "boAt Rockerz 450",
        "category": "accessories",
        "brand": "boAt",
        "price": 1499,
        "rating": 4.1,
        "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        "specs": {
            "type": "On-ear Headphones",
            "connectivity": "Bluetooth 4.2",
            "battery": "15 hours",
            "features": "Padded ear cushions, Aux support"
        },
        "in_stock": True,
        "description": "Budget-friendly wireless headphones with good bass"
    }
]


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_all_brands() -> List[str]:
    """Get unique list of all brands"""
    return sorted(list(set(p["brand"] for p in PRODUCTS)))


def get_all_categories() -> List[str]:
    """Get unique list of all categories"""
    return sorted(list(set(p["category"] for p in PRODUCTS)))


def get_price_range() -> Dict[str, int]:
    """Get min and max price across all products"""
    prices = [p["price"] for p in PRODUCTS]
    return {"min": min(prices), "max": max(prices)}


# =============================================================================
# MAIN SEARCH FUNCTION - SINGLE SOURCE OF TRUTH
# =============================================================================

def search_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    brand: Optional[str] = None,
    sort_by: str = "relevance",
    limit: int = 20
) -> Dict[str, Any]:
    """
    Search and filter products.

    This is the SINGLE SOURCE OF TRUTH for product queries.
    Used by:
    - HTTP API (GET /api/products)
    - Voice commands (OpenAI function calling)
    - Manual UI filters

    Args:
        query: Text search in product name/description
        category: Filter by category (mobiles, laptops, accessories)
        min_price: Minimum price filter
        max_price: Maximum price filter
        brand: Filter by brand name
        sort_by: Sort order (price_asc, price_desc, rating, relevance)
        limit: Maximum number of products to return

    Returns:
        Dict with products, total count, applied filters, and metadata
    """

    # Start with all products
    filtered = PRODUCTS.copy()
    filters_applied = {}

    # Apply category filter
    if category:
        category_lower = category.lower()
        filtered = [p for p in filtered if p["category"].lower() == category_lower]
        filters_applied["category"] = category_lower

    # Apply brand filter
    if brand:
        brand_lower = brand.lower()
        filtered = [p for p in filtered if p["brand"].lower() == brand_lower]
        filters_applied["brand"] = brand

    # Apply price filters
    if min_price is not None:
        filtered = [p for p in filtered if p["price"] >= min_price]
        filters_applied["min_price"] = min_price

    if max_price is not None:
        filtered = [p for p in filtered if p["price"] <= max_price]
        filters_applied["max_price"] = max_price

    # Apply text search
    if query:
        query_lower = query.lower()
        query_words = query_lower.split()

        def matches_query(product):
            searchable = f"{product['name']} {product['description']} {product['brand']} {product['category']}".lower()
            return all(word in searchable for word in query_words)

        filtered = [p for p in filtered if matches_query(p)]
        filters_applied["query"] = query

    # Apply sorting
    if sort_by == "price_asc":
        filtered = sorted(filtered, key=lambda p: p["price"])
    elif sort_by == "price_desc":
        filtered = sorted(filtered, key=lambda p: p["price"], reverse=True)
    elif sort_by == "rating":
        filtered = sorted(filtered, key=lambda p: p["rating"], reverse=True)
    # For "relevance", keep original order (or implement scoring)

    if sort_by != "relevance":
        filters_applied["sort_by"] = sort_by

    # Get total before limiting
    total = len(filtered)

    # Apply limit
    filtered = filtered[:limit]

    return {
        "success": True,
        "data": {
            "products": filtered,
            "total": total,
            "returned": len(filtered),
            "filters_applied": filters_applied
        },
        "metadata": {
            "available_categories": get_all_categories(),
            "available_brands": get_all_brands(),
            "price_range": get_price_range()
        }
    }


def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    """Get a single product by ID"""
    for product in PRODUCTS:
        if product["id"] == product_id:
            return product
    return None


def get_product_by_index(products: List[Dict], index: int) -> Optional[Dict[str, Any]]:
    """Get a product from a list by 1-based index"""
    if 1 <= index <= len(products):
        return products[index - 1]
    return None
