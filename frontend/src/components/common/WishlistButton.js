import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

const WishlistButton = ({ product, className = '', showText = false }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const productInWishlist = isInWishlist(product._id || product.id);
  
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Prompt user to login
      if (window.confirm('Please login to add items to your wishlist. Would you like to login now?')) {
        navigate('/login', { state: { from: window.location.pathname } });
      }
      return;
    }
    
    if (productInWishlist) {
      removeFromWishlist(product._id || product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  return (
    <Button
      variant={productInWishlist ? 'danger' : 'outline-danger'} 
      className={`wishlist-btn ${className}`}
      onClick={handleWishlistToggle}
      title={productInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <i className={`bi ${productInWishlist ? 'bi-heart-fill' : 'bi-heart'}`}></i>
      {showText && (
        <span className="ms-2">
          {productInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;