from flask import Flask, g
from flask_cors import CORS

# Handle both relative and absolute imports
try:
    # Try relative imports first (for tests)
    from .config import Config
    from .db import SessionLocal, init_db
    from .Controllers.AuthController import bp as auth_bp
except ImportError:
    # Fall back to absolute imports (for Docker)
    from config import Config
    from db import SessionLocal, init_db
    from Controllers.AuthController import bp as auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Set secret key for sessions
    app.secret_key = Config.SECRET_KEY
    
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
    
    @app.get("/api/auth/health")
    def health():
        return {"status": "ok", "service": "authentication"}
    
    app.register_blueprint(auth_bp)
    
    if app.config.get('ENV') != 'test':
        with app.app_context():
            init_db()
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=8002, host='0.0.0.0')