import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }
      
      const data = await response.json();
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('token', data.token);
      return data.data;
    } catch (err) {
      setError(err.message || 'Failed to login');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }
      
      const data = await response.json();
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('token', data.token);
      return data.data;
    } catch (err) {
      setError(err.message || 'Failed to register');
      throw err;
    }
  };

  const logout = () => {
    // Make API call to logout endpoint
    fetch('http://localhost:8081/api/auth/logout', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).catch(err => console.error('Logout error:', err));
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}