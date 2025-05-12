// pages/ProductDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Card, Badge, Tabs, Tab, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaRegHeart, FaShoppingCart, FaChartBar } from 'react-icons/fa';
import { ServiceContext } from '../services/ServiceContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { withCircuitBreaker } from '../services/serviceDiscovery';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';
import WishlistButton from '../components/common/WishlistButton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const services = useContext(ServiceContext);
  const { user, tokens } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Fetch product and related data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch product details
        const productResponse = await withCircuitBreaker(
          async () => {
            const res = await axios.get(`${services.productService}/api/products/${id}`);
            return res.data;
          },
          2,
          () => ({ 
            name: 'Product Unavailable', 
            description: 'Product information is temporarily unavailable.'
          })
        );
        
        setProduct(productResponse);
        
        // Fetch product reviews
        try {
          const reviewsResponse = await axios.get(`${services.feedbackService}/api/reviews/product/${id}`);
          setReviews(reviewsResponse.data);
        } catch (error) {
          console.error('Failed to fetch reviews:', error);
          // Don't set main error, just quietly fail for reviews
        }
        
        // Fetch review analytics
        try {
          const analyticsResponse = await axios.get(`${services.feedbackService}/api/analytics/products/${id}`);
          setAnalytics(analyticsResponse.data);
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
          // Don't set main error, just quietly fail for analytics
        }
        
        // Fetch product recommendations
        try {
          const recommendationsResponse = await axios.get(`${services.productService}/api/products/${id}/recommendations`);
          setRecommendations(recommendationsResponse.data);
        } catch (error) {
          console.error('Failed to fetch recommendations:', error);
          // Don't set main error, just quietly fail for recommendations
        }
        
        // Check if product is in user's wishlist
        if (user) {
          try {
            const wishlistResponse = await axios.get(`${services.customerService}/api/wishlist`,{headers: {Authorization:`Bearer ${tokens}`}});
            console.log('Wishlist:',wishlistResponse);
            const wishlist = wishlistResponse.data.data;
            setInWishlist(wishlist.some(item => item.id === parseInt(id)));
          } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            // Don't set main error, just quietly fail for wishlist check
          }
        }
        
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, services, user, tokens]);
  
  // Handle adding/removing from wishlist
  const handleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (inWishlist) {
        await axios.delete(`${services.customerService}/api/wishlist/${id}`,{headers: {Authorization:`Bearer ${tokens}`}});
      } else {
        await axios.post(`${services.customerService}/api/wishlist/${id}`,null,{headers: {Authorization:`Bearer ${tokens}`}});
      }
      
      setInWishlist(!inWishlist);
    } catch (error) {
      console.error('Wishlist operation failed:', error);
    }
  };
  
  // Handle adding to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1
    });
  };
  
  // Handle review form changes
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(false);
    
    try {
      console.log({
        product_id: parseInt(id),
        user_id: user?._id,
        username: user.name,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      });
      await axios.post(`${services.feedbackService}/api/reviews`, {
        product_id: parseInt(id),
        user_id: user.id,
        username: user.name,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      })
      .then(res => {
        console.log('submitted',res.data);
      })

      .catch(err => {
        console.error('error:',err.response?.data || err.message);
      });
      
      setReviewSuccess(true);
      
      // Reset form
      setReviewForm({
        rating: 5,
        comment: ''
      });
      
      // Refresh reviews and analytics
      const reviewsResponse = await axios.get(`${services.feedbackService}/api/reviews/product/${id}`);
      setReviews(reviewsResponse.data);
      
      const analyticsResponse = await axios.get(`${services.feedbackService}/api/analytics/products/${id}`);
      setAnalytics(analyticsResponse.data);
      
    } catch (error) {
      console.error('Review submission failed:', error);
      setReviewError('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={() => navigate('/products')}>
          Return to Products
        </Button>
      </Alert>
    );
  }
  
  // Render empty state
  if (!product) {
    return (
      <Alert variant="info" className="my-4">
        <Alert.Heading>Product Not Found</Alert.Heading>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline-primary" onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </Alert>
    );
  }
  
  // Render product details
  return (
    <div className="product-detail-page">
      <Row className="mb-4">
        <Col md={5}>
          <Image 
            src={product.imageUrl || 'https://via.placeholder.com/400x400?text=Product+Image'} 
            alt={product.name}
            fluid
            className="product-image shadow-sm"
          />
        </Col>
        <Col md={7}>
          <h2 className="mb-2">{product.name}</h2>
          
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              {renderStarRating(product.averageRating || 0)}
            </div>
            <span className="text-muted">
              {product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
          
          <div className="mb-3">
            <Badge bg="secondary" className="me-2">{product.category}</Badge>
            {product.brand && <Badge bg="info">{product.brand}</Badge>}
          </div>
          
          <div className="mb-4">
            <h3 className="text-primary mb-0">${parseFloat(product.price).toFixed(2)}</h3>
            <p className={`stock-status ${product.stockQuantity > 0 ? 'text-success' : 'text-danger'}`}>
              {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
            </p>
          </div>
          
          <p className="mb-4">{product.description}</p>
          
          <div className="d-flex mb-4">
            <Button 
              variant="primary" 
              className="me-2"
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
            >
              <FaShoppingCart className="me-2" /> Add to Cart
            </Button>
            <WishlistButton product={product} />
          </div>
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="description" className="mb-4">
        <Tab eventKey="description" title="Description">
          <div className="p-3">
            <h4>Product Description</h4>
            <p>{product.description}</p>
            
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-4">
                <h5>Specifications</h5>
                <Table striped bordered hover>
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className="fw-bold">{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Tab>
        
        <Tab eventKey="reviews" title={`Reviews (${reviews.length})`}>
          <div className="p-3">
            <Row>
              <Col md={4}>
                <Card className="mb-4">
                  <Card.Body>
                    <h5>Review Summary</h5>
                    {analytics ? (
                      <>
                        <div className="d-flex align-items-center mb-3">
                          <h2 className="me-2 mb-0">{analytics.average_rating.toFixed(1)}</h2>
                          <div>
                            {renderStarRating(analytics.average_rating)}
                            <p className="mb-0">{analytics.total_reviews} reviews</p>
                          </div>
                        </div>
                        
                        <div className="rating-breakdown">
                          {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="d-flex align-items-center mb-2">
                              <span className="me-2">{rating} stars</span>
                              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ 
                                    width: `${analytics.total_reviews > 0 ? 
                                      (analytics.rating_distribution[rating] / analytics.total_reviews * 100) : 0}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="ms-2">{analytics.rating_distribution[rating]}</span>
                            </div>
                          ))}
                        </div>
                        
                        {analytics.sentiment_distribution && (
                          <div className="mt-4">
                            <h6>Sentiment Analysis</h6>
                            <div className="d-flex justify-content-between text-center">
                              <div>
                                <div className="sentiment-value text-success">
                                  {analytics.sentiment_distribution.positive}
                                </div>
                                <div>Positive</div>
                              </div>
                              <div>
                                <div className="sentiment-value text-warning">
                                  {analytics.sentiment_distribution.neutral}
                                </div>
                                <div>Neutral</div>
                              </div>
                              <div>
                                <div className="sentiment-value text-danger">
                                  {analytics.sentiment_distribution.negative}
                                </div>
                                <div>Negative</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <Link 
                            to={`/products/${id}/visualizations`} 
                            className="btn btn-outline-info w-100"
                          >
                            <FaChartBar className="me-2" /> Advanced Analytics
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>No review data available</p>
                        <div className="mt-3">
                          <Link 
                            to={`/products/${id}/visualizations`} 
                            className="btn btn-outline-info w-100"
                          >
                            <FaChartBar className="me-2" /> Advanced Analytics
                          </Link>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
                
                <Card>
                  <Card.Body>
                    <h5>Write a Review</h5>
                    
                    {!user && (
                      <Alert variant="info">
                        Please <a href="/login">log in</a> to write a review.
                      </Alert>
                    )}
                    
                    {reviewSuccess && (
                      <Alert variant="success">
                        Your review has been submitted successfully.
                      </Alert>
                    )}
                    
                    {reviewError && (
                      <Alert variant="danger">
                        {reviewError}
                      </Alert>
                    )}
                    
                    <Form onSubmit={handleReviewSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <Form.Select 
                          name="rating"
                          value={reviewForm.rating}
                          onChange={handleReviewChange}
                          disabled={!user || reviewSubmitting}
                        >
                          <option value="5">5 Stars - Excellent</option>
                          <option value="4">4 Stars - Good</option>
                          <option value="3">3 Stars - Average</option>
                          <option value="2">2 Stars - Below Average</option>
                          <option value="1">1 Star - Poor</option>
                        </Form.Select>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Review</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="comment"
                          value={reviewForm.comment}
                          onChange={handleReviewChange}
                          rows={4}
                          placeholder="Share your experience with this product..."
                          disabled={!user || reviewSubmitting}
                        />
                      </Form.Group>
                      
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={!user || reviewSubmitting}
                      >
                        {reviewSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Submitting...
                          </>
                        ) : 'Submit Review'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={8}>
                <h5 className="mb-3">Customer Reviews</h5>
                
                {reviews.length === 0 ? (
                  <Alert variant="info">
                    No reviews yet. Be the first to write a review!
                  </Alert>
                ) : (
                  reviews.map(review => (
                    <Card key={review.id} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                          <h6 className="mb-0">{review.username}</h6>
                          <small className="text-muted">
                            {new Date(review.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        
                        <div className="mb-2">
                          {renderStarRating(review.rating)}
                          {review.sentiment_label && (
                            <Badge 
                              bg={
                                review.sentiment_label === 'positive' ? 'success' : 
                                review.sentiment_label === 'negative' ? 'danger' : 
                                'secondary'
                              }
                              className="ms-2"
                            >
                              {review.sentiment_label}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="mb-0">{review.comment}</p>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Col>
            </Row>
          </div>
        </Tab>
      </Tabs>
      
      {recommendations.length > 0 && (
        <div className="recommendations-section mt-5">
          <h4 className="mb-4">Recommended Products</h4>
          <Row xs={1} md={2} lg={4} className="g-4">
            {recommendations.map(item => (
              <Col key={item.id}>
                <Card className="h-100 product-card">
                  <Card.Img 
                    variant="top" 
                    src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Product+Image'}
                    alt={item.name}
                  />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <div className="mb-2">
                      {renderStarRating(item.averageRating || 0)}
                    </div>
                    <Card.Text className="text-primary fw-bold">
                      ${parseFloat(item.price).toFixed(2)}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-top-0">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="w-100"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      View Details
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

// Helper function to render star rating
const renderStarRating = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
  }
  
  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
  }
  
  return <div className="star-rating">{stars}</div>;
};

export default ProductDetail;