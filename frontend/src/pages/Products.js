import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Star, ShoppingCart, Check, GitCompare } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/ProductModal';
import CompareModal from '../components/CompareModal';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8005';

/**
 * Products Page
 *
 * Main shopping interface with:
 * - Search bar
 * - Filter sidebar (category, brand, price)
 * - Sort dropdown
 * - Product grid
 * - Product detail modal
 * - Compare modal
 *
 * CRITICAL: This page responds to both manual UI interactions AND voice commands.
 * Voice commands trigger the same state updates as clicking filters.
 */
function Products() {
  // Product state
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('relevance');

  // Metadata (available options)
  const [metadata, setMetadata] = useState({
    categories: [],
    brands: [],
    price_range: { min: 0, max: 250000 }
  });

  // UI state
  const [showFilters, setShowFilters] = useState(true);

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compare state
  const [compareList, setCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Voice and Cart integration
  const {
    registerProductsCallback,
    registerFiltersCallback,
    registerProductDetailCallback,
    registerCompareCallback,
    registerAddToCartCallback,
    isVoiceUpdateInProgress,
    consumePendingVoiceData
  } = useVoice();
  const { addToCart, isInCart, items: cartItems } = useCart();

  // ==========================================================================
  // VOICE INTEGRATION
  // Register callbacks so voice commands can update this page
  // ==========================================================================

  useEffect(() => {
    // Register callback for voice-triggered product updates
    registerProductsCallback((newProducts, newTotal) => {
      console.log('Voice update - products:', newProducts.length);
      setProducts(newProducts);
      setTotal(newTotal);
      setLoading(false);
    });

    // Register callback for voice-triggered filter updates
    registerFiltersCallback((filters) => {
      console.log('Voice update - filters:', filters);
      if (filters.category) setSelectedCategory(filters.category);
      if (filters.brand) setSelectedBrand(filters.brand);
      if (filters.min_price) setPriceRange(prev => ({ ...prev, min: filters.min_price }));
      if (filters.max_price) setPriceRange(prev => ({ ...prev, max: filters.max_price }));
      if (filters.sort_by) setSortBy(filters.sort_by);
      if (filters.query) setSearchQuery(filters.query);
    });

    // Register callback for voice-triggered product detail view
    registerProductDetailCallback((product) => {
      console.log('Voice update - show product detail:', product.name);
      setSelectedProduct(product);
      setIsModalOpen(true);
    });

    // Register callback for voice-triggered comparison
    registerCompareCallback((productsToCompare) => {
      console.log('Voice update - compare products:', productsToCompare.length);
      setCompareList(productsToCompare);
      setIsCompareOpen(true);
    });

    // Register callback for voice-triggered add to cart
    registerAddToCartCallback((product) => {
      console.log('Voice update - add to cart:', product.name);
      addToCart(product);
    });

    // On mount, consume any pending voice data from voice-triggered navigation
    // This handles the case where voice navigated to /products but callbacks
    // fired before this component mounted (stale callback race condition)
    const pendingData = consumePendingVoiceData();
    if (pendingData && isVoiceUpdateInProgress()) {
      console.log('Consuming pending voice data - products:', pendingData.products.length);
      setProducts(pendingData.products);
      setTotal(pendingData.total);
      setLoading(false);
      const filters = pendingData.filters;
      if (filters.category) setSelectedCategory(filters.category);
      if (filters.brand) setSelectedBrand(filters.brand);
      if (filters.min_price) setPriceRange(prev => ({ ...prev, min: filters.min_price }));
      if (filters.max_price) setPriceRange(prev => ({ ...prev, max: filters.max_price }));
      if (filters.sort_by) setSortBy(filters.sort_by);
      if (filters.query) setSearchQuery(filters.query);
    }
  }, [registerProductsCallback, registerFiltersCallback, registerProductDetailCallback, registerCompareCallback, registerAddToCartCallback, addToCart, consumePendingVoiceData, isVoiceUpdateInProgress]);

  // ==========================================================================
  // FETCH PRODUCTS
  // This is the SAME API that voice commands use (via tools.py → products.py)
  // ==========================================================================

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (priceRange.min) params.append('min_price', priceRange.min);
      if (priceRange.max) params.append('max_price', priceRange.max);
      if (sortBy !== 'relevance') params.append('sort_by', sortBy);

      const response = await fetch(`${API_URL}/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotal(data.data.total);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`${API_URL}/api/metadata`);
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products when filters change (but skip if voice just updated)
  useEffect(() => {
    // Skip HTTP fetch if voice command just updated the products
    // This prevents race condition where HTTP fetch overwrites voice data
    if (isVoiceUpdateInProgress()) {
      console.log('Skipping HTTP fetch - voice update in progress');
      return;
    }
    fetchProducts();
  }, [fetchProducts, isVoiceUpdateInProgress]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setSortBy('relevance');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCompareToggle = (product) => {
    setCompareList(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 products');
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedBrand ||
    priceRange.min || priceRange.max || sortBy !== 'relevance';

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bit<span className="text-primary-600">Comm</span> Products
          </h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading...' : `${total} products found`}
          </p>
        </div>

        {/* Search Bar & Compare Button */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Compare Button */}
          {compareList.length >= 2 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <GitCompare className="w-5 h-5" />
              <span>Compare ({compareList.length})</span>
            </button>
          )}

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Compare Selection Bar */}
      {compareList.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-primary-600" />
            <span className="text-primary-800 font-medium">
              {compareList.length} product{compareList.length > 1 ? 's' : ''} selected for comparison
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {compareList.length >= 2 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-4 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
              >
                Compare Now
              </button>
            )}
            <button
              onClick={() => setCompareList([])}
              className="text-primary-600 hover:text-primary-800 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Clear all</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
              <div className="space-y-2">
                {metadata.categories.map((category) => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Brand</h3>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Brands</option>
                {metadata.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <span className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                  <span className="capitalize">{selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                  <span>{selectedBrand}</span>
                  <button onClick={() => setSelectedBrand('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                  <span>₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}</span>
                  <button onClick={() => setPriceRange({ min: '', max: '' })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Products grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index + 1}
                  onClick={() => handleProductClick(product)}
                  onAddToCart={() => handleAddToCart(product)}
                  onCompareToggle={() => handleCompareToggle(product)}
                  isInCart={isInCart(product.id)}
                  isInCompare={compareList.some(p => p.id === product.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
        isInCart={selectedProduct ? isInCart(selectedProduct.id) : false}
      />

      {/* Compare Modal */}
      <CompareModal
        products={compareList}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
      />
    </div>
  );
}

/**
 * Product Card Component
 */
function ProductCard({ product, index, onClick, onAddToCart, onCompareToggle, isInCart, isInCompare }) {
  const {
    name,
    brand,
    price,
    rating,
    thumbnail,
    category,
    in_stock,
  } = product;

  // Format price in INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image - Clickable for details */}
      <div
        className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Index badge for voice reference */}
        <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          #{index}
        </span>
        {/* Stock badge */}
        {!in_stock && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
        {/* Compare checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompareToggle();
          }}
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isInCompare
              ? 'bg-primary-600 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-primary-100'
            }`}
          title={isInCompare ? 'Remove from compare' : 'Add to compare'}
        >
          <GitCompare className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <span className="capitalize">{category}</span>
          <span>•</span>
          <span>{brand}</span>
        </div>

        {/* Name - Clickable */}
        <h3
          onClick={onClick}
          className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer"
        >
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{rating}</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={!in_stock || isInCart}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1
              ${isInCart
                ? 'bg-green-100 text-green-700'
                : in_stock
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{in_stock ? 'Add' : 'N/A'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
