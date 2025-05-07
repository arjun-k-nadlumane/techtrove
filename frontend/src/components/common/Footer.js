import React from 'react';

import { Container, Row, Col } from 'react-bootstrap';

import { Link } from 'react-router-dom';
 
const Footer = () => {

  const currentYear = new Date().getFullYear();

  return (
<footer className="bg-dark text-light py-4 mt-5">
<Container>
<Row className="mb-4">
<Col md={4} className="mb-3">
<h5><span className="text-primary fw-bold">Tech</span><span className="fw-bold">Trove</span></h5>
<p className="small">

              Your one-stop shop for premium electronics and tech products.

              Discover the latest innovations with smart recommendations.
</p>
</Col>
<Col md={2} className="mb-3">
<h6>Shop</h6>
<ul className="list-unstyled">
<li><Link to="/products" className="text-decoration-none text-light">All Products</Link></li>
<li><Link to="/products/smartphones" className="text-decoration-none text-light">Smartphones</Link></li>
<li><Link to="/products/laptops" className="text-decoration-none text-light">Laptops</Link></li>
<li><Link to="/products/accessories" className="text-decoration-none text-light">Accessories</Link></li>
</ul>
</Col>
<Col md={2} className="mb-3">
<h6>Account</h6>
<ul className="list-unstyled">
<li><Link to="/login" className="text-decoration-none text-light">Login</Link></li>
<li><Link to="/register" className="text-decoration-none text-light">Register</Link></li>
<li><Link to="/profile" className="text-decoration-none text-light">My Account</Link></li>
<li><Link to="/cart" className="text-decoration-none text-light">Cart</Link></li>
</ul>
</Col>
<Col md={4} className="mb-3">
<h6>Contact Us</h6>
<address className="small">
<div>123 Tech Street</div>
<div>San Francisco, CA 94103</div>
<div>Email: support@techtrove.com</div>
<div>Phone: (123) 456-7890</div>
</address>
</Col>
</Row>
<hr className="my-3" />
<Row>
<Col className="text-center small">
&copy; {currentYear} TechTrove. All rights reserved.
</Col>
</Row>
</Container>
</footer>

  );

};
 
export default Footer;
 