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
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);
 
  const login = async (email, password) => {
    setError(null);
    try {
      // In a real app, make API request to authenticate
      // For demo purposes, simulate login
      const user = { id: 1, name: 'Test User', email, role: 'user' };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'demo-token-123456');
      return user;
    } catch (err) {
      setError(err.message || 'Failed to login');
      throw err;
    }
  };
 
  const register = async (name, email, password) => {
    setError(null);
    try {
      // In a real app, make API request to register
      // For demo purposes, simulate registration
      const user = { id: 1, name, email, role: 'user' };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'demo-token-123456');
      return user;
    } catch (err) {
      setError(err.message || 'Failed to register');
      throw err;
    }
  };
 
  const logout = () => {
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