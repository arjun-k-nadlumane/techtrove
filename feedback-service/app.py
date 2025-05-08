"""
TechTrove Feedback Service - Flask Implementation
Preserves exact same API endpoints and response formats as the original
"""
 
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import urllib.parse
import urllib.request
from datetime import datetime
import os
 
# Configuration
PORT = int(os.environ.get('PORT', 8083))
SERVICE_REGISTRY_URL = os.environ.get('SERVICE_REGISTRY_URL', 'http://localhost:8080')
 
# In-memory storage
reviews_db = []                     # holds reviews submitted by users
next_id = 1                         # generates unique ids for each reviews
service_id = None                   # variable that stores the service id after registered!
 
# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
 
 
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
 
 
# Routes
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Welcome to TechTrove Feedback Service API'
    })
 
 
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'UP',
        'service': 'feedback-service',
        'timestamp': datetime.utcnow().isoformat()
    })
 
 
 
@app.route('/api/reviews', methods=['GET'])
def list_all_reviews():
    return jsonify(reviews_db)
 
 
 
@app.route('/api/reviews/legacy', methods=['GET'])
def list_all_reviews_buggy():
    return jsonify(reviews_db)
 
 
@app.route('/api/reviews/product/<product_id>', methods=['GET'])
def get_product_reviews(product_id):
    try:
        product_id_int = int(product_id)
        product_reviews = [r for r in reviews_db if r['product_id'] == product_id_int]
        return jsonify(product_reviews)
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400
 
 
@app.route('/api/analytics/products/<product_id>', methods=['GET'])
def get_product_analytics(product_id):
    try:
        product_id_int = int(product_id)
        product_reviews = [r for r in reviews_db if r['product_id'] == product_id_int]
       
        if not product_reviews:
            return jsonify({'error': 'No reviews found for this product'}), 404
           
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
            'product_id': product_id_int,
            'total_reviews': total_reviews,
            'average_rating': round(avg_rating, 1),
            'sentiment_distribution': {
                'positive': positive_count,
                'neutral': neutral_count,
                'negative': negative_count
            },
            'rating_distribution': rating_counts
        }
       
        return jsonify(response)
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400
 
 
@app.route('/api/reviews/<review_id>', methods=['GET'])
def get_review(review_id):
    try:
        review_id_int = int(review_id)
        review = next((r for r in reviews_db if r['id'] == review_id_int), None)
       
        if review:
            return jsonify(review)
        else:
            return jsonify({'error': 'Review not found'}), 404
    except ValueError:
        return jsonify({'error': 'Invalid review ID'}), 400
 
 
@app.route('/api/reviews', methods=['POST'])
def create_review():
    global reviews_db, next_id
   
    data = request.get_json()
    print("Received review:",data)
   
    # Validate input
    if not data.get('product_id') or not data.get('user_id') or not data.get('rating'):
        return jsonify({'message': 'Missing required fields'}), 400
       
    if data.get('rating') < 1 or data.get('rating') > 5:
        return jsonify({'message': 'Rating must be between 1 and 5'}), 400
       
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
   
    return jsonify(review), 201
 
 
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404
 
 
# Handle preflight OPTIONS requests for CORS
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200
 
 
if __name__ == '__main__':
    # Try to register with service registry, but continue if it fails
    register_with_service_registry()
   
    try:
        print(f"Feedback Service is running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        app.run(host='0.0.0.0', port=PORT)
    except KeyboardInterrupt:
        pass
    finally:
        # Try to deregister, but continue if it fails
        deregister_from_service_registry()
        print('Feedback Service stopped')