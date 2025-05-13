import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Spinner, Card, Container, Row, Col, Button } from 'react-bootstrap';
import ReviewSentimentChart from './ReviewSentimentChart';
import ReviewRatingChart from './ReviewRatingChart';
import ReviewTrendChart from './ReviewTrendChart';

const ProductVisualization = () => {
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productResponse = await axios.get(`http://localhost:8082/api/products/${productId}`);
        setProduct(productResponse.data);
        
        // Fetch visualization data
        const visualizationResponse = await axios.get(`http://localhost:8083/api/visualizations/${productId}`);
        setVisualizationData(visualizationResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="my-5">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading visualization data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Card className="border-danger">
          <Card.Header className="bg-danger text-white">Error</Card.Header>
          <Card.Body>
            <Card.Title>Failed to load visualization data</Card.Title>
            <Card.Text>{error}</Card.Text>
            <Link to={`/product/${productId}`}>
              <Button variant="primary">Back to Product</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!visualizationData || !product) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body>
            <Card.Title>No data available</Card.Title>
            <Card.Text>
              There is no review data available for this product. Please add some reviews first.
            </Card.Text>
            <Link to={`/products/${productId}`}>
              <Button variant="primary">Back to Product</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const { analytics } = visualizationData;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-2xl font-bold">{product.name} - Review Analytics</h1>
        <Link to={`/product/${productId}`}>
          <Button variant="outline-primary">Back to Product</Button>
        </Link>
      </div>

      {/* Summary Statistics */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="h5 mb-0">Review Summary</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col xs={6} md={3} className="text-center mb-3">
              <div className="h1 mb-0">{analytics.total_reviews}</div>
              <div className="text-muted">Total Reviews</div>
            </Col>
            <Col xs={6} md={3} className="text-center mb-3">
              <div className="h1 mb-0">{analytics.average_rating}</div>
              <div className="text-muted">Average Rating</div>
            </Col>
            <Col xs={6} md={3} className="text-center mb-3">
              <div className="h1 mb-0 text-success">{analytics.sentiment_distribution.positive}</div>
              <div className="text-muted">Positive Reviews</div>
            </Col>
            <Col xs={6} md={3} className="text-center mb-3">
              <div className="h1 mb-0 text-danger">{analytics.sentiment_distribution.negative}</div>
              <div className="text-muted">Negative Reviews</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {/* Sentiment Distribution */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h2 className="h5 mb-0">Sentiment Distribution</h2>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              {visualizationData.sentiment && !visualizationData.sentiment.error ? (
                <ReviewSentimentChart 
                  sentimentData={visualizationData.sentiment} 
                />
              ) : (
                <div className="text-muted">No sentiment data available</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Rating Distribution */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h2 className="h5 mb-0">Rating Distribution</h2>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              {visualizationData.ratings && !visualizationData.ratings.error ? (
                <ReviewRatingChart 
                  ratingData={visualizationData.ratings} 
                />
              ) : (
                <div className="text-muted">No rating data available</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trend Over Time */}
      {visualizationData.time_trend && !visualizationData.time_trend.error && (
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h2 className="h5 mb-0">Rating Trend Over Time</h2>
          </Card.Header>
          <Card.Body>
            <ReviewTrendChart 
              trendData={visualizationData.time_trend} 
            />
          </Card.Body>
        </Card>
      )}

      {/* Rating Breakdown */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h2 className="h5 mb-0">Rating Breakdown</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            {[5, 4, 3, 2, 1].map(rating => (
              <Col key={rating} xs={12} className="mb-2">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{ width: '60px' }}>
                    {Array(rating).fill().map((_, i) => (
                      <i key={i} className="bi bi-star-fill text-warning"></i>
                    ))}
                    {Array(5-rating).fill().map((_, i) => (
                      <i key={i} className="bi bi-star text-muted"></i>
                    ))}
                  </div>
                  <div className="flex-grow-1">
                    <div className="progress" style={{ height: '20px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ 
                          width: `${analytics.total_reviews > 0 
                            ? (analytics.rating_distribution[rating] / analytics.total_reviews) * 100 
                            : 0}%` 
                        }}
                        aria-valuenow={analytics.rating_distribution[rating]} 
                        aria-valuemin="0" 
                        aria-valuemax={analytics.total_reviews}
                      ></div>
                    </div>
                  </div>
                  <div className="ms-2" style={{ width: '40px' }}>
                    {analytics.rating_distribution[rating]}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Export Button */}
      <div className="text-center">
        <a 
          href={`http://localhost:8083/api/export/reviews/${productId}`} 
          className="btn btn-outline-secondary" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <i className="bi bi-download me-2"></i>
          Export Review Data (CSV)
        </a>
      </div>
    </Container>
  );
};

export default ProductVisualization;