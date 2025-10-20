# reports/app.py
from flask import Flask
from Controllers.ReportController import bp as reports_bp
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s - %(name)s - %(message)s'
)

logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # DO NOT add CORS here - nginx handles it
    # Register blueprints
    app.register_blueprint(reports_bp)
    
    logger.info("Reports Service initialized")
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003, debug=True)
