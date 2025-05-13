import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import Wishlist from './pages/Wishlist'; // Import the new Wishlist page
import NotFound from './pages/NotFound';
import SearchResults from './pages/SearchResults';
import Payment from './pages/Payment';
import ProductVisualization from './pages/ProductVisualization';

// Context
import { ServiceContext } from './services/ServiceContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext'; // Import WishlistProvider

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  return children;
};

function App() {
  // In a real app, these services would be discovered dynamically
  // For the demo, we're hardcoding the URLs
  const [services] = useState({
    customerService: 'http://localhost:8081',
    productService: 'http://localhost:8082',
    feedbackService: 'http://localhost:8083'
  });

  return (
    <Router>
      <ServiceContext.Provider value={services}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider> {/* Add WishlistProvider here */}
              <div className="d-flex flex-column min-vh-100">
                <Header />
                <main className="flex-grow-1 py-3">
                  <Container>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/:category" element={<ProductList />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/search" element={<SearchResults/>}/>
                      <Route path="/products/:productId/visualizations" element={<ProductVisualization />} />

                      {/* Protected routes with explicit protection */}
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />

                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } />

                      <Route path="/order-confirmation/:id" element={
                        <ProtectedRoute>
                          <OrderConfirmation />
                        </ProtectedRoute>
                      } />

                      <Route path="/payment/:id" element={
                        <ProtectedRoute>
                          <Payment />
                        </ProtectedRoute>
                      } />

                      <Route path="/order-history" element={
                        <ProtectedRoute>
                          <OrderHistory />
                        </ProtectedRoute>
                      } />

                      <Route path="/order-details/:id" element={
                        <ProtectedRoute>
                          <OrderDetails />
                        </ProtectedRoute>
                      } />

                      {/* Add new wishlist route */}
                      <Route path="/wishlist" element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      } />

                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" />} />
                    </Routes>
                  </Container>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ServiceContext.Provider>
    </Router>
  );
}

export default App;