import React from 'react';
import { X, Star, ShoppingCart, Check, Package, Cpu, HardDrive, Battery, Camera, Monitor, Bot } from 'lucide-react';

/**
 * Product Detail Modal - BitComm
 *
 * Shows full product information in a popup.
 * Triggered by:
 * - Clicking on a product card
 * - Voice command via BitBot: "show details of first product", "tell me about the second one"
 */
function ProductModal({ product, isOpen, onClose, onAddToCart, isInCart }) {
  if (!isOpen || !product) return null;

  const {
    name,
    brand,
    price,
    rating,
    thumbnail,
    category,
    in_stock,
    specs,
    description
  } = product;

  // Format price in INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get icon for spec key
  const getSpecIcon = (key) => {
    const icons = {
      processor: Cpu,
      ram: HardDrive,
      storage: HardDrive,
      battery: Battery,
      camera: Camera,
      display: Monitor,
      graphics: Cpu,
    };
    return icons[key.toLowerCase()] || Package;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-2/5 bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
              <img
                src={thumbnail}
                alt={name}
                className="w-full max-w-[280px] h-auto object-contain rounded-2xl shadow-lg"
              />
            </div>

            {/* Content Section */}
            <div className="md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[80vh]">
              {/* Category & Brand */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize text-xs font-medium">
                  {category}
                </span>
                <span>•</span>
                <span className="font-medium">{brand}</span>
              </div>

              {/* Name */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{name}</h2>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-green-600 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">{rating}</span>
                </div>
                <span className="text-sm text-gray-500">out of 5</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
                {in_stock ? (
                  <span className="ml-3 text-sm text-green-600 font-medium">In Stock</span>
                ) : (
                  <span className="ml-3 text-sm text-red-600 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              {description && (
                <p className="text-gray-600 mb-6">{description}</p>
              )}

              {/* Specifications */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(specs).map(([key, value]) => {
                      const Icon = getSpecIcon(key);
                      return (
                        <div
                          key={key}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 capitalize">{key}</p>
                            <p className="text-sm font-medium text-gray-900">{value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BitBot tip */}
              <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <div className="flex items-center space-x-2 text-sm text-orange-700">
                  <Bot className="w-4 h-4" />
                  <span>Say "add to cart" to BitBot to purchase this item</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={!in_stock || isInCart}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all
                    ${isInCart
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : in_stock
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>{in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
