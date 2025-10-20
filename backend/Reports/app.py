from flask import Flask
from flask_cors import CORS
from Controllers.ReportController import bp as reports_bp
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(reports_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Get environment variables
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8003))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    task_service_url = os.getenv('TASK_SERVICE_URL', 'http://tasks:8001')
    
    logger.info(f"🚀 Starting Reports API on {host}:{port}")
    logger.info(f"📊 Environment: {'dev' if debug else 'prod'}")
    logger.info(f"🔗 Tasks Service: {task_service_url}")
    
    app.run(host=host, port=port, debug=debug)
