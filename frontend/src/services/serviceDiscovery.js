// services/serviceDiscovery.js
import axios from 'axios';

// Service Registry URL
const SERVICE_REGISTRY_URL = process.env.REACT_APP_SERVICE_REGISTRY_URL || 'http://localhost:8080';

/**
 * Discover service instances from the service registry
 * @param {string} serviceName - Name of the service to discover
 * @returns {Promise<string>} Base URL of the service
 */
export async function discoverServices(serviceName) {
  try {
    // Fetch services from registry
    const response = await axios.get(`${SERVICE_REGISTRY_URL}/services/${serviceName}`);
    
    if (!response.data || response.data.length === 0) {
      throw new Error(`No healthy instances of ${serviceName} available`);
    }
    
    // Return the URL of the first available instance
    return response.data[0].url;
  } catch (error) {
    console.error(`Error discovering ${serviceName}:`, error.message);
    throw new Error(`Failed to discover ${serviceName}`);
  }
}

/**
 * Create a client for a specific service with automatic service discovery
 * @param {string} serviceName - Name of the service
 * @returns {Promise<Object>} Axios instance configured for the service
 */
export async function createServiceClient(serviceName) {
  const baseURL = await discoverServices(serviceName);
  
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      // Add auth token if available in localStorage
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    }
  });
}

/**
 * Wrapper for API calls with circuit breaker pattern
 * @param {Function} apiCall - API call function to execute
 * @param {number} retries - Number of retries (default: 2)
 * @param {Function} fallback - Fallback function for when all retries fail
 * @returns {Promise<any>} API response or fallback response
 */
export async function withCircuitBreaker(apiCall, retries = 2, fallback = null) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}/${retries + 1}):`, error.message);
      lastError = error;
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 300;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed, use fallback if provided
  if (fallback) {
    return fallback();
  }
  
  throw lastError;
}