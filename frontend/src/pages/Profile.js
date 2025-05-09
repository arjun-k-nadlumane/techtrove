import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Tab, Nav, Button, Form, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ServiceContext } from '../services/ServiceContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { customerService } = useContext(ServiceContext);
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  // State for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for profile operations
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  
  // State for password operations
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // State for orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  
  // State for wishlist
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    } else {
      // Reset profile data when user changes
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, navigate]);
  
  // Fetch orders
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);
  
  // Fetch wishlist
  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);
  
  // Fetch orders function
 // src/pages/Profile.js - Update the fetchOrders function

const fetchOrders = async () => {
  setOrdersLoading(true);
  setOrdersError('');
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setOrdersError('Authentication token not found. Please log in again.');
      setOrdersLoading(false);
      return;
    }
    
    console.log('Fetching orders from:', `${customerService}/api/orders`);
    
    const response = await fetch(`${customerService}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Orders response:', data);
    
    if (data.success && Array.isArray(data.data)) {
      setOrders(data.data);
    } else {
      console.error('Unexpected response format:', data);
      setOrders([]);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    setOrdersError('Failed to load order history. Please try again later.');
  } finally {
    setOrdersLoading(false);
  }
};
  
  // Fetch wishlist function

const fetchWishlist = async () => {
  setWishlistLoading(true);
  setWishlistError('');
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setWishlistError('Authentication token not found. Please log in again.');
      setWishlistLoading(false);
      return;
    }
    
    console.log('Fetching wishlist from:', `${customerService}/api/wishlist`);
    
    const response = await fetch(`${customerService}/api/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch wishlist: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Wishlist response:', data);
    
    if (data.success && Array.isArray(data.data)) {
      setWishlist(data.data);
    } else {
      console.error('Unexpected wishlist response format:', data);
      setWishlist([]);
    }
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    setWishlistError('Failed to load wishlist. Please try again later.');
  } finally {
    setWishlistLoading(false);
  }
};

// Also update handleRemoveFromWishlist
const handleRemoveFromWishlist = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setWishlistError('Authentication token not found. Please log in again.');
      return;
    }
    
    const response = await fetch(`${customerService}/api/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove from wishlist');
    }
    
    // Update wishlist state
    fetchWishlist();
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    setWishlistError('Failed to remove item from wishlist. Please try again later.');
  }
};
  
  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');
    
    try {
      const response = await fetch(`${customerService}/api/auth/updatedetails`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const responseData = await response.json();
      
      // Update stored user data
      if (responseData.data) {
        const updatedUser = { ...user, ...responseData.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setProfileSuccess('Profile updated successfully!');
    } catch (error) {
      setProfileError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');
    
    try {
      const response = await fetch(`${customerService}/api/auth/updatepassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }
      
      setPasswordSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password. Please check your current password and try again.');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  
  if (!user) {
    return null; // Don't render anything if not logged in
  }
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">My Account</h2>
      
      <Tab.Container id="profile-tabs" defaultActiveKey="profile">
        <Row>
          <Col md={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="rounded-0">
                      <i className="bi bi-person-circle me-2"></i> Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password" className="rounded-0">
                      <i className="bi bi-lock-fill me-2"></i> Change Password
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="wishlist" className="rounded-0">
                      <i className="bi bi-heart-fill me-2"></i> Wishlist
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="orders" className="rounded-0">
                      <i className="bi bi-box-seam-fill me-2"></i> Order History
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
              <Card.Footer>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="w-100"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Button>
              </Card.Footer>
            </Card>
          </Col>
          
          <Col md={9}>
            <Card className="shadow-sm">
              <Card.Body>
                <Tab.Content>
                  {/* Profile Tab */}
                  <Tab.Pane eventKey="profile">
                    <h4 className="mb-4">Profile Information</h4>
                    
                    {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}
                    {profileError && <Alert variant="danger">{profileError}</Alert>}
                    
                    <Form onSubmit={handleProfileSubmit}>
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Full Name</Form.Label>
                        <Col sm={9}>
                          <Form.Control 
                            type="text" 
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                      
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Email Address</Form.Label>
                        <Col sm={9}>
                          <Form.Control 
                            type="email" 
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                      
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Phone Number</Form.Label>
                        <Col sm={9}>
                          <Form.Control 
                            type="tel" 
                            name="phone"
                            value={profileData.phone || ''}
                            onChange={handleProfileChange}
                          />
                        </Col>
                      </Form.Group>
                      
                      <div className="text-end">
                        <Button 
                          type="submit" 
                          variant="primary"
                          disabled={profileLoading}
                        >
                          {profileLoading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Updating...
                            </>
                          ) : 'Update Profile'}
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>
                  
                  {/* Password Tab */}
                  <Tab.Pane eventKey="password">
                    <h4 className="mb-4">Change Password</h4>
                    
                    {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
                    {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                    
                    <Form onSubmit={handlePasswordSubmit}>
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={4}>Current Password</Form.Label>
                        <Col sm={8}>
                          <Form.Control 
                            type="password" 
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                      
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={4}>New Password</Form.Label>
                        <Col sm={8}>
                          <Form.Control 
                            type="password" 
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={6}
                          />
                          <Form.Text className="text-muted">
                            Password must be at least 6 characters
                          </Form.Text>
                        </Col>
                      </Form.Group>
                      
                      <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={4}>Confirm New Password</Form.Label>
                        <Col sm={8}>
                          <Form.Control 
                            type="password" 
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                      
                      <div className="text-end">
                        <Button 
                          type="submit" 
                          variant="primary"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Updating...
                            </>
                          ) : 'Update Password'}
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>
                  
                  {/* Wishlist Tab */}
                  <Tab.Pane eventKey="wishlist">
                    <h4 className="mb-4">My Wishlist</h4>
                    
                    {wishlistError && <Alert variant="danger">{wishlistError}</Alert>}
                    
                    {wishlistLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Loading wishlist...</p>
                      </div>
                    ) : wishlist.length === 0 ? (
                      <Alert variant="info">
                        Your wishlist is empty. Browse our products and add items to your wishlist!
                      </Alert>
                    ) : (
                      <div className="wishlist-items">
                        <Row xs={1} md={2} lg={3} className="g-4">
                          {wishlist.map(product => (
                            <Col key={product.id}>
                              <Card className="h-100 shadow-sm">
                                <Card.Img 
                                  variant="top" 
                                  src={product.imageUrl || '/images/product-placeholder.jpg'} 
                                  alt={product.name}
                                  style={{ height: '160px', objectFit: 'cover' }}
                                />
                                <Card.Body>
                                  <Card.Title className="h6">{product.name}</Card.Title>
                                  <Card.Text className="text-primary fw-bold mb-3">
                                    ${parseFloat(product.price).toFixed(2)}
                                  </Card.Text>
                                  <div className="d-flex justify-content-between">
                                    <Button 
                                      variant="primary" 
                                      size="sm"
                                      as={Link}
                                      to={`/product/${product.id}`}
                                    >
                                      View Details
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleRemoveFromWishlist(product.id)}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Tab.Pane>
                  
                  {/* Orders Tab */}
                  <Tab.Pane eventKey="orders">
                    <h4 className="mb-4">Order History</h4>
                    
                    {ordersError && <Alert variant="danger">{ordersError}</Alert>}
                    
                    {ordersLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <Alert variant="info">
                        You haven't placed any orders yet.
                      </Alert>
                    ) : (
                      <Table responsive striped bordered hover>
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
                          {orders.map((order, index) => (
                            <tr key={order.id}>
                              {/* <td>{order?._id}</td> */}
                              <td>{index+1}</td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>
                                <Badge 
                                  bg={
                                    order.status === 'completed' ? 'success' : 
                                    order.status === 'processing' ? 'primary' : 
                                    order.status === 'shipped' ? 'info' : 'secondary'
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </td>
                              <td>${parseFloat(order.totalAmount).toFixed(2)}</td>
                              <td>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  as={Link}
                                  to={`/order/${order.id}`}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default Profile;