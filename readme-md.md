# TechTrove: Smart Electronics Marketplace

A microservices-based e-commerce platform for electronics with smart recommendations, sentiment analysis, and a seamless shopping experience.

![TechTrove Architecture](architecture-diagram.png)

## Project Overview

TechTrove is a modern e-commerce platform built on microservices architecture. The system consists of:

1. **Customer Service** (Node.js): Handles user authentication, profile management, and wishlist functionality
2. **Service Registry** (Node.js): Provides service discovery and health monitoring
3. **Product Service** (Spring Boot): Manages product catalog and recommendations
4. **Feedback Service** (Python Flask): Collects reviews and provides sentiment analysis
5. **Frontend** (React): Delivers an intuitive shopping experience

## Features

- User authentication and profile management
- Comprehensive product catalog with filtering
- Smart product recommendations
- Review system with sentiment analysis
- Real-time inventory updates
- Service health monitoring
- Fault tolerance with circuit breaker pattern

## Architecture

The application follows a microservices architecture with the following components:

![TechTrove Architecture](architecture-diagram.png)

- **Customer Service**: Node.js application with MongoDB
- **Service Registry**: Node.js application for service discovery
- **Product Service**: Spring Boot application with H2 database
- **Feedback Service**: Python Flask application with SQLite
- **Frontend**: React application

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- Java 11+
- Python 3.8+
- MongoDB
- npm/yarn

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/your-username/techtrove.git
   cd techtrove
   ```

2. Set up Service Registry:
   ```
   cd service-registry
   npm install
   npm start
   ```
   Service Registry will be available at http://localhost:8080

3. Set up Customer Service:
   ```
   cd ../customer-service
   npm install
   npm start
   ```
   Customer Service will be available at http://localhost:8081

4. Set up Product Service:
   ```
   cd ../product-service
   ./mvnw spring-boot:run
   ```
   Product Service will be available at http://localhost:8082

5. Set up Feedback Service:
   ```
   cd ../feedback-service
   pip install -r requirements.txt
   python app.py
   ```
   Feedback Service will be available at http://localhost:8083

6. Set up Frontend:
   ```
   cd ../frontend
   npm install
   npm start
   ```
   Frontend will be available at http://localhost:3000

## API Documentation

- Customer Service Swagger: http://localhost:8081/api-docs
- Product Service Swagger: http://localhost:8082/swagger-ui.html
- Feedback Service Swagger: http://localhost:8083/api/docs

## Technical Documentation

### Customer Service

The Customer Service handles user authentication, profile management, and order history.

#### Key Components:
- **Authentication Controller**: Handles user registration, login, and token validation
- **Profile Controller**: Manages user profile information
- **Wishlist Controller**: Handles user wishlist operations
- **MongoDB Integration**: Stores user data
- **JWT Authentication**: Secures API endpoints
- **Error Handling**: Comprehensive error handling with standardized response formats

#### Environment Variables:
- `NODE_ENV`: Set to 'development' or 'production'
- `PORT`: Service port (default: 8081)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `SERVICE_REGISTRY_URL`: URL of the Service Registry

### Service Registry

The Service Registry provides service discovery and health monitoring.

#### Key Components:
- **Registry Controller**: Handles service registration and discovery
- **Health Monitor**: Monitors service health status
- **Circuit Breaker**: Implements fault tolerance
- **Dashboard**: Provides a visual overview of service status

#### Environment Variables:
- `PORT`: Service port (default: 8080)

### Product Service

The Product Service manages the product catalog and provides recommendation functionality.

#### Key Components:
- **Product Controller**: Handles product CRUD operations
- **Category Controller**: Manages product categories
- **Recommendation Service**: Provides product recommendations
- **H2 Database**: Stores product data
- **Swagger Documentation**: Provides API documentation

#### Environment Variables:
- `SERVER_PORT`: Service port (default: 8082)
- `SERVICE_REGISTRY_URL`: URL of the Service Registry

### Feedback Service

The Feedback Service collects and analyzes product reviews.

#### Key Components:
- **Review Controller**: Handles review submission and retrieval
- **Analytics Service**: Provides sentiment analysis and statistics
- **Visualization Controller**: Generates graphical representations of feedback data
- **SQLite Database**: Stores review data

#### Environment Variables:
- `FLASK_ENV`: Set to 'development' or 'production'
- `PORT`: Service port (default: 8083)
- `SERVICE_REGISTRY_URL`: URL of the Service Registry

### Frontend

The React frontend provides the user interface for the e-commerce platform.

#### Key Components:
- **Authentication Components**: Handle user login and registration
- **Product Catalog**: Displays products with filtering
- **Product Detail**: Shows detailed product information with reviews
- **Shopping Cart**: Manages user shopping cart
- **User Dashboard**: Displays user information and order history
- **Admin Dashboard**: Provides administrative functionality

## Circuit Breaker Pattern

The application implements the Circuit Breaker pattern to ensure fault tolerance:

1. **Closed State**: All requests pass through to the service
2. **Open State**: When a service fails repeatedly, the circuit breaker opens and requests are rejected
3. **Half-Open State**: After a timeout, the circuit breaker allows a limited number of test requests

This pattern prevents cascading failures and ensures system stability even when individual services fail.

## Testing

Each service includes unit and integration tests:

- Customer Service: `npm test`
- Service Registry: `npm test`
- Product Service: `./mvnw test`
- Feedback Service: `pytest`
- Frontend: `npm test`

## Contributors

- Your Name - Frontend & Customer Service
- Aditi - Product Service
- Sachil - Feedback Service

## License

This project is licensed under the MIT License - see the LICENSE file for details.
