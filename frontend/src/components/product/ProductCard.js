import React from 'react';

import { Card, Button, Badge } from 'react-bootstrap';

import { useNavigate } from 'react-router-dom';

import { useCart } from '../../context/CartContext';
 
const ProductCard = ({ product }) => {

  const { addToCart } = useCart();

  const navigate = useNavigate();
 
  const handleViewDetails = () => {

    navigate(`/product/${product.id}`);

  };
 
  const handleAddToCart = (e) => {

    e.stopPropagation();

    addToCart(product);

  };
 
  // Render star rating

  const renderStarRating = (rating) => {

    const stars = [];

    const fullStars = Math.floor(rating);

    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars

    for (let i = 0; i < fullStars; i++) {

      stars.push(<i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>);

    }

    // Add half star if needed

    if (hasHalfStar) {

      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);

    }

    // Add empty stars

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < emptyStars; i++) {

      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);

    }

    return <div className="star-rating small mb-2">{stars}</div>;

  };
 
  return (
<Card className="h-100 product-card shadow-sm">
<div className="position-relative">
<Card.Img 

          variant="top" 

          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Product+Image'}

          alt={product.name}

          className="product-image"

          style={{ height: '180px', objectFit: 'cover' }}

        />

        {product.featured && (
<Badge 

            bg="warning" 

            text="dark"

            className="position-absolute top-0 end-0 m-2"
>

            Featured
</Badge>

        )}
</div>
<Card.Body className="d-flex flex-column">
<Card.Title className="h6 mb-2">{product.name}</Card.Title>

        {renderStarRating(product.averageRating || 0)}
<Card.Text className="text-primary fw-bold mb-3">

₹{parseFloat(product.price || 0).toFixed(2)}
</Card.Text>
<div className="mt-auto">
<div className="d-grid gap-2">
<Button 

              variant="outline-primary" 

              size="sm"

              onClick={handleViewDetails}

              className="mb-2"
>

              View Details
</Button>
<Button 

              variant="primary" 

              size="sm"

              onClick={handleAddToCart}

              disabled={!product.stockQuantity || product.stockQuantity <= 0}
>
<i className="bi bi-cart-plus me-1"></i> Add to Cart
</Button>
</div>
</div>
</Card.Body>
</Card>

  );

};
 
export default ProductCard;
 