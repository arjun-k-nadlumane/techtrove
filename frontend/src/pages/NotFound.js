import React from 'react';

import { Container, Row, Col, Button } from 'react-bootstrap';

import { Link } from 'react-router-dom';
 
const NotFound = () => {

  return (
<Container className="py-5 text-center">
<Row className="justify-content-center">
<Col md={8} lg={6}>
<div className="not-found-content">
<h1 className="display-1 fw-bold text-primary">404</h1>
<h2 className="mb-4">Page Not Found</h2>
<p className="lead mb-5">

              The page you are looking for might have been removed, had its name changed, 

              or is temporarily unavailable.
</p>
<div className="d-grid gap-2 d-md-flex justify-content-md-center">
<Button as={Link} to="/" variant="primary" size="lg">

                Go to Homepage
</Button>
<Button as={Link} to="/products" variant="outline-primary" size="lg">

                Browse Products
</Button>
</div>
</div>
</Col>
</Row>
</Container>

  );

};
 
export default NotFound;
 