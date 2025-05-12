"""
TechTrove Feedback Service - Flask Implementation with SQLite
Preserves exact same API endpoints and response formats as the original
"""
 
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import urllib.parse
import urllib.request
from datetime import datetime
import os
import sqlite3
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
 
# Configuration
PORT = int(os.environ.get('PORT', 8083))
SERVICE_REGISTRY_URL = os.environ.get('SERVICE_REGISTRY_URL', 'http://localhost:8080')
DB_PATH = os.environ.get('DB_PATH', 'feedback.db')

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Variable to store service registry ID
service_id = None

# Helper function to initialize the database
def init_db():
    """Create the database tables if they don't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create reviews table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        username TEXT,
        rating INTEGER NOT NULL,
        comment TEXT,
        sentiment_score REAL,
        sentiment_label TEXT,
        created_at TEXT NOT NULL
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

# Helper function to get the next available ID
def get_next_id():
    """Get the next available ID from the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(id) FROM reviews")
    result = cursor.fetchone()[0]
    conn.close()
    return 1 if result is None else result + 1

# Helper functions for sentiment analysis (unchanged)
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
 
# Service registry functions (unchanged)
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

# Routes (unchanged root endpoints)
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
 
# Updated routes to use SQLite
@app.route('/api/reviews', methods=['GET'])
def list_all_reviews():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM reviews")
    reviews = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(reviews)
 
@app.route('/api/reviews/legacy', methods=['GET'])
def list_all_reviews_buggy():
    # Keeping this for backward compatibility
    return list_all_reviews()
 
@app.route('/api/reviews/product/<product_id>', methods=['GET'])
def get_product_reviews(product_id):
    try:
        product_id_int = int(product_id)
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM reviews WHERE product_id = ?", (product_id_int,))
        product_reviews = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return jsonify(product_reviews)
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400
 
@app.route('/api/analytics/products/<product_id>', methods=['GET'])
def get_product_analytics(product_id):
    try:
        product_id_int = int(product_id)
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get all reviews for this product
        cursor.execute("SELECT * FROM reviews WHERE product_id = ?", (product_id_int,))
        product_reviews = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
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
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM reviews WHERE id = ?", (review_id_int,))
        review = cursor.fetchone()
        
        conn.close()
        
        if review:
            return jsonify(dict(review))
        else:
            return jsonify({'error': 'Review not found'}), 404
    except ValueError:
        return jsonify({'error': 'Invalid review ID'}), 400
 
@app.route('/api/reviews', methods=['POST'])
def create_review():
    data = request.get_json()
    print("Received review:", data)
   
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
    
    created_at = datetime.utcnow().isoformat()
    
    # Connect to SQLite database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Insert the review
    cursor.execute('''
    INSERT INTO reviews (product_id, user_id, username, rating, comment, sentiment_score, sentiment_label, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('product_id'),
        data.get('user_id'),
        data.get('username', f"User{data.get('user_id')}"),
        data.get('rating'),
        data.get('comment'),
        sentiment_score,
        sentiment_label,
        created_at
    ))
    
    # Get the ID of the new review
    review_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    # Create response object
    review = {
        'id': review_id,
        'product_id': data.get('product_id'),
        'user_id': data.get('user_id'),
        'username': data.get('username', f"User{data.get('user_id')}"),
        'rating': data.get('rating'),
        'comment': data.get('comment'),
        'sentiment_score': sentiment_score,
        'sentiment_label': sentiment_label,
        'created_at': created_at
    }
   
    return jsonify(review), 201

# New visualization API endpoints
@app.route('/api/visualization/sentiment/<product_id>', methods=['GET'])
def get_sentiment_visualization(product_id):
    try:
        product_id_int = int(product_id)
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT sentiment_label, COUNT(*) as count 
            FROM reviews 
            WHERE product_id = ? AND sentiment_label IS NOT NULL
            GROUP BY sentiment_label
        """, (product_id_int,))
        
        result = cursor.fetchall()
        conn.close()
        
        if not result:
            return jsonify({'error': 'No sentiment data available for this product'}), 404
        
        # Convert to dict for easier use
        sentiment_data = {row['sentiment_label']: row['count'] for row in result}
        
        # Ensure all sentiment categories are represented
        categories = ['positive', 'neutral', 'negative']
        for category in categories:
            if category not in sentiment_data:
                sentiment_data[category] = 0
        
        # Create pie chart
        plt.figure(figsize=(10, 6))
        plt.pie(
            [sentiment_data['positive'], sentiment_data['neutral'], sentiment_data['negative']],
            labels=['Positive', 'Neutral', 'Negative'],
            colors=['#4CAF50', '#FFC107', '#F44336'],
            autopct='%1.1f%%',
            startangle=90
        )
        plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
        plt.title(f'Sentiment Distribution for Product {product_id_int}')
        
        # Save to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        
        # Encode the image to base64 string
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return jsonify({
            'product_id': product_id_int,
            'sentiment_data': sentiment_data,
            'chart_image': image_base64
        })
        
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400

@app.route('/api/visualization/ratings/<product_id>', methods=['GET'])
def get_ratings_visualization(product_id):
    try:
        product_id_int = int(product_id)
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT rating, COUNT(*) as count 
            FROM reviews 
            WHERE product_id = ?
            GROUP BY rating
            ORDER BY rating
        """, (product_id_int,))
        
        result = cursor.fetchall()
        conn.close()
        
        if not result:
            return jsonify({'error': 'No rating data available for this product'}), 404
        
        # Convert to dict for easier use
        rating_data = {row['rating']: row['count'] for row in result}
        
        # Ensure all rating values are represented
        for rating in range(1, 6):
            if rating not in rating_data:
                rating_data[rating] = 0
        
        # Sort by rating
        rating_counts = [rating_data.get(i, 0) for i in range(1, 6)]
        
        # Create bar chart
        plt.figure(figsize=(10, 6))
        bars = plt.bar(
            ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            rating_counts,
            color=['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50']
        )
        
        # Add count labels above bars
        for bar in bars:
            height = bar.get_height()
            plt.text(
                bar.get_x() + bar.get_width()/2.,
                height + 0.1,
                str(int(height)),
                ha='center',
                va='bottom'
            )
            
        plt.title(f'Rating Distribution for Product {product_id_int}')
        plt.xlabel('Rating')
        plt.ylabel('Number of Reviews')
        plt.ylim(top=max(rating_counts) * 1.2 if max(rating_counts) > 0 else 1)  # Add 20% padding at the top
        
        # Save to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        
        # Encode the image to base64 string
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return jsonify({
            'product_id': product_id_int,
            'rating_data': {str(k): v for k, v in rating_data.items()},
            'chart_image': image_base64
        })
        
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400

@app.route('/api/visualization/over-time/<product_id>', methods=['GET'])
def get_ratings_over_time(product_id):
    try:
        product_id_int = int(product_id)
        
        conn = sqlite3.connect(DB_PATH)
        
        # Use pandas to directly read from sqlite
        df = pd.read_sql_query(
            "SELECT created_at, rating FROM reviews WHERE product_id = ? ORDER BY created_at",
            conn,
            params=(product_id_int,)
        )
        
        conn.close()
        
        if df.empty:
            return jsonify({'error': 'No review data available for this product'}), 404
        
        # Convert created_at to datetime
        df['created_at'] = pd.to_datetime(df['created_at'])
        
        # Set created_at as index and resample by week
        df.set_index('created_at', inplace=True)
        weekly_avg = df.resample('W')['rating'].mean().reset_index()
        
        # Convert dates to string for JSON serialization
        weekly_avg['created_at'] = weekly_avg['created_at'].dt.strftime('%Y-%m-%d')
        
        # Create line chart
        plt.figure(figsize=(12, 6))
        plt.plot(
            pd.to_datetime(weekly_avg['created_at']),
            weekly_avg['rating'],
            marker='o',
            linestyle='-',
            color='#2196F3'
        )
        plt.title(f'Rating Trend Over Time for Product {product_id_int}')
        plt.xlabel('Date')
        plt.ylabel('Average Rating')
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.ylim(0.5, 5.5)  # Ratings are from 1 to 5
        
        # Format x-axis to show dates better
        plt.gcf().autofmt_xdate()
        
        # Save to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        
        # Encode the image to base64 string
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return jsonify({
            'product_id': product_id_int,
            'trend_data': weekly_avg.to_dict(orient='records'),
            'chart_image': image_base64
        })
        
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400

# API endpoint that returns all visualization data at once
@app.route('/api/visualizations/<product_id>', methods=['GET'])
def all_visualizations(product_id):
    try:
        product_id_int = int(product_id)
        
        # Get analytics data
        analytics_response = get_product_analytics(product_id)
        analytics_data = json.loads(analytics_response.get_data(as_text=True))
        
        # Get sentiment visualization
        sentiment_response = get_sentiment_visualization(product_id)
        if sentiment_response.status_code != 200:
            sentiment_data = {"error": "No sentiment data available"}
        else:
            sentiment_data = json.loads(sentiment_response.get_data(as_text=True))
        
        # Get ratings visualization
        ratings_response = get_ratings_visualization(product_id)
        if ratings_response.status_code != 200:
            ratings_data = {"error": "No ratings data available"}
        else:
            ratings_data = json.loads(ratings_response.get_data(as_text=True))
        
        # Get ratings over time (this might return a 404 if we have very few reviews)
        try:
            time_response = get_ratings_over_time(product_id)
            if time_response.status_code != 200:
                time_data = {"error": "Insufficient data for trend analysis"}
            else:
                time_data = json.loads(time_response.get_data(as_text=True))
        except:
            time_data = {"error": "Insufficient data for trend analysis"}
        
        return jsonify({
            'product_id': product_id_int,
            'analytics': analytics_data,
            'sentiment': sentiment_data,
            'ratings': ratings_data,
            'time_trend': time_data
        })
        
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400

# Data export endpoints
@app.route('/api/export/reviews/<product_id>', methods=['GET'])
def export_product_reviews(product_id):
    try:
        product_id_int = int(product_id)
        
        conn = sqlite3.connect(DB_PATH)
        
        # Use pandas to directly read from sqlite
        df = pd.read_sql_query(
            "SELECT * FROM reviews WHERE product_id = ?",
            conn,
            params=(product_id_int,)
        )
        
        conn.close()
        
        if df.empty:
            return jsonify({'error': 'No review data available for this product'}), 404
        
        # Convert to CSV
        csv_data = df.to_csv(index=False)
        
        return csv_data, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': f'attachment; filename=product_{product_id}_reviews.csv'
        }
        
    except ValueError:
        return jsonify({'error': 'Invalid product ID'}), 400

# Import reviews from CSV (admin feature)
@app.route('/api/import/reviews', methods=['POST'])
def import_reviews():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be CSV format'}), 400
    
    try:
        # Read the CSV file
        df = pd.read_csv(file)
        
        required_columns = ['product_id', 'user_id', 'rating']
        for col in required_columns:
            if col not in df.columns:
                return jsonify({'error': f'Missing required column: {col}'}), 400
        
        # Add missing columns with default values
        if 'username' not in df.columns:
            df['username'] = df['user_id'].apply(lambda x: f"User{x}")
        
        if 'comment' not in df.columns:
            df['comment'] = None
            
        if 'created_at' not in df.columns:
            df['created_at'] = datetime.utcnow().isoformat()
            
        # Calculate sentiment for each review
        sentiments = []
        for _, row in df.iterrows():
            score, label = simple_sentiment_analysis(row.get('comment'), row.get('rating'))
            sentiments.append((score, label))
            
        df['sentiment_score'] = [s[0] for s in sentiments]
        df['sentiment_label'] = [s[1] for s in sentiments]
        
        # Connect to SQLite database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Insert the reviews
        for _, row in df.iterrows():
            cursor.execute('''
            INSERT INTO reviews (product_id, user_id, username, rating, comment, sentiment_score, sentiment_label, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                row['product_id'],
                row['user_id'],
                row['username'],
                row['rating'],
                row.get('comment'),
                row.get('sentiment_score'),
                row.get('sentiment_label'),
                row.get('created_at')
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': f'Successfully imported {len(df)} reviews'
        })
        
    except Exception as e:
        return jsonify({'error': f'Error importing reviews: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

# Handle preflight OPTIONS requests for CORS
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

if __name__ == '__main__':
    # Initialize the database
    init_db()
    
    # Try to register with service registry, but continue if it fails
    register_with_service_registry()
   
    try:
        print(f"Feedback Service is running at http://localhost:{PORT}")
        print(f"Visualization API available at http://localhost:{PORT}/api/visualizations/<product_id>")
        print("Press Ctrl+C to stop the server")
        app.run(host='0.0.0.0', port=PORT)
    except KeyboardInterrupt:
        pass
    finally:
        # Try to deregister, but continue if it fails
        deregister_from_service_registry()
        print('Feedback Service stopped')