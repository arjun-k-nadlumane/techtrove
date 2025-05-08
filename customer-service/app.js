// Customer Service - app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const fetch = require('node-fetch');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const errorHandler = require('./middleware/errorHandler');
const { NODE_ENV, MONGO_URI, PORT, SERVICE_REGISTRY_URL } = require('./config');

// Initialize express app
const app = express();
const port = PORT || 8081;

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Service API',
      version: '1.0.0',
      description: 'TechTrove Customer Service API Documentation',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(cors());
const corsOptions = {
  origin: '*', // Replace with your React app's origin
  methods: 'GET,POST,DELETE,PUT',
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'customer-service',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TechTrove Customer Service API',
    environment: NODE_ENV,
    docs: '/api-docs'
  });
});

// Error handling middleware
app.use(errorHandler);

// Register with service registry
async function registerWithServiceRegistry() {
  try {
    // Check if SERVICE_REGISTRY_URL is defined
    if (!SERVICE_REGISTRY_URL) {
      console.log('Service Registry URL not defined, skipping registration');
      return;
    }

    const response = await fetch(`${SERVICE_REGISTRY_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceName: 'customer-service',
        serviceUrl: `http://localhost:${port}`,
        healthCheckUrl: `http://localhost:${port}/health`
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Registered with Service Registry. ID: ${data.id}`);
      
      // Store service ID for de-registration on shutdown
      app.set('serviceId', data.id);
    } else {
      console.error('Failed to register with Service Registry');
    }
  } catch (error) {
    console.error('Error registering with Service Registry:', error.message);
    console.log('Continuing without Service Registry registration');
  }
}

// Deregister from service registry on shutdown
function deregisterFromServiceRegistry() {
  const serviceId = app.get('serviceId');
  if (serviceId) {
    console.log(`Deregistering service ID: ${serviceId}`);
    
    try {
      fetch(`${SERVICE_REGISTRY_URL}/register/${serviceId}`, {
        method: 'DELETE',
      }).catch(err => {
        console.error('Error deregistering from Service Registry:', err.message);
      });
    } catch (error) {
      console.error('Error deregistering from Service Registry:', error.message);
    }
  }
}

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    const server = app.listen(port, () => {
      console.log(`Customer Service running in ${NODE_ENV} mode on port ${port}`);
      registerWithServiceRegistry();
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        deregisterFromServiceRegistry();
        mongoose.connection.close(false, () => {
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;