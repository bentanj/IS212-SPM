# reports/app.py

from flask import Flask
from Controllers.ReportController import bp as reports_bp
import logging
import atexit
import signal
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s - %(name)s - %(message)s'
)

logger = logging.getLogger(__name__)


def cleanup_sessions():
    """
    Gracefully close all HTTP client sessions and connection pools
    
    This function is called on:
    - Normal application exit (atexit)
    - SIGTERM signal (Docker/Kubernetes shutdown)
    - SIGINT signal (Ctrl+C)
    """
    logger.info("=" * 60)
    logger.info("Initiating graceful shutdown - closing HTTP sessions...")
    logger.info("=" * 60)
    
    try:
        # Import here to avoid circular imports
        from Services.ReportService import ReportService
        from Services.TaskServiceClient import TaskServiceClient
        
        # Close ReportService's User Service session
        ReportService.close_session()
        
        # Close TaskServiceClient's session
        TaskServiceClient.close_session()
        
        logger.info("All HTTP connection pools closed successfully")
        logger.info("=" * 60)
        
    except ImportError as e:
        logger.warning(f"Could not import services for cleanup: {e}")
    except Exception as e:
        logger.error(f"Error during session cleanup: {e}", exc_info=True)


def signal_handler(sig, frame):
    """
    Handle termination signals (SIGTERM, SIGINT)
    
    Args:
        sig: Signal number
        frame: Current stack frame
    """
    signal_name = signal.Signals(sig).name
    logger.info(f"Received {signal_name} signal - initiating shutdown...")
    cleanup_sessions()
    sys.exit(0)


def create_app():
    """
    Create and configure the Flask application
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    
    # DO NOT add CORS here - nginx handles it
    
    # Register blueprints
    app.register_blueprint(reports_bp)
    
    logger.info("Reports Service initialized")
    
    # Register cleanup function for normal exit
    atexit.register(cleanup_sessions)
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGTERM, signal_handler)  # Docker/K8s stop
    signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
    
    logger.info("Graceful shutdown handlers registered")
    
    return app


# Create app instance
app = create_app()

if __name__ == '__main__':
    logger.info("Starting Reports Service on port 8010...")
    try:
        app.run(host='0.0.0.0', port=8010, debug=True)
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
        cleanup_sessions()
    except Exception as e:
        logger.error(f"Application error: {e}", exc_info=True)
        cleanup_sessions()
        raise
