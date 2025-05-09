// src/pages/OrderConfirmation.js
// Targeted fix based on the actual data structure

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, ListGroup, Badge, Button } from 'react-bootstrap';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ServiceContext } from '../services/ServiceContext';

const OrderConfirmation = () => {
  const { id } = useParams();
  const { customerService } = useContext(ServiceContext);
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null); // For debugging

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
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        console.log("Order details:", data);
        setApiResponse(data);
        
        // Based on your screenshot, the order data should be in data.data
        if (data.data) {
          setOrder(data.data);
        } else {
          setOrder(data);
        }
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

  // Show the debug info if there's an error
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        
        {/* Debug information */}
        <Card className="mt-3 mb-3">
          <Card.Header className="bg-warning">Debug Information</Card.Header>
          <Card.Body>
            <p><strong>Order ID from URL:</strong> {id}</p>
            <p><strong>API Response:</strong> {apiResponse ? 'Received' : 'None'}</p>
            {apiResponse && (
              <pre className="bg-light p-3 border rounded" style={{maxHeight: '300px', overflow: 'auto'}}>
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            )}
          </Card.Body>
        </Card>
        
        <div className="d-flex gap-2">
          <Link to="/order-history" className="btn btn-secondary">
            <i className="bi bi-arrow-left me-1"></i>Back to Orders
          </Link>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-house me-1"></i>Return to Home
          </Link>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Order information could not be loaded. This might be because the order doesn't exist 
          or there was an issue with the server.
        </Alert>
        
        {/* Debug information */}
        <Card className="mt-3 mb-3">
          <Card.Header className="bg-warning">Debug Information</Card.Header>
          <Card.Body>
            <p><strong>Order ID from URL:</strong> {id}</p>
            <p><strong>API Response:</strong> {apiResponse ? 'Received but empty order' : 'None'}</p>
            {apiResponse && (
              <pre className="bg-light p-3 border rounded" style={{maxHeight: '300px', overflow: 'auto'}}>
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            )}
          </Card.Body>
        </Card>
        
        <div className="d-flex gap-2">
          <Link to="/order-history" className="btn btn-secondary">
            <i className="bi bi-arrow-left me-1"></i>Back to Orders
          </Link>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-house me-1"></i>Return to Home
          </Link>
        </div>
      </Container>
    );
  }

  // Log the order details for debugging
  console.log('Full order object:', order);

  // Based on your screenshot, these are the key field names
  const orderId = order._id;
  const orderDate = order.createdAt;
  const orderStatus = order.status || 'processing';
  const orderTotal = order.totalAmount;
  const shippingDetails = order.shippingDetails || {};
  const orderItems = order.items || [];
  const paymentStatus = order.paymentStatus || 'pending';

  // Determine if coming from order history
  const isFromOrderHistory = location.pathname.includes('/order-confirmation/');

  return (
    <Container className="py-4">
      {/* Navigation button */}
      <div className="mb-4">
        <Link to="/order-history" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>Back to Orders
        </Link>
      </div>
      
      {/* Debug information - remove in production */}
      <Card className="mb-4 bg-light">
        <Card.Header className="bg-warning">Debug Information</Card.Header>
        <Card.Body>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Total Amount:</strong> {orderTotal}</p>
          <p><strong>Payment Status:</strong> {paymentStatus}</p>
          <pre className="bg-light p-2 border rounded" style={{maxHeight: '150px', overflow: 'auto'}}>
            {JSON.stringify(order, null, 2)}
          </pre>
          <p className="text-muted small">This debug info can be removed in production.</p>
        </Card.Body>
      </Card>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Order Details: #{orderId}</h3>
        </Card.Header>
        <Card.Body>
          <Row className="mt-4">
            <Col md={6}>
              <h5>Order Information</h5>
              <p><strong>Order ID:</strong> {orderId}</p>
              <p><strong>Order Date:</strong> {new Date(orderDate).toLocaleDateString()}</p>
              <p>
                <strong>Order Status:</strong> 
                <Badge 
                  bg={
                    orderStatus?.toLowerCase() === 'delivered' ? 'success' :
                    orderStatus?.toLowerCase() === 'shipped' ? 'info' :
                    orderStatus?.toLowerCase() === 'processing' ? 'primary' :
                    orderStatus?.toLowerCase() === 'completed' ? 'success' :
                    orderStatus?.toLowerCase() === 'cancelled' ? 'danger' :
                    'secondary'
                  }
                  className="ms-2"
                >
                  {orderStatus}
                </Badge>
              </p>
              <p>
                <strong>Payment Status:</strong> 
                <Badge 
                  bg={
                    paymentStatus?.toLowerCase() === 'completed' ? 'success' :
                    paymentStatus?.toLowerCase() === 'pending' ? 'warning' :
                    paymentStatus?.toLowerCase() === 'failed' ? 'danger' :
                    'secondary'
                  }
                  className="ms-2"
                >
                  {paymentStatus}
                </Badge>
              </p>
            </Col>
            <Col md={6}>
              <h5>Shipping Details</h5>
              <p>{shippingDetails.addressLine1}</p>
              {shippingDetails.addressLine2 && <p>{shippingDetails.addressLine2}</p>}
              <p>
                {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
              </p>
              <p>{shippingDetails.country || 'India'}</p>
            </Col>
          </Row>

          <h5 className="mt-4">Order Items</h5>
          {orderItems.length === 0 ? (
            <Alert variant="warning">No items found in this order.</Alert>
          ) : (
            <ListGroup className="mb-3">
              {orderItems.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>{item.name || 'Product'}</span>
                    <small className="text-muted ms-2">x{item.quantity || 1}</small>
                  </div>
                  <span>${parseFloat(item.price || 0).toFixed(2)}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          <div className="text-end">
            <p><strong>Total:</strong> ${parseFloat(orderTotal || 0).toFixed(2)}</p>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <Link to="/" className="btn btn-outline-primary">
              <i className="bi bi-shop me-1"></i>Continue Shopping
            </Link>
            <Link 
              to="/order-history" 
              className="btn btn-primary"
            >
              <i className="bi bi-list me-1"></i>View All Orders
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderConfirmation;