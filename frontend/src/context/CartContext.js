import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Cart Context
 *
 * Manages shopping cart state:
 * - Add/remove items
 * - Update quantities
 * - Calculate totals
 *
 * Used by both UI clicks and voice commands
 */

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /**
   * Add product to cart
   */
  const addToCart = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Increase quantity
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new item
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  /**
   * Remove product from cart
   */
  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Check if product is in cart
   */
  const isInCart = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  /**
   * Get cart item by product ID
   */
  const getCartItem = useCallback((productId) => {
    return items.find(item => item.id === productId);
  }, [items]);

  /**
   * Calculate cart totals
   */
  const totals = {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    // Could add tax, shipping, discounts here
  };

  const value = {
    items,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
    totals,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
