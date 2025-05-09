// src/pages/OrderHistory.js
// Final fix for the order ID issue

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../services/ServiceContext';
import { useAuth } from '../context/AuthContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState(null);
  const { customerService } = useContext(ServiceContext);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerService) {
        setError('API service not available');
        setLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        console.log('Fetching order history...');
        
        const response = await fetch(`${customerService}/api/orders/myorders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          // Try an alternative endpoint
          console.log('First attempt failed, trying alternative endpoint...');
          
          const altResponse = await fetch(`${customerService}/api/orders/history`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Alternative response status:', altResponse.status);
          
          if (!altResponse.ok) {
            throw new Error('Failed to fetch order history');
          }
          
          const altData = await altResponse.json();
          console.log('Order history from alternative endpoint:', altData);
          setRawResponse(altData);
          
          // Based on your screenshot, we extract 'data' array from the response
          if (altData.data && Array.isArray(altData.data)) {
            setOrders(altData.data);
          } else {
            setOrders([]);
          }
          return;
        }
        
        const data = await response.json();
        console.log('Order history data:', data);
        setRawResponse(data);
        
        // Based on your screenshot, we extract 'data' array from the response
        if (data.data && Array.isArray(data.data)) {
          setOrders(data.data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerService, user]);

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper function to parse and format price
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '$0.00';
    
    // Handle string or number
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if it's a valid number
    if (isNaN(numericPrice)) return '$0.00';
    
    // Return formatted price
    return `$${numericPrice.toFixed(2)}`;
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <Link to="/profile" className="btn btn-outline-secondary">
          <i className="bi bi-person me-1"></i>Back to Profile
        </Link>
      </div>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Order History</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading your order history...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : orders.length === 0 ? (
            <Alert variant="info">
              You haven't placed any orders yet. 
              <Link to="/" className="ms-2">Continue shopping</Link>
            </Alert>
          ) : (
            <>
              {/* Show raw response for debugging - remove in production */}
              <div className="mb-3 p-3 border rounded bg-light">
                <h6>Debug Information:</h6>
                <p>Number of orders loaded: {orders.length}</p>
                <p>Raw data sample (first order):</p>
                {orders.length > 0 && (
                  <pre style={{ maxHeight: '150px', overflow: 'auto' }}>
                    {JSON.stringify(orders[0], null, 2)}
                  </pre>
                )}
              </div>
              
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    // Log each order's ID field for debugging
                    console.log(`Order ${index} ID field:`, order._id);
                    
                    return (
                      <tr key={index}>
                        <td className="text-truncate" style={{maxWidth: '150px'}}>
                          {/* Show full ID for debugging */}
                          <span title={order._id}>{order._id}</span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status || 'processing'}
                          </Badge>
                        </td>
                        <td>{formatPrice(order.totalAmount)}</td>
                        <td>
                          <Link 
                            to={`/order-confirmation/${order._id}`} 
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="bi bi-eye me-1"></i>View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderHistory;