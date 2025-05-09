// src/pages/Checkout.js - Create or update this file

import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { cart, getCartTotal, checkout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingDetails, setShippingDetails] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [user, navigate]);
  
  // Redirect if cart is empty
  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shippingDetails.addressLine1 || !shippingDetails.city || 
        !shippingDetails.state || !shippingDetails.postalCode) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const order = await checkout(shippingDetails);
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to place order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user || cart.length === 0) {
    return null;
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Shipping Details</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Address Line 1 *</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLine1"
                    value={shippingDetails.addressLine1}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Address Line 2</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLine2"
                    value={shippingDetails.addressLine2}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingDetails.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State/Province *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={shippingDetails.state}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="postalCode"
                        value={shippingDetails.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country *</Form.Label>
                      <Form.Control
                        as="select"
                        name="country"
                        value={shippingDetails.country}
                        onChange={handleChange}
                        required
                      >
                        <option value="USA">United States</option>
                        <option value="CAN">Canada</option>
                        <option value="MEX">Mexico</option>
                        <option value="GBR">United Kingdom</option>
                        <option value="AUS">Australia</option>
                        <option value="IND">India</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-grid gap-2 mt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              {cart.map(item => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="d-flex justify-content-between mb-2 fw-bold">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;