from flask import Flask, g
from flask_cors import CORS
from Users.config import Config
from Users.db import SessionLocal, init_db
from Users.Controllers.UserController import bp as user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow all origins for CORS
    CORS(app, origins="*")

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

    @app.get("/api/users/health")
    def health():
        return {"status": "ok", "service": "users"}

    app.register_blueprint(user_bp)

    if app.config.get('ENV') != 'test':
        with app.app_context():
            init_db()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=8002, host='0.0.0.0')