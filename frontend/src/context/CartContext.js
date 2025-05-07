import React, { createContext, useState, useContext, useEffect } from 'react';
 
const CartContext = createContext();
 
export function useCart() {
  return useContext(CartContext);
}
 
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse stored cart', e);
      }
    }
    setLoading(false);
  }, []);
 
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, loading]);
 
  const addToCart = (product) => {
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingItemIndex >= 0) {
        // Product exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + (product.quantity || 1)
        };
        return updatedCart;
      } else {
        // Product doesn't exist, add to cart
        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };
 
  const updateQuantity = (productId, quantity) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0) // Remove items with quantity 0
    );
  };
 
  const removeFromCart = (productId) => {
    setCart(prevCart => 
      prevCart.filter(item => item.id !== productId)
    );
  };
 
  const clearCart = () => {
    setCart([]);
  };
 
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
 
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };
 
  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount
  };
 
  return (
<CartContext.Provider value={value}>
      {children}
</CartContext.Provider>
  );
}