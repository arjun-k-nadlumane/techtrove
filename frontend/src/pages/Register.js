import React, { useState } from 'react';

import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
 
const Register = () => {

  const [formData, setFormData] = useState({

    name: '',

    email: '',

    password: '',

    confirmPassword: ''

  });

  const [validated, setValidated] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const { register } = useAuth();

  const navigate = useNavigate();
 
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

    // Check if passwords match

    if (formData.password !== formData.confirmPassword) {

      setError('Passwords do not match');

      return;

    }

    setLoading(true);

    setError('');

    try {

      await register(formData.name, formData.email, formData.password);

      navigate('/');

    } catch (err) {

      setError(err.message || 'Failed to register. Please try again.');

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
<h2 className="text-center mb-4">Create Account</h2>

              {error && <Alert variant="danger">{error}</Alert>}
<Form noValidate validated={validated} onSubmit={handleSubmit}>
<Form.Group className="mb-3" controlId="name">
<Form.Label>Full Name</Form.Label>
<Form.Control

                    type="text"

                    name="name"

                    value={formData.name}

                    onChange={handleChange}

                    required

                    minLength={2}

                    autoComplete="name"

                  />
<Form.Control.Feedback type="invalid">

                    Please enter your name.
</Form.Control.Feedback>
</Form.Group>
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
<Form.Group className="mb-3" controlId="password">
<Form.Label>Password</Form.Label>
<Form.Control

                    type="password"

                    name="password"

                    value={formData.password}

                    onChange={handleChange}

                    required

                    minLength={6}

                    autoComplete="new-password"

                  />
<Form.Control.Feedback type="invalid">

                    Password must be at least 6 characters.
</Form.Control.Feedback>
</Form.Group>
<Form.Group className="mb-4" controlId="confirmPassword">
<Form.Label>Confirm Password</Form.Label>
<Form.Control

                    type="password"

                    name="confirmPassword"

                    value={formData.confirmPassword}

                    onChange={handleChange}

                    required

                    autoComplete="new-password"

                  />
<Form.Control.Feedback type="invalid">

                    Please confirm your password.
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

                        Creating Account...
</>

                    ) : 'Register'}
</Button>
</div>
</Form>
<div className="text-center mt-4">
<p className="mb-0">

                  Already have an account? <Link to="/login">Login</Link>
</p>
</div>
</Card.Body>
</Card>
</Col>
</Row>
</Container>

  );

};
 
export default Register;
 