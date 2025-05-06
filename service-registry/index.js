// Service Registry - index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory storage for registered services
const serviceRegistry = {};

// Circuit breaker state storage
const circuitBreakers = {};

// Health check intervals
const healthCheckIntervals = {};

// Initialize circuit breaker for a service
function initCircuitBreaker(serviceId) {
  if (!circuitBreakers[serviceId]) {
    circuitBreakers[serviceId] = {
      failures: 0,
      state: 'CLOSED', // CLOSED, OPEN, HALF-OPEN
      lastStateChange: Date.now(),
      failureThreshold: 5,
      resetTimeout: 30000 // 30 seconds
    };
  }
  return circuitBreakers[serviceId];
}

// Register a new service instance
app.post('/register', (req, res) => {
  const { serviceName, serviceUrl, healthCheckUrl } = req.body;
  
  if (!serviceName || !serviceUrl) {
    return res.status(400).json({ error: 'Service name and URL are required' });
  }

  const serviceId = uuidv4();
  
  // Add service to registry
  serviceRegistry[serviceId] = {
    id: serviceId,
    name: serviceName,
    url: serviceUrl,
    healthCheckUrl: healthCheckUrl || `${serviceUrl}/health`,
    status: 'UP',
    lastHeartbeat: Date.now(),
    registeredAt: Date.now()
  };
  
  // Initialize circuit breaker
  initCircuitBreaker(serviceId);
  
  // Set up health check interval
  setupHealthCheck(serviceId);
  
  console.log(`Service registered: ${serviceName} at ${serviceUrl} with ID ${serviceId}`);
  
  res.status(201).json({ 
    id: serviceId,
    name: serviceName,
    status: 'UP'
  });
});

// De-register a service
app.delete('/register/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  
  if (serviceRegistry[serviceId]) {
    // Clear health check interval
    if (healthCheckIntervals[serviceId]) {
      clearInterval(healthCheckIntervals[serviceId]);
      delete healthCheckIntervals[serviceId];
    }
    
    // Remove service from registry
    const serviceName = serviceRegistry[serviceId].name;
    delete serviceRegistry[serviceId];
    delete circuitBreakers[serviceId];
    
    console.log(`Service de-registered: ${serviceName} with ID ${serviceId}`);
    
    return res.status(200).json({ message: 'Service de-registered successfully' });
  }
  
  res.status(404).json({ error: 'Service not found' });
});

// Get all instances of a specific service
app.get('/services/:serviceName', (req, res) => {
  const { serviceName } = req.params;
  
  // Filter services by name and status
  const serviceInstances = Object.values(serviceRegistry)
    .filter(service => service.name === serviceName && service.status === 'UP');
  
  if (serviceInstances.length === 0) {
    return res.status(404).json({ error: `No healthy instances of service ${serviceName} found` });
  }
  
  res.json(serviceInstances);
});

// Get a specific service instance by ID
app.get('/service/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  
  if (!serviceRegistry[serviceId]) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  res.json(serviceRegistry[serviceId]);
});

// Get all registered services
app.get('/services', (req, res) => {
  res.json(Object.values(serviceRegistry));
});

// Get circuit breaker status
app.get('/circuit-breaker/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  
  if (!circuitBreakers[serviceId]) {
    return res.status(404).json({ error: 'Circuit breaker not found' });
  }
  
  res.json(circuitBreakers[serviceId]);
});

// Health check endpoint for the registry itself
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: Object.keys(serviceRegistry).length
  });
});

// Dashboard endpoint for monitoring
app.get('/dashboard', (req, res) => {
  res.json({
    services: Object.values(serviceRegistry),
    circuitBreakers: circuitBreakers
  });
});

// Setup health check for a service
function setupHealthCheck(serviceId) {
  const service = serviceRegistry[serviceId];
  const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  
  healthCheckIntervals[serviceId] = setInterval(async () => {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(service.healthCheckUrl, { timeout: 5000 });
      
      if (response.ok) {
        // Update service status
        serviceRegistry[serviceId].status = 'UP';
        serviceRegistry[serviceId].lastHeartbeat = Date.now();
        
        // Reset circuit breaker failures
        const breaker = circuitBreakers[serviceId];
        if (breaker.state === 'HALF-OPEN') {
          breaker.state = 'CLOSED';
          breaker.failures = 0;
          breaker.lastStateChange = Date.now();
          console.log(`Circuit breaker for ${service.name} closed after successful health check`);
        }
      } else {
        handleHealthCheckFailure(serviceId);
      }
    } catch (error) {
      handleHealthCheckFailure(serviceId);
    }
  }, HEALTH_CHECK_INTERVAL);
}

// Handle health check failure
function handleHealthCheckFailure(serviceId) {
  const service = serviceRegistry[serviceId];
  console.log(`Health check failed for service ${service.name}`);
  
  // Update service status
  serviceRegistry[serviceId].status = 'DOWN';
  
  // Update circuit breaker
  const breaker = circuitBreakers[serviceId];
  breaker.failures++;
  
  // Trip circuit breaker if threshold is reached
  if (breaker.state === 'CLOSED' && breaker.failures >= breaker.failureThreshold) {
    breaker.state = 'OPEN';
    breaker.lastStateChange = Date.now();
    console.log(`Circuit breaker for ${service.name} opened after ${breaker.failures} failures`);
    
    // Schedule reset to half-open
    setTimeout(() => {
      if (circuitBreakers[serviceId] && circuitBreakers[serviceId].state === 'OPEN') {
        circuitBreakers[serviceId].state = 'HALF-OPEN';
        circuitBreakers[serviceId].lastStateChange = Date.now();
        console.log(`Circuit breaker for ${service.name} half-opened after timeout`);
      }
    }, breaker.resetTimeout);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Service Registry running on port ${PORT}`);
});