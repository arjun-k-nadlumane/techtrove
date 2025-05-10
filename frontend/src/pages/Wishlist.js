
import React from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Optionally show a notification
    alert(`${product.name} added to cart!`);
  };
  
  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist();
    }
  };
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Wishlist</h2>
        <Link to="/profile" className="btn btn-outline-secondary">
          <i className="bi bi-person me-1"></i>Back to Profile
        </Link>
      </div>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Wishlist Items</h5>
          {wishlist.length > 0 && (
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleClearWishlist}
            >
              <i className="bi bi-trash me-1"></i>Clear Wishlist
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading wishlist...</p>
            </div>
          ) : wishlist.length === 0 ? (
            <Alert variant="info">
              Your wishlist is empty. Browse our products and add items to your wishlist!
              <div className="mt-3">
                <Link to="/products" className="btn btn-primary">
                  <i className="bi bi-shop me-1"></i>Browse Products
                </Link>
              </div>
            </Alert>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {wishlist.map((product) => (
                <Col key={product._id || product.id}>
                  <Card className="h-100 product-card position-relative">
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="position-absolute top-0 end-0 m-2"
                      onClick={() => removeFromWishlist(product._id || product.id)}
                      title="Remove from wishlist"
                    >
                      <i className="bi bi-x-lg"></i>
                    </Button>
                    
                    <Link to={`/product/${product._id || product.id}`} className="text-decoration-none">
                      <Card.Img 
                        variant="top" 
                        src={product.image || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="product-image p-3"
                        style={{ height: '200px', objectFit: 'contain' }}
                      />
                      <Card.Body>
                        <Card.Title className="text-truncate text-dark">{product.name}</Card.Title>
                        <Card.Text className="text-primary fw-bold">
                          ${parseFloat(product.price).toFixed(2)}
                        </Card.Text>
                      </Card.Body>
                    </Link>
                    
                    <Card.Footer className="bg-white border-top-0">
                      <div className="d-grid">
                        <Button 
                          variant="primary"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="bi bi-cart-plus me-1"></i>Add to Cart
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Wishlist;