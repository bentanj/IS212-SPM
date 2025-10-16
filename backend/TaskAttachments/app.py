from flask import Flask
from flask_cors import CORS

# Handle both relative and absolute imports
try:
    from .config import Config
    from .Controllers.AttachmentController import bp as attachment_bp
except ImportError:
    from config import Config
    from Controllers.AttachmentController import bp as attachment_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow all origins for CORS
    CORS(app, origins="*", supports_credentials=True)

    @app.get("/api/task-attachments/health")
    def health():
        return {"status": "ok", "service": "task-attachments"}

    app.register_blueprint(attachment_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=8005, host='0.0.0.0')


