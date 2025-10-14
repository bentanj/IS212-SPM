from flask import Flask, g
from flask_cors import CORS
from config import Config
from db import SessionLocal, init_db
from Controllers.ReportController import bp as report_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Allow all origins for CORS
    CORS(app, origins="*", supports_credentials=True)
    
    @app.before_request
    def before_request():
        g.db_session = SessionLocal()
    
    @app.after_request
    def after_request(response):
        if hasattr(g, 'db_session'):
            g.db_session.close()
        return response
    
    @app.teardown_appcontext
    def close_db_session(error):
        if hasattr(g, 'db_session'):
            g.db_session.close()
    
    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "reports"}
    
    @app.get("/api/reports/health")
    def reports_health():
        return {"status": "ok", "service": "reports"}
    
    # Register ONLY Reports blueprint
    app.register_blueprint(report_bp)
    
    # Don't initialize the database here - Tasks service handles that
    # if app.config.get('ENV') != 'test':
    #     with app.app_context():
    #         init_db()
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=8003, host='0.0.0.0')  # Use port 8003 for Reports service
