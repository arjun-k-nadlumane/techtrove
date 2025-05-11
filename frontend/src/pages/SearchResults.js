// pages/SearchResults.js
import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ProductCard from '../components/product/ProductCard'; // Assuming you have a product card
import { ServiceContext } from '../services/ServiceContext';
const SearchResults = () => {
 const [results, setResults] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const location = useLocation();
 const services = useContext(ServiceContext);
 const query = new URLSearchParams(location.search);
 const keyword = query.get('keyword');
 useEffect(() => {
   const fetchResults = async () => {
     setLoading(true);
     try {
       const res = await axios.get(`${services.productService}/api/products/search?keyword=${keyword}`);
       setResults(res.data);
     } catch (err) {
       setError('Failed to fetch search results.');
     } finally {
       setLoading(false);
     }
   };
   if (keyword) {
     fetchResults();
   }
 }, [keyword, services]);
 if (loading) return <Spinner animation="border" />;
 if (error) return <Alert variant="danger">{error}</Alert>;
 return (
<Container className="my-4">
<h3>Search Results for "{keyword}"</h3>
<Row>
       {results.length > 0 ? results.map(product => (
<Col key={product.id} sm={12} md={6} lg={4} xl={3}>
<ProductCard product={product} />
</Col>
       )) : <p>No products found.</p>}
</Row>
</Container>
 );
};
export default SearchResults;