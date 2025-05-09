// src/context/AuthContext.js - Fixed version with proper null checking

import React, { createContext, useState, useContext, useEffect } from 'react';
import { ServiceContext } from '../services/ServiceContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { customerService } = useContext(ServiceContext);
  
  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Simply set the user from localStorage for now
          // We're keeping it simple to avoid additional errors
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [customerService]);
  
  const login = async (email, password) => {
    try {
      const response = await fetch(`${customerService}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }
      
      const data = await response.json();
      
      // Add extensive logging to debug the response structure
      console.log('Login response data:', data);
      
      // Important: Check if the response actually contains a token
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', data.token);
      
      // Create a minimal user object based on available data
      // with null checking for each property
      const userData = {
        id: data.user?.id || data._id || data.id || 'unknown',
        name: data.user?.name || data.name || email.split('@')[0], // Fallback to part of email
        email: data.user?.email || data.email || email,
        role: data.user?.role || data.role || 'user'
      };
      
      console.log('Created user data:', userData);
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${customerService}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
      }
      
      const data = await response.json();
      console.log('Register response data:', data);
      
      // Some backends automatically log in the user after registration
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        // Create user data with fallbacks
        const userData = {
          id: data.user?.id || data._id || data.id || 'unknown',
          name: data.user?.name || data.name || name,
          email: data.user?.email || data.email || email,
          role: data.user?.role || data.role || 'user'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;