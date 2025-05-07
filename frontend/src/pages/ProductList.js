import React, { useState, useEffect } from 'react';

import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';

import { useParams } from 'react-router-dom';

import ProductCard from '../components/product/ProductCard';
 
const ProductList = () => {

  const { category } = useParams();

  // Mock product data (in a real app, this would come from API)

  const allProducts = [

    {

      id: 1,

      name: "Smartphone X Pro",

      description: "The latest flagship smartphone with advanced features",

      price: 799.99,

      category: "smartphones",

      brand: "TechX",

      stockQuantity: 15,

      imageUrl: "https://via.placeholder.com/300x200?text=Smartphone",

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

      imageUrl: "https://via.placeholder.com/300x200?text=Laptop",

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

      imageUrl: "https://via.placeholder.com/300x200?text=Earbuds",

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

      imageUrl: "https://via.placeholder.com/300x200?text=Smartwatch",

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

      imageUrl: "https://via.placeholder.com/300x200?text=Tablet",

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

      imageUrl: "https://via.placeholder.com/300x200?text=Gaming+Laptop",

      averageRating: 4.9,

      featured: false

    },

    {

      id: 7,

      name: "Smartphone Budget Pro",

      description: "Feature-packed smartphone at an affordable price",

      price: 399.99,

      category: "smartphones",

      brand: "ValueTech",

      stockQuantity: 25,

      imageUrl: "https://via.placeholder.com/300x200?text=Budget+Phone",

      averageRating: 4.1,

      featured: false

    },

    {

      id: 8,

      name: "Bluetooth Speaker",

      description: "Portable speaker with amazing sound quality",

      price: 79.99,

      category: "accessories",

      brand: "AudioMax",

      stockQuantity: 18,

      imageUrl: "https://via.placeholder.com/300x200?text=Speaker",

      averageRating: 4.3,

      featured: false

    }

  ];

  const [products, setProducts] = useState([]);

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

  // Extract unique categories and brands

  const categories = [...new Set(allProducts.map(product => product.category))];

  const brands = [...new Set(allProducts.map(product => product.brand))];

  // Filter and sort products

  useEffect(() => {

    setLoading(true);

    try {

      // Apply filters

      let filteredProducts = [...allProducts];

      if (filters.category) {

        filteredProducts = filteredProducts.filter(product => product.category === filters.category);

      }

      if (filters.brand) {

        filteredProducts = filteredProducts.filter(product => product.brand === filters.brand);

      }

      if (filters.minPrice) {

        filteredProducts = filteredProducts.filter(product => product.price >= parseFloat(filters.minPrice));

      }

      if (filters.maxPrice) {

        filteredProducts = filteredProducts.filter(product => product.price <= parseFloat(filters.maxPrice));

      }

      if (filters.inStock) {

        filteredProducts = filteredProducts.filter(product => product.stockQuantity > 0);

      }

     // Apply sorting

      if (filters.sortBy === 'priceAsc') {

        filteredProducts.sort((a, b) => a.price - b.price);

      } else if (filters.sortBy === 'priceDesc') {

        filteredProducts.sort((a, b) => b.price - a.price);

      } else if (filters.sortBy === 'ratingDesc') {

        filteredProducts.sort((a, b) => b.averageRating - a.averageRating);

      } else if (filters.sortBy === 'newest') {

        // In a real app, this would sort by date

        filteredProducts.sort((a, b) => b.id - a.id);

      } else {

        // Default: sort by popularity (featured first)

        filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

      }

      setProducts(filteredProducts);

    } catch (err) {

      setError('Failed to load products. Please try again later.');

    } finally {

      setLoading(false);

    }

  }, [filters]);

  // Update filters when category param changes

  useEffect(() => {

    if (category) {

      setFilters(prev => ({

        ...prev,

        category

      }));

    }

  }, [category]);

  const handleFilterChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFilters(prev => ({

      ...prev,

      [name]: type === 'checkbox' ? checked : value

    }));

  };

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
 