// src/pages/OrderConfirmation.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { ServiceContext } from '../services/ServiceContext';

const OrderConfirmation = () => {
  const { id } = useParams();
  const { customerService } = useContext(ServiceContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
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
        <Link to="/" className="btn btn-primary mt-3">Return to Home</Link>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Order not found</Alert>
        <Link to="/" className="btn btn-primary mt-3">Return to Home</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-success text-white">
          <h3 className="mb-0">Order Confirmed!</h3>
        </Card.Header>
        <Card.Body>
          <Alert variant="success">
            <p className="mb-0">Thank you for your order. We've received your payment and will process your order shortly.</p>
          </Alert>

          <Row className="mt-4">
            <Col md={6}>
              <h5>Order Information</h5>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <Badge bg="success">Confirmed</Badge></p>
            </Col>
            <Col md={6}>
              <h5>Shipping Details</h5>
              <p>{order.shippingDetails?.addressLine1}</p>
              {order.shippingDetails?.addressLine2 && <p>{order.shippingDetails.addressLine2}</p>}
              <p>
                {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.postalCode}
              </p>
              <p>{order.shippingDetails?.country}</p>
            </Col>
          </Row>

          <h5 className="mt-4">Order Summary</h5>
          <ListGroup className="mb-3">
            {order.items?.map((item, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                <div>
                  <span>{item.name}</span>
                  <small className="text-muted ms-2">x{item.quantity}</small>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <div className="text-end">
            <p><strong>Total:</strong> ${order.totalAmount?.toFixed(2)}</p>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <Link to="/" className="btn btn-outline-primary">
              Continue Shopping
            </Link>
            <Link to="/profile/orders" className="btn btn-primary">
              View All Orders
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderConfirmation;