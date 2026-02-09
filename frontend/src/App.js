import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import VoiceController from './components/VoiceController';
import Home from './pages/Home';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';

/**
 * Main App Component
 *
 * Layout:
 * - Navbar (top) - persistent across all pages
 * - Main content area (changes based on route)
 * - VoiceController (bottom-right) - persistent across all pages
 *
 * Routes:
 * - / : Home page
 * - /products : Product listing with filters
 * - /profile : User profile
 * - /cart : Shopping cart
 * - /checkout : Checkout page
 * - /payment-success : Order confirmation
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - persistent */}
      <Navbar />

      {/* Main content area */}
      <main className="pb-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </main>

      {/* Voice Controller - persistent, floating */}
      <VoiceController />
    </div>
  );
}

export default App;
