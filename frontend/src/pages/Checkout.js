// src/pages/Checkout.js

import React, { useState, useContext, useEffect } from 'react';

import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

import { useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext';

import { useAuth } from '../context/AuthContext';

import { ServiceContext } from '../services/ServiceContext';

const Checkout = () => {

  const { cart, getCartTotal, clearCart } = useCart();

  const { user } = useAuth();

  const navigate = useNavigate();

  const { customerService } = useContext(ServiceContext);

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

  useEffect(() => {

    if (!user) {

      navigate('/login', { state: { from: { pathname: '/checkout' } } });

    }

  }, [user, navigate]);

  // Redirect if cart is empty

  useEffect(() => {

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

      // Get authentication token from localStorage

      const token = localStorage.getItem('token');

      console.log('Token from localStorage:', token);

      if (!token) {

        throw new Error('Authentication token not found');

      }

      // Create order data from cart items

      const orderItems = cart.map(item => ({

        productId: item.id,

        name: item.name,

        price: item.price,

        quantity: item.quantity,

        image: item.image || ''

      }));

      // Create the order data

      const orderData = {

        items: orderItems,

        shippingDetails,

        totalAmount: getCartTotal()

      };

      console.log('Making request to:', `${customerService}/api/orders/`);

      console.log('Order data:', orderData);

      // Make the API request with proper authorization header

      const response = await fetch(`${customerService}/api/orders/`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`

        },

        body: JSON.stringify(orderData)

      });

      console.log('Response status:', response.status);

      if (!response.ok) {

        const errorText = await response.text();

        console.log('Error response:', errorText);

        let errorMessage;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || 'Failed to place order';
        } catch (e) {
          errorMessage = 'Failed to place order';
        }

        throw new Error(errorMessage);

      }

      const order = await response.json();

      console.log('Order created successfully:', order);

      // Clear the cart
      clearCart();
      // Store order ID correctly based on the response structure
      let orderId;
      if (order.data && order.data._id) {
        orderId = order.data._id;
      } else if (order._id) {
        orderId = order._id;
      } else {
        console.error('Order ID not found in response:', order);
        throw new Error('Order created but ID not found');
      }

      console.log('Navigating to order confirmation with ID:', orderId);

      // Wait for cart to clear before navigating

      setTimeout(() => {
        // navigate(`/order-confirmation/${orderId}`);
        navigate(`/payment/${orderId}`);
      }, 100);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to place order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Only render if user is logged in and cart is not empty

  if (!user) {
    return null;
  }

  if (cart.length === 0 && !loading) {

    return (
<Container className="py-4">
<Alert variant="info">

          Your cart is empty. Please add items to your cart before checking out.
</Alert>
</Container>

    );

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
 