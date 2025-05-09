// src/pages/OrderConfirmation.js 

import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../services/ServiceContext';
import { useAuth } from '../context/AuthContext';

const OrderConfirmation = () => {
  const { id } = useParams();
  const { customerService } = useContext(ServiceContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id || !customerService) return;
      
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch(`${customerService}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, customerService]);
  
  if (!user) {
    return null;
  }
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading order details...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-4">
          <Button as={Link} to="/profile" variant="primary">
            Go to My Account
          </Button>
        </div>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Order not found</Alert>
        <div className="text-center mt-4">
          <Button as={Link} to="/profile" variant="primary">
            Go to My Account
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Card className="text-center shadow-sm mb-4">
        <Card.Body className="p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="mb-3">Order Confirmed!</h2>
          <p className="lead mb-4">Thank you for your purchase. Your order has been received and is being processed.</p>
          <p className="mb-1">Order Number: <strong>#{order._id}</strong></p>
          <p className="mb-1">Order Date: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong></p>
          <p className="mb-4">Order Total: <strong>${order.totalAmount.toFixed(2)}</strong></p>
          
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/profile" variant="primary">
              Track Your Order
            </Button>
            <Button as={Link} to="/products" variant="outline-primary">
              Continue Shopping
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Order Details</h5>
        </Card.Header>
        <Card.Body>
          <h6 className="mb-3">Items</h6>
          {order.items.map((item, index) => (
            <div key={index} className="d-flex justify-content-between mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <hr />
          
          <div className="d-flex justify-content-between mb-2 fw-bold">
            <span>Total:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          
          <hr />
          
          <h6 className="mb-3">Shipping Address</h6>
          <p className="mb-1">{order.shippingDetails.addressLine1}</p>
          {order.shippingDetails.addressLine2 && <p className="mb-1">{order.shippingDetails.addressLine2}</p>}
          <p className="mb-1">{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.postalCode}</p>
          <p className="mb-0">{order.shippingDetails.country}</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderConfirmation;