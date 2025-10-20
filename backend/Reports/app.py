import os
from flask import Flask, jsonify
from flask_cors import CORS
from Controllers.ReportController import bp as reports_bp

# Initialize Flask app
app = Flask(__name__)

# Load configuration from environment
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JSON_SORT_KEYS'] = False  # Preserve JSON key order

# CORS Configuration - Allow frontend origin
CORS(app, resources={
    r"/api/*": {
        "origins": [
            os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"),
            "http://localhost:3000",  # Local development
            "http://localhost:3001",  # Alternative dev port
            # Add production URLs here when deploying
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "expose_headers": ["Content-Type", "X-Total-Count"],
        "supports_credentials": True,
        "max_age": 3600  # Cache preflight requests for 1 hour
    }
})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Not found",
        "message": "The requested resource was not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    app.logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }), 500

# Register blueprints
app.register_blueprint(reports_bp)

# Root endpoint
@app.route('/')
def index():
    """Root endpoint - API information"""
    return jsonify({
        "service": "Reports API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/reports/health",
            "reports": "/api/reports",
            "task_completion": "/api/reports/task-completion/data",
            "project_performance": "/api/reports/project-performance/data",
            "team_productivity": "/api/reports/team-productivity/data",
            "summary": "/api/reports/summary"
        }
    }), 200

# Health check endpoint
@app.route('/health')
def health():
    """Global health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "reports",
        "note": "Reports service uses HTTP calls to Task service"
    }), 200

# Run the application
if __name__ == "__main__":
    port = int(os.getenv('FLASK_PORT', 8003))
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    app.logger.info(f"Starting Reports API on {host}:{port}")
    app.run(
        debug=debug,
        port=port,
        host=host,
        threaded=True  # Enable threading for concurrent requests
    )
