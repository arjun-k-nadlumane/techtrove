// src/pages/OrderDetails.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, ListGroup, Badge, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { ServiceContext } from '../services/ServiceContext';

const OrderDetails = () => {
  const { id } = useParams();
  const { customerService } = useContext(ServiceContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }
      
      if (!customerService) {
        setError('API service not available');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        console.log('Fetching order details for ID:', id);
        console.log('API URL:', `${customerService}/api/orders/${id}`);
        
        const response = await fetch(`${customerService}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          // Try an alternative endpoint format
          console.log('First attempt failed, trying alternative endpoint...');
          
          const altResponse = await fetch(`${customerService}/api/orders/detail/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Alternative response status:', altResponse.status);
          
          if (!altResponse.ok) {
            throw new Error('Failed to fetch order details');
          }
          
          const altData = await altResponse.json();
          console.log('Order details from alternative endpoint:', altData);
          
          // Handle different response structures
          setOrder(altData.data || altData);
          return;
        }
        
        const data = await response.json();
        console.log("Order details:", data);
        
        // Handle different response structures
        setOrder(data.data || data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, customerService]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/order-history" className="btn btn-primary mt-3">
          <i className="bi bi-arrow-left me-1"></i>Back to Orders
        </Link>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Order not found</Alert>
        <Link to="/order-history" className="btn btn-primary mt-3">
          <i className="bi bi-arrow-left me-1"></i>Back to Orders
        </Link>
      </Container>
    );
  }

  // Safely access nested properties with optional chaining
  const orderItems = order.items || order.orderItems || [];
  const shippingDetails = order.shippingDetails || order.shippingAddress || {};
  const totalAmount = order.totalAmount || order.totalPrice || 0;
  const orderDate = order.createdAt || order.orderDate || new Date().toISOString();
  const orderStatus = order.status || 'Confirmed';
  const orderPayment = order.paymentStatus || 'refund';

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'primary';
      case 'cancelled':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <Link to="/profile" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>Back to Orders
        </Link>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Order #{order._id}</h5>
            <Badge bg={getStatusBadgeVariant(orderStatus)} className="fs-6">
              {orderStatus}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <h6 className="mb-2">Order Information</h6>
              <p className="mb-1"><strong>Order Date:</strong> {formatDate(orderDate)}</p>
              <p className="mb-1"><strong>Payment Method:</strong> Credit Card</p>
              <p className="mb-1"><strong>Payment Status:</strong> {orderPayment}</p>
            </Col>
            <Col md={6}>
              <h6 className="mb-2">Shipping Address</h6>
              <p className="mb-1">{shippingDetails.addressLine1}</p>
              {shippingDetails.addressLine2 && <p className="mb-1">{shippingDetails.addressLine2}</p>}
              <p className="mb-1">
                {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
              </p>
              <p className="mb-1">{shippingDetails.country}</p>
            </Col>
          </Row>

          <h6 className="mb-3">Order Items</h6>
          <ListGroup className="mb-3">
            {orderItems.map((item, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-medium">{item.name}</span>
                  <small className="text-muted ms-2">x{item.quantity || item.qty || 1}</small>
                </div>
                <span>₹{((item.price || 0) * (item.quantity || item.qty || 1)).toFixed(2)}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <div className="text-end">
            <p className="mb-1"><strong>Subtotal:</strong> ${parseFloat(totalAmount).toFixed(2)}</p>
            <p className="mb-1"><strong>Shipping:</strong> Free</p>
            <p className="fs-5 fw-bold"><strong>Total:</strong> ${parseFloat(totalAmount).toFixed(2)}</p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderDetails;