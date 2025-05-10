
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ServiceContext } from '../services/ServiceContext';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { customerService } = useContext(ServiceContext);
  const { user } = useAuth();

  // Load wishlist from localStorage on initial mount
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          setWishlist(JSON.parse(storedWishlist));
        }
      } catch (err) {
        console.error('Error loading wishlist from localStorage:', err);
        // If there's an error (like invalid JSON), reset the wishlist
        localStorage.removeItem('wishlist');
        setWishlist([]);
      }
    };

    loadWishlist();
  }, []);

  // Add item to wishlist
  const addToWishlist = (product) => {
    // Check if product is already in wishlist to avoid duplicates
    if (isInWishlist(product._id || product.id)) {
      return; // Product already in wishlist, do nothing
    }

    const updatedWishlist = [...wishlist, product];
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    // Optional: Show a toast or notification
    if (typeof window !== 'undefined') {
      alert(`${product.name} added to wishlist!`);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(
      item => (item._id || item.id) !== productId
    );
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => {
      const itemId = item._id || item.id;
      return itemId === productId;
    });
  };

  // Clear the entire wishlist
  const clearWishlist = () => {
    setWishlist([]);
    localStorage.setItem('wishlist', JSON.stringify([]));
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

export default WishlistContext;