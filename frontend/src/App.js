// Frontend - App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Services
import { ServiceContext } from './services/ServiceContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { discoverServices } from './services/serviceDiscovery';

function App() {
  const [services, setServices] = useState({
    customerService: null,
    productService: null,
    feedbackService: null
  });
  
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        // Discover all required services
        const [customerService, productService, feedbackService] = await Promise.all([
          discoverServices('customer-service'),
          discoverServices('product-service'),
          discoverServices('feedback-service')
        ]);
        
        setServices({
          customerService,
          productService,
          feedbackService
        });
        
        setServicesLoaded(true);
      } catch (error) {
        console.error('Service discovery failed:', error);
        setServiceError('Failed to connect to services. Please try again later.');
      }
    }
    
    loadServices();
  }, []);

  if (serviceError) {
    return (
      <Container className="text-center mt-5">
        <h2>Service Error</h2>
        <p>{serviceError}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </Container>
    );
  }

  if (!servicesLoaded) {
    return (
      <Container className="text-center mt-5">
        <h2>Loading TechTrove</h2>
        <p>Connecting to services...</p>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Router>
      <ServiceContext.Provider value={services}>
        <AuthProvider>
          <CartProvider>
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1 py-4">
                <Container>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:category" element={<ProductList />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" />} />
                  </Routes>
                </Container>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </ServiceContext.Provider>
    </Router>
  );
}

export default App;