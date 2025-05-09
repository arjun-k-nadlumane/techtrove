import React, { createContext, useState, useContext, useEffect } from 'react';
import { ServiceContext } from '../services/ServiceContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customerService } = useContext(ServiceContext);
  const { user } = useAuth();

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

  // Add to cart
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

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0) // Remove items with quantity 0
    );
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => 
      prevCart.filter(item => item.id !== productId)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Checkout function
 // src/context/CartContext.js - Update the checkout function

const checkout = async (shippingDetails) => {
  if (!user) {
    throw new Error('You must be logged in to checkout');
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // Ensure we have all required shipping details
    const completeShippingDetails = {
      addressLine1: shippingDetails.addressLine1 || '123 Default Street',
      city: shippingDetails.city || 'Default City',
      state: shippingDetails.state || 'Default State',
      postalCode: shippingDetails.postalCode || '12345',
      country: shippingDetails.country || 'USA'
    };
    
    // Prepare order data with complete items info
    const orderData = {
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      shippingDetails: completeShippingDetails,
      totalAmount: getCartTotal()
    };
    
    console.log('Submitting order:', orderData);
    console.log('Using token:', token.substring(0, 15) + '...');
    
    const response = await fetch(`${customerService}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Order creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create order');
    }
    
    const data = await response.json();
    clearCart();
    return data.data;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    checkout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}