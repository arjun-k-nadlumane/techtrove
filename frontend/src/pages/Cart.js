import React from 'react';

import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';

import { Link, useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext';

import { useAuth } from '../context/AuthContext';
 
const Cart = () => {

  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();

  const { user } = useAuth();

  const navigate = useNavigate();

  const handleQuantityChange = (productId, quantity) => {

    updateQuantity(productId, parseInt(quantity));

  };

  const handleRemoveItem = (productId) => {

    removeFromCart(productId);

  };

const handleCheckout = () => {
  if (!user) {
    navigate('/login', { state: { from: { pathname: '/checkout' } } });
  } else {
    // Just navigate to checkout page instead of completing checkout here
    navigate('/checkout');
  }
};

  return (
<Container className="py-4">
<h2 className="mb-4">Your Shopping Cart</h2>

      {cart.length === 0 ? (
<Card className="text-center p-5">
<Card.Body>
<i className="bi bi-cart4 fs-1 text-muted mb-3"></i>
<h3>Your cart is empty</h3>
<p className="text-muted">Looks like you haven't added any products to your cart yet.</p>
<Button 

              as={Link} 

              to="/products" 

              variant="primary"

              size="lg"

              className="mt-3"
>

              Continue Shopping
</Button>
</Card.Body>
</Card>

      ) : (
<Row>
<Col lg={8}>
<Card className="mb-4 shadow-sm">
<Card.Header className="bg-light">
<h5 className="mb-0">Cart Items ({cart.length})</h5>
</Card.Header>
<Card.Body className="p-0">

                {cart.map(item => (
<div 

                    key={item.id} 

                    className="cart-item p-3 border-bottom d-flex align-items-center"
>
<div className="cart-item-image me-3">
<img 

                        src={item.imageUrl} 

                        alt={item.name}

                        className="img-fluid rounded"

                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}

                      />
</div>
<div className="cart-item-details flex-grow-1">
<h5 className="mb-1">{item.name}</h5>
<p className="text-primary mb-1">₹{parseFloat(item.price).toFixed(2)}</p>
</div>
<div className="cart-item-quantity mx-3" style={{ width: '100px' }}>
<Form.Control

                        type="number"

                        min="1"

                        value={item.quantity}

                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}

                        className="text-center"

                      />
</div>
<div className="cart-item-subtotal mx-3 text-end">
<p className="mb-0 fw-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
</div>
<div className="cart-item-actions ms-3">
<Button 

                        variant="outline-danger" 

                        size="sm"

                        onClick={() => handleRemoveItem(item.id)}
>
<i className="bi bi-trash"></i>
</Button>
</div>
</div>

                ))}
</Card.Body>
<Card.Footer className="bg-white d-flex justify-content-between align-items-center">
<Button 

                  as={Link} 

                  to="/products" 

                  variant="outline-secondary"
>
<i className="bi bi-arrow-left me-2"></i>

                  Continue Shopping
</Button>
<Button 

                  variant="outline-danger" 

                  onClick={() => clearCart()}
>

                  Clear Cart
</Button>
</Card.Footer>
</Card>
</Col>
<Col lg={4}>
<Card className="shadow-sm">
<Card.Header className="bg-light">
<h5 className="mb-0">Order Summary</h5>
</Card.Header>
<Card.Body>
<div className="d-flex justify-content-between mb-2">
<span>Subtotal:</span>
<span>${getCartTotal().toFixed(2)}</span>
</div>
<div className="d-flex justify-content-between mb-2">
<span>Shipping:</span>
<span>Free</span>
</div>
<hr />
<div className="d-flex justify-content-between mb-3 fw-bold">
<span>Total:</span>
<span className="text-primary">₹{getCartTotal().toFixed(2)}</span>
</div>
<div className="d-grid gap-2">
<Button 

                    variant="primary" 

                    size="lg"

                    onClick={handleCheckout}
>

                    Proceed to Checkout
</Button>
</div>

                {!user && (
<Alert variant="info" className="mt-3 mb-0">
<small>You'll need to login or create an account to complete checkout.</small>
</Alert>

                )}
</Card.Body>
</Card>
</Col>
</Row>

      )}
</Container>

  );

};
 
export default Cart;
 