# TechTrove Project Setup Instructions

This document provides step-by-step instructions for setting up and running the TechTrove e-commerce microservices project.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v14+)
- Java 11+
- Python 3.8+
- MongoDB
- npm or yarn
- Maven

## Repository Structure

Clone the project repository and navigate to the project directory:

```bash
git clone https://github.com/your-team-name/techtrove.git
cd techtrove
```

The repository has the following structure:

```
techtrove/
├── service-registry/      # Node.js service registry
├── customer-service/      # Node.js customer service
├── product-service/       # Spring Boot product service
├── feedback-service/      # Python Flask feedback service
├── frontend/             # React frontend
└── docs/                 # Documentation
```

## Step 1: Set Up and Start the Service Registry

```bash
cd service-registry
npm install
npm start
```

The Service Registry will be running at: http://localhost:8080

## Step 2: Set Up and Start the Customer Service

First, make sure MongoDB is running. Then:

```bash
cd ../customer-service
npm install
```

Create a `.env` file in the customer-service directory with the following content:

```
NODE_ENV=development
PORT=8081
MONGO_URI=mongodb://localhost:27017/techtrove
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
SERVICE_REGISTRY_URL=http://localhost:8080
```

Then start the service:

```bash
npm start
```

The Customer Service will be running at: http://localhost:8081

## Step 3: Set Up and Start the Product Service

```bash
cd ../product-service
```

Create an `application.properties` file in `src/main/resources` with the following content:

```properties
server.port=8082
spring.datasource.url=jdbc:h2:mem:productdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Then build and run the service:

```bash
./mvnw spring-boot:run
```

The Product Service will be running at: http://localhost:8082

## Step 4: Set Up and Start the Feedback Service

```bash
cd ../feedback-service
```

Create a Python virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the feedback-service directory with the following content:

```
FLASK_APP=app.py
FLASK_ENV=development
PORT=8083
SERVICE_REGISTRY_URL=http://localhost:8080
```

Then start the service:

```bash
python app.py
```

The Feedback Service will be running at: http://localhost:8083

## Step 5: Set Up and Start the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory with the following content:

```
REACT_APP_SERVICE_REGISTRY_URL=http://localhost:8080
```

Then start the frontend:

```bash
npm start
```

The Frontend will be running at: http://localhost:3000

## Loading Initial Data

To populate the system with initial test data, follow these steps:

### For Customer Service

Use the API endpoint to register a test user:

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### For Product Service

Use the H2 console (http://localhost:8082/h2-console) or API endpoints to add test products.

Example API call:

```bash
curl -X POST http://localhost:8082/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone X",
    "description": "Latest smartphone with advanced features",
    "price": 799.99,
    "category": "Smartphones",
    "brand": "TechX",
    "stockQuantity": 25,
    "imageUrl": "https://via.placeholder.com/300"
  }'
```

### For Feedback Service

Use the API to add test reviews:

```bash
curl -X POST http://localhost:8083/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "user_id": 1,
    "username": "Test User",
    "rating": 5,
    "comment": "Excellent product, highly recommended!"
  }'
```

## API Documentation

- Customer Service Swagger: http://localhost:8081/api-docs
- Product Service Swagger: http://localhost:8082/swagger-ui.html
- Feedback Service Swagger: http://localhost:8083/api/docs

## Troubleshooting

If you encounter any issues with the services connecting to each other:

1. Make sure all services are running
2. Check the service registry dashboard at http://localhost:8080/dashboard
3. Verify that environment variables are set correctly
4. Check the logs for each service for error messages

## Development Workflow

1. Each team member should work on their assigned service
2. Use git branches for feature development
3. Create pull requests for code review
4. Merge changes to the main branch after review

Happy coding!
