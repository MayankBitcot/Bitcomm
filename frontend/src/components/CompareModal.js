import React from 'react';
import { X, Star, ShoppingCart, Check, Bot } from 'lucide-react';

/**
 * Product Comparison Modal - BitComm
 *
 * Side-by-side comparison of 2-4 products.
 * Triggered by:
 * - Selecting products and clicking "Compare" button
 * - Voice command via BitBot: "compare first and third product"
 */
function CompareModal({ products, isOpen, onClose, onAddToCart, cartItems }) {
  if (!isOpen || !products || products.length < 2) return null;

  // Format price in INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get all unique spec keys
  const allSpecKeys = [...new Set(
    products.flatMap(p => Object.keys(p.specs || {}))
  )];

  // Check if product is in cart
  const isInCart = (productId) => cartItems.some(item => item.id === productId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Compare Products ({products.length})
                </h2>
                <p className="text-xs text-orange-600">Powered by BitBot</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Product Images & Names */}
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 text-left text-sm font-medium text-gray-500 w-40">
                    Product
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="p-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-xl mb-3"
                        />
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <span className="text-xs text-gray-500 mt-1">{product.brand}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* Price Row */}
                <tr className="bg-primary-50">
                  <td className="p-4 text-sm font-medium text-gray-700">Price</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="text-lg font-bold text-primary-700">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="p-4 text-sm font-medium text-gray-700">Rating</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.rating}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr className="bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-700">Category</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center capitalize text-sm">
                      {product.category}
                    </td>
                  ))}
                </tr>

                {/* Stock Row */}
                <tr>
                  <td className="p-4 text-sm font-medium text-gray-700">Availability</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.in_stock ? (
                        <span className="text-green-600 font-medium text-sm">In Stock</span>
                      ) : (
                        <span className="text-red-600 font-medium text-sm">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Dynamic Spec Rows */}
                {allSpecKeys.map((specKey, index) => (
                  <tr key={specKey} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-4 text-sm font-medium text-gray-700 capitalize">
                      {specKey}
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4 text-center text-sm text-gray-600">
                        {product.specs?.[specKey] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Add to Cart Row */}
                <tr className="bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-700">Action</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={!product.in_stock || isInCart(product.id)}
                        className={`
                          inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isInCart(product.id)
                            ? 'bg-green-100 text-green-700'
                            : product.in_stock
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        {isInCart(product.id) ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompareModal;
