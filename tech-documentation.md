# TechTrove: Technical Documentation

## System Architecture

TechTrove is built using a microservices architecture with the following components:

### 1. Service Registry (Node.js)
- **Primary Role**: Central service discovery and monitoring
- **Key Features**:
  - Service registration and discovery
  - Health monitoring
  - Circuit breaker implementation
  - Service dashboard

### 2. Customer Service (Node.js + MongoDB)
- **Primary Role**: Manage customer accounts and operations
- **Key Features**:
  - User registration and authentication (JWT)
  - Profile management
  - Address management
  - Wishlist functionality
  - Order history

### 3. Product Service (Spring Boot + H2)
- **Primary Role**: Manage product catalog
- **Key Features**:
  - Product CRUD operations
  - Category management
  - Inventory tracking
  - Product recommendations
  - Search and filtering

### 4. Feedback Service (Python Flask + SQLite)
- **Primary Role**: Handle product reviews and ratings
- **Key Features**:
  - Review submission and retrieval
  - Sentiment analysis
  - Review analytics
  - Data visualization
  - CSV import/export

### 5. Frontend (React)
- **Primary Role**: User interface
- **Key Features**:
  - Responsive design
  - Product browsing and filtering
  - Product details with recommendations
  - Shopping cart
  - User dashboard
  - Review submission

## Communication Patterns

### Service-to-Service Communication
- **Service Registry Pattern**: All services register with the Service Registry on startup
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Fallback Mechanisms**: Provides graceful degradation when services fail
- **Retry Logic**: Automatically retries failed requests

### Frontend-to-Backend Communication
- **API Gateway Pattern**: Frontend discovers services through the Service Registry
- **JWT Authentication**: Secures communication between frontend and backend services

## Resilience Features

### 1. Circuit Breaker
The circuit breaker pattern is implemented to prevent cascading failures:
- **Closed State**: All requests pass through normally
- **Open State**: When failure threshold is reached, circuit opens and requests are immediately rejected
- **Half-Open State**: After a timeout, the circuit allows a limited number of test requests

### 2. Fallback Responses
Services provide fallback responses when downstream services are unavailable:
- Product Service falls back to basic product information when Feedback Service is down
- Frontend displays cached data when backend services are unresponsive

### 3. Health Monitoring
- Services regularly send heartbeats to the Service Registry
- Service Registry tracks health status of all services
- Dashboard provides visual monitoring of system health

## Security Implementation

### 1. Authentication
- **JWT (JSON Web Tokens)**: Used for user authentication
- **Password Hashing**: User passwords are hashed with bcrypt
- **Role-based Access**: Controls access to admin features

### 2. API Security
- **Input Validation**: All API inputs are validated
- **CORS Configuration**: Prevents unauthorized cross-origin requests
- **Rate Limiting**: Prevents abuse of APIs

## Database Design

### 1. MongoDB (Customer Service)
- **Collections**:
  - Users
  - Addresses
  - Orders

### 2. H2 Database (Product Service)
- **Tables**:
  - Products
  - Categories
  - Product_Specs
  - Product_Tags

### 3. SQLite (Feedback Service)
- **Tables**:
  - Reviews
  - Analytics

## Error Handling

### 1. Standardized Error Responses
All services return error responses in a consistent format:
```json
{
  "status": "error",
  "message": "Error description",
  "code": 400
}
```

### 2. Logging
- **Development Mode**: Detailed error logs
- **Production Mode**: Sanitized error logs without sensitive information
- **Centralized Logging**: Error logs from all services are aggregated

## API Documentation

### 1. Customer Service
- **Swagger URL**: `/api-docs`
- **Key Endpoints**:
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/login`: User login
  - `GET /api/profile`: Get user profile
  - `PUT /api/profile`: Update user profile
  - `GET /api/wishlist`: Get user wishlist
  - `POST /api/wishlist/:id`: Add product to wishlist

### 2. Product Service
- **Swagger URL**: `/swagger-ui.html`
- **Key Endpoints**:
  - `GET /api/products`: Get all products with filtering
  - `GET /api/products/:id`: Get product by ID
  - `POST /api/products`: Create a new product
  - `PUT /api/products/:id`: Update a product
  - `PATCH /api/products/:id/inventory`: Update product inventory
  - `GET /api/products/:id/recommendations`: Get product recommendations

### 3. Feedback Service
- **Swagger URL**: `/api/docs`
- **Key Endpoints**:
  - `GET /api/reviews`: Get all reviews
  - `POST /api/reviews`: Submit a new review
  - `GET /api/reviews/product/:id`: Get reviews for a product
  - `GET /api/analytics/products/:id`: Get analytics for a product
  - `GET /api/visualization/sentiment/:id`: Get sentiment visualization


## Future Enhancements

1. **Payment Gateway Integration**: Add support for real payments
2. **Recommendation Engine**: Enhance with machine learning
3. **Real-time Notifications**: Implement WebSocket for real-time updates
4. **Expanded Analytics**: Add more advanced analytics features
5. **Mobile App**: Develop a mobile app version

## Troubleshooting

### Common Issues
1. **Service Registration Failures**: Check network connectivity
2. **Database Connection Issues**: Verify connection strings
3. **JWT Validation Errors**: Ensure secret keys match

### Monitoring
- Use the Service Registry terminal for monitoring service health
- Check individual service logs for detailed error information
