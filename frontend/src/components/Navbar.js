import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * Navigation Bar Component - BitComm Branding
 *
 * Persistent top navigation with:
 * - BitComm logo and branding
 * - Navigation links (Home, Products, Profile)
 * - Cart icon with item count
 * - Active state indication
 */
function Navbar() {
  const location = useLocation();
  const { totals } = useCart();

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/products', label: 'Products', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - BitComm */}
          <Link to="/" className="flex items-center space-x-2">
            {/* Bitcot-style logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                Bit<span className="text-orange-500">Comm</span>
              </span>
              <span className="text-[10px] text-gray-500 -mt-1">by Bitcot</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(path)
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>

          {/* Right side - Cart & BitBot indicator */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className={`
                relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive('/cart')
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <ShoppingCart className="w-5 h-5" />
              {totals.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totals.itemCount > 9 ? '9+' : totals.itemCount}
                </span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {/* BitBot indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-full border border-orange-200">
              <span className="text-xs font-medium text-orange-700">BitBot Ready</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
