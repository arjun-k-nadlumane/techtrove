import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { ServiceContext } from '../services/ServiceContext';
import ProductCard from '../components/product/ProductCard';

const ProductList = () => {


  const { category } = useParams();
  const { productService } = useContext(ServiceContext);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    category: category || '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sortBy: 'popular'
  });
  
  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {

        // Build query parameters
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.inStock) params.append('inStock', true);
        params.append('sortBy', filters.sortBy);
        
        // Fetch products from backend
        const response = await fetch(`${productService}/api/products?${params}`);
        // const response = await fetch(`${product_service_url}/api/products?${params}`);
        console.log('Products:',response.data);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories and brands
        if (data && data.length > 0) {
          const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
          
          const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))];
          setBrands(uniqueBrands);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
        
        // For demo purposes, fallback to mock data if backend is not available
        const mockProducts = [
          {
            id: 1,
            name: "Smartphone X Pro",
            description: "The latest flagship smartphone with advanced features",
            price: 799.99,
            category: "smartphones",
            brand: "TechX",
            stockQuantity: 15,
            imageUrl: "/images/products/smartphone.jpg",
            averageRating: 4.5,
            featured: true
          },
          {
            id: 2,
            name: "Ultra Laptop 15",
            description: "Powerful laptop for professionals and creatives",
            price: 1299.99,
            category: "laptops",
            brand: "UltraTech",
            stockQuantity: 8,
            imageUrl: "/images/products/laptop.jpg",
            averageRating: 4.8,
            featured: true
          },
          {
            id: 3,
            name: "Wireless Earbuds",
            description: "Premium sound quality with noise cancellation",
            price: 129.99,
            category: "accessories",
            brand: "AudioMax",
            stockQuantity: 20,
            imageUrl: "/images/products/earbuds.jpg",
            averageRating: 4.2,
            featured: true
          },
          {
            id: 4,
            name: "Smart Watch Series 5",
            description: "Track your fitness and stay connected on the go",
            price: 249.99,
            category: "accessories",
            brand: "TechX",
            stockQuantity: 12,
            imageUrl: "/images/products/smartwatch.jpg",
            averageRating: 4.6,
            featured: true
          },
          {
            id: 5,
            name: "Premium Tablet Pro",
            description: "Portable tablet with stunning display",
            price: 549.99,
            category: "tablets",
            brand: "UltraTech",
            stockQuantity: 10,
            imageUrl: "/images/products/tablet.jpg",
            averageRating: 4.4,
            featured: false
          },
          {
            id: 6,
            name: "Gaming Laptop Elite",
            description: "High-performance laptop for gaming enthusiasts",
            price: 1799.99,
            category: "laptops",
            brand: "GameMaster",
            stockQuantity: 5,
            imageUrl: "/images/products/gaming-laptop.jpg",
            averageRating: 4.9,
            featured: false
          }
        ];
        
        // Filter mock products based on current filters
        let filteredProducts = [...mockProducts];
        
        if (filters.category) {
          filteredProducts = filteredProducts.filter(p => p.category === filters.category);
        }
        
        if (filters.brand) {
          filteredProducts = filteredProducts.filter(p => p.brand === filters.brand);
        }
        
        if (filters.minPrice) {
          filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(filters.minPrice));
        }
        
        if (filters.maxPrice) {
          filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(filters.maxPrice));
        }
        
        if (filters.inStock) {
          filteredProducts = filteredProducts.filter(p => p.stockQuantity > 0);
        }
        
        setProducts(filteredProducts);
        
        // Extract unique categories and brands from mock data
        const uniqueCategories = [...new Set(mockProducts.map(p => p.category))];
        setCategories(uniqueCategories);
        
        const uniqueBrands = [...new Set(mockProducts.map(p => p.brand))];
        setBrands(uniqueBrands);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters, productService]);
  
  // Update filters when category param changes
  useEffect(() => {
    if (category) {
      setFilters(prev => ({
        ...prev,
        category
      }));
    }
  }, [category]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: category || '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'popular'
    });
  };
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">
        {filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Products` : 'All Products'}
      </h2>
      
      <Row>
        {/* Filters Column */}
        <Col md={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Filters</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select 
                    name="category" 
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Select 
                    name="brand" 
                    value={filters.brand}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Min" 
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Col>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Max" 
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Col>
                  </Row>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox" 
                    label="In Stock Only" 
                    name="inStock"
                    checked={filters.inStock}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Sort By</Form.Label>
                  <Form.Select 
                    name="sortBy" 
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="popular">Popularity</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="ratingDesc">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="outline-secondary" 
                    onClick={resetFilters}
                    className="w-100"
                  >
                    Reset Filters
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Products Column */}
        <Col md={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading products...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : products.length === 0 ? (
            <Alert variant="info">
              No products found. Try changing your filters.
            </Alert>
          ) : (
            <>
              <p className="mb-3">Showing {products.length} products</p>
              <Row xs={1} md={2} lg={3} className="g-4">
                {products.map(product => (
                  <Col key={product.id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductList;