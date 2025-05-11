import {React, useState} from 'react';

import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';

import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import { useCart } from '../../context/CartContext';

import {Form, FormControl} from 'react-bootstrap';


 
const Header = () => {

  const { user, logout } = useAuth();

  const { getCartItemCount } = useCart();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch =(e) => {
    e.preventDefault();
    if (searchTerm.trim()){
      navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };
 
  const handleLogout = () => {

    logout();

    navigate('/');

  };

 
  return (
<Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
<Container>
<Navbar.Brand as={Link} to="/">
<span className="fw-bold text-primary">Tech</span>
<span className="fw-bold">Trove</span>
</Navbar.Brand>
<Navbar.Toggle aria-controls="basic-navbar-nav" />
<Navbar.Collapse id="basic-navbar-nav">
<Nav className="me-auto">
<Nav.Link as={Link} to="/">Home</Nav.Link>
<Nav.Link as={Link} to="/products">Products</Nav.Link>

            {user && (
<Nav.Link as={Link} to="/profile">My Account</Nav.Link>

            )}
</Nav>
<Form className="d-flex me-3" onSubmit={handleSearch}>
  <FormControl
  type='search'
  placeholder='Search Products...'
  className='me-2'
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  />
  <Button type='submit' variant='outline-light' size='sm'>Search</Button>
</Form>
<Nav>
<Nav.Link as={Link} to="/cart" className="me-3 position-relative">
<i className="bi bi-cart3 fs-5"></i>

              {getCartItemCount() > 0 && (
<Badge 

                  bg="primary" 

                  pill 

                  className="position-absolute top-0 start-100 translate-middle"
>

                  {getCartItemCount()}
</Badge>

              )}
</Nav.Link>

            {user ? (
<div className="d-flex align-items-center">
<span className="text-light me-3">
<i className="bi bi-person-circle me-1"></i>

                  {user.name}
</span>
<Button 

                  variant="outline-light" 

                  size="sm"

                  onClick={handleLogout}
>

                  Logout
</Button>
</div>

            ) : (
<Nav.Link as={Link} to="/login">Login</Nav.Link>

            )}
</Nav>
</Navbar.Collapse>
</Container>
</Navbar>

  );

};
 
export default Header;
 