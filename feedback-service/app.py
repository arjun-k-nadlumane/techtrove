"""
Ultra-Minimal Feedback Service for TechTrove
Basic implementation using only built-in Python modules
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import urllib.request
from datetime import datetime
import os

# Configuration
PORT = int(os.environ.get('PORT', 8083))
SERVICE_REGISTRY_URL = os.environ.get('SERVICE_REGISTRY_URL', 'http://localhost:8080')

# In-memory storage
reviews_db = []
next_id = 1
service_id = None

# Helper functions
def simple_sentiment_analysis(text, rating):
    """A very basic sentiment analysis based on rating"""
    if not text:
        return None, None
    
    # Use rating as a basic sentiment indicator
    if rating >= 4:
        sentiment = "positive"
        score = 0.8
    elif rating <= 2:
        sentiment = "negative"
        score = -0.8
    else:
        sentiment = "neutral"
        score = 0.0
        
    return score, sentiment

def register_with_service_registry():
    global service_id
    try:
        data = json.dumps({
            'serviceName': 'feedback-service',
            'serviceUrl': f"http://localhost:{PORT}",
            'healthCheckUrl': f"http://localhost:{PORT}/health"
        }).encode('utf-8')
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        req = urllib.request.Request(
            f"{SERVICE_REGISTRY_URL}/register",
            data=data,
            headers=headers,
            method='POST'
        )
        
        with urllib.request.urlopen(req) as response:
            if response.status == 201:
                result = json.loads(response.read().decode('utf-8'))
                service_id = result.get('id')
                print(f"Registered with Service Registry. ID: {service_id}")
            else:
                print(f"Failed to register with Service Registry. Status: {response.status}")
    except Exception as e:
        print(f"Warning: Could not register with Service Registry: {str(e)}")
        print("Continuing without service registry integration.")

def deregister_from_service_registry():
    global service_id
    if service_id:
        try:
            req = urllib.request.Request(
                f"{SERVICE_REGISTRY_URL}/register/{service_id}",
                method='DELETE'
            )
            
            with urllib.request.urlopen(req) as response:
                print("Deregistered from Service Registry")
        except Exception as e:
            print(f"Warning: Could not deregister from Service Registry: {str(e)}")

class FeedbackServiceHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
    
    def do_GET(self):
        global reviews_db
        
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        # Root endpoint
        if path == '/':
            self._set_headers()
            response = {
                'message': 'Welcome to TechTrove Feedback Service API'
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # Health check endpoint
        elif path == '/health':
            self._set_headers()
            response = {
                'status': 'UP',
                'service': 'feedback-service',
                'timestamp': datetime.utcnow().isoformat()
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # List all reviews
        elif path == '  q   q':
            self._set_headers()
            self.wfile.write(json.dumps(reviews_db).encode('utf-8'))
            return
        
        # Get reviews for a product
        elif path.startswith('/api/reviews/product/'):
            try:
                product_id = int(path.split('/')[-1])
                product_reviews = [r for r in reviews_db if r['product_id'] == product_id]
                self._set_headers()
                self.wfile.write(json.dumps(product_reviews).encode('utf-8'))
            except ValueError:
                self._set_headers(400)
                response = {'error': 'Invalid product ID'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # Get analytics for a product
        elif path.startswith('/api/analytics/products/'):
            try:
                product_id = int(path.split('/')[-1])
                product_reviews = [r for r in reviews_db if r['product_id'] == product_id]
                
                if not product_reviews:
                    self._set_headers(404)
                    response = {'error': 'No reviews found for this product'}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                    return
                    
                total_reviews = len(product_reviews)
                avg_rating = sum(r['rating'] for r in product_reviews) / total_reviews if total_reviews > 0 else 0
                
                # Get simple sentiment distribution
                sentiments = [r['sentiment_label'] for r in product_reviews if r.get('sentiment_label')]
                positive_count = sentiments.count('positive')
                neutral_count = sentiments.count('neutral')
                negative_count = sentiments.count('negative')
                
                # Rating distribution
                rating_counts = {
                    '5': len([r for r in product_reviews if r['rating'] == 5]),
                    '4': len([r for r in product_reviews if r['rating'] == 4]),
                    '3': len([r for r in product_reviews if r['rating'] == 3]),
                    '2': len([r for r in product_reviews if r['rating'] == 2]),
                    '1': len([r for r in product_reviews if r['rating'] == 1]),
                }
                
                response = {
                    'product_id': product_id,
                    'total_reviews': total_reviews,
                    'average_rating': round(avg_rating, 1),
                    'sentiment_distribution': {
                        'positive': positive_count,
                        'neutral': neutral_count,
                        'negative': negative_count
                    },
                    'rating_distribution': rating_counts
                }
                
                self._set_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except ValueError:
                self._set_headers(400)
                response = {'error': 'Invalid product ID'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # Get a specific review
        elif path.startswith('/api/reviews/'):
            try:
                review_id = int(path.split('/')[-1])
                review = next((r for r in reviews_db if r['id'] == review_id), None)
                
                if review:
                    self._set_headers()
                    self.wfile.write(json.dumps(review).encode('utf-8'))
                else:
                    self._set_headers(404)
                    response = {'error': 'Review not found'}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
            except ValueError:
                self._set_headers(400)
                response = {'error': 'Invalid review ID'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # Path not found
        self._set_headers(404)
        response = {'error': 'Not found'}
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def do_POST(self):
        global reviews_db, next_id
        
        if self.path == '/api/reviews':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Validate input
            if not data.get('product_id') or not data.get('user_id') or not data.get('rating'):
                self._set_headers(400)
                response = {'message': 'Missing required fields'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
                
            if data.get('rating') < 1 or data.get('rating') > 5:
                self._set_headers(400)
                response = {'message': 'Rating must be between 1 and 5'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
                
            # Simple sentiment analysis
            sentiment_score, sentiment_label = simple_sentiment_analysis(
                data.get('comment'), 
                data.get('rating')
            )
            
            # Create review
            review = {
                'id': next_id,
                'product_id': data.get('product_id'),
                'user_id': data.get('user_id'),
                'username': data.get('username', f"User{data.get('user_id')}"),
                'rating': data.get('rating'),
                'comment': data.get('comment'),
                'sentiment_score': sentiment_score,
                'sentiment_label': sentiment_label,
                'created_at': datetime.utcnow().isoformat()
            }
            
            reviews_db.append(review)
            next_id += 1
            
            self._set_headers(201)
            self.wfile.write(json.dumps(review).encode('utf-8'))
            return
        
        self._set_headers(404)
        response = {'error': 'Not found'}
        self.wfile.write(json.dumps(response).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=FeedbackServiceHandler):
    server_address = ('', PORT)
    httpd = server_class(server_address, handler_class)
    print(f'Starting Feedback Service on port {PORT}...')
    
    # Try to register with service registry, but continue if it fails
    register_with_service_registry()
    
    try:
        print(f"Feedback Service is running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        # Try to deregister, but continue if it fails
        deregister_from_service_registry()
        httpd.server_close()
        print('Feedback Service stopped')

if __name__ == '__main__':
    run()