import React, { useState } from 'react';

import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
 
const Login = () => {

  const [formData, setFormData] = useState({

    email: '',

    password: ''

  });

  const [validated, setValidated] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const { login } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();
 
  // Get redirect path from location state or default to home

  const from = location.state?.from?.pathname || '/';
 
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({

      ...prev,

      [name]: value

    }));

  };
 
  const handleSubmit = async (e) => {

    e.preventDefault();

    const form = e.currentTarget;

    if (form.checkValidity() === false) {

      e.stopPropagation();

      setValidated(true);

      return;

    }

    setLoading(true);

    setError('');

    try {

      await login(formData.email, formData.password);

      navigate(from, { replace: true });

    } catch (err) {

      setError(err.message || 'Failed to login. Please check your credentials.');

    } finally {

      setLoading(false);

    }

  };
 
  return (
<Container className="py-5">
<Row className="justify-content-center">
<Col md={6} lg={5}>
<Card className="shadow">
<Card.Body className="p-4">
<h2 className="text-center mb-4">Login</h2>

              {error && <Alert variant="danger">{error}</Alert>}
<Form noValidate validated={validated} onSubmit={handleSubmit}>
<Form.Group className="mb-3" controlId="email">
<Form.Label>Email Address</Form.Label>
<Form.Control

                    type="email"

                    name="email"

                    value={formData.email}

                    onChange={handleChange}

                    required

                    autoComplete="email"

                  />
<Form.Control.Feedback type="invalid">

                    Please enter a valid email address.
</Form.Control.Feedback>
</Form.Group>
<Form.Group className="mb-4" controlId="password">
<Form.Label>Password</Form.Label>
<Form.Control

                    type="password"

                    name="password"

                    value={formData.password}

                    onChange={handleChange}

                    required

                    autoComplete="current-password"

                  />
<Form.Control.Feedback type="invalid">

                    Please enter your password.
</Form.Control.Feedback>
</Form.Group>
<div className="d-grid">
<Button 

                    variant="primary" 

                    type="submit"

                    disabled={loading}
>

                    {loading ? (
<>
<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>

                        Logging in...
</>

                    ) : 'Login'}
</Button>
</div>
</Form>
<div className="text-center mt-4">
<p className="mb-0">

                  Don't have an account? <Link to="/register">Register</Link>
</p>
</div>
</Card.Body>
</Card>
</Col>
</Row>
</Container>

  );

};
 
export default Login;
 