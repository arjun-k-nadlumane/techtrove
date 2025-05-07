import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import axios from 'axios';
import { ServiceContext } from '../services/ServiceContext';

const Home = () => {
  const { productService } = useContext(ServiceContext);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(`${productService}/api/products/featured`);
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      }
    };
    fetchFeaturedProducts();
   }, [productService]);
  // Mock featured products (in a real app, these would come from the product service)
  // const [featuredProducts, setFeaturedProducts] = useState([
  //   {
  //     id: 1,
  //     name: "Smartphone X Pro",
  //     price: 799.99,
  //     imageUrl: "https://via.placeholder.com/300x200?text=Smartphone",
  //     averageRating: 4.5,
  //     stockQuantity: 15,
  //     featured: true
  //   },
  //   {
  //     id: 2,
  //     name: "Ultra Laptop 15",
  //     price: 1299.99,
  //     imageUrl: "https://via.placeholder.com/300x200?text=Laptop",
  //     averageRating: 4.8,
  //     stockQuantity: 8,
  //     featured: true
  //   },
  //   {
  //     id: 3,
  //     name: "Wireless Earbuds",
  //     price: 129.99,
  //     imageUrl: "https://via.placeholder.com/300x200?text=Earbuds",
  //     averageRating: 4.2,
  //     stockQuantity: 20,
  //     featured: true
  //   },
  //   {
  //     id: 4,
  //     name: "Smart Watch Series 5",
  //     price: 249.99,
  //     imageUrl: "https://via.placeholder.com/300x200?text=Smartwatch",
  //     averageRating: 4.6,
  //     stockQuantity: 12,
  //     featured: true
  //   }
  // ]);
 
  const categories = [
    { id: 'phone', name: 'Smartphones', icon: '📱' },
    { id: 'laptop', name: 'Laptops', icon: '💻' },
    { id: 'accessories', name: 'Accessories', icon: '🎧' },
    { id: 'tablet', name: 'Tablets', icon: '📟' }
  ];
 
  return (
<div className="home-page">
      {/* Hero Section */}
<div className="bg-primary text-white py-5 mb-5">
<Container>
<Row className="align-items-center">
<Col md={6} className="mb-4 mb-md-0">
<h1>Welcome to TechTrove</h1>
<p className="lead">
                Your one-stop shop for premium electronics with smart recommendations and real-time inventory
</p>
<Button 
                as={Link} 
                to="/products" 
                variant="light" 
                size="lg"
>
                Browse Products
</Button>
</Col>
<Col md={6}>
<img 
                src="https://via.placeholder.com/600x400?text=TechTrove+Banner" 
                alt="TechTrove Electronics" 
                className="img-fluid rounded shadow"
              />
</Col>
</Row>
</Container>
</div>
 
      {/* Categories Section */}
<Container className="mb-5">
<h2 className="text-center mb-4">Shop by Category</h2>
<Row xs={2} md={4} className="g-4">
          {categories.map(category => (
<Col key={category.id}>
<Card 
                as={Link} 
                // as={product_service_url}
                to={`/products/${category.id}`}
                className="h-100 text-center text-decoration-none category-card"
>
<Card.Body>
<div className="category-icon mb-3">{category.icon}</div>
<Card.Title>{category.name}</Card.Title>
</Card.Body>
</Card>
</Col>
          ))}
</Row>
</Container>
 
      {/* Featured Products Section */}
<Container className="mb-5">
<h2 className="text-center mb-4">Featured Products</h2>
<Row xs={1} md={2} lg={4} className="g-4">
          {featuredProducts.map(product => (
<Col key={product.id}>
<ProductCard product={product} />
</Col>
          ))}
</Row>
</Container>
 
      {/* Feature Highlights Section */}
<Container className="mb-5">
<h2 className="text-center mb-4">Why Choose TechTrove?</h2>
<Row xs={1} md={3} className="g-4">
<Col>
<Card className="h-100 text-center feature-card border-0 shadow-sm">
<Card.Body>
<div className="feature-icon mb-3">🔍</div>
<Card.Title>Smart Recommendations</Card.Title>
<Card.Text>
                  Get personalized product suggestions based on your browsing history and preferences.
</Card.Text>
</Card.Body>
</Card>
</Col>
<Col>
<Card className="h-100 text-center feature-card border-0 shadow-sm">
<Card.Body>
<div className="feature-icon mb-3">⚡</div>
<Card.Title>Real-time Inventory</Card.Title>
<Card.Text>
                  See product availability updates in real-time as you shop.
</Card.Text>
</Card.Body>
</Card>
</Col>
<Col>
<Card className="h-100 text-center feature-card border-0 shadow-sm">
<Card.Body>
<div className="feature-icon mb-3">💬</div>
<Card.Title>Verified Reviews</Card.Title>
<Card.Text>
                  Make informed decisions with our verified customer reviews and sentiment analysis.
</Card.Text>
</Card.Body>
</Card>
</Col>
</Row>
</Container>
</div>
  );
};
 
export default Home;