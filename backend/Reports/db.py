from sqlalchemy import create_engine, event, pool
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from sqlalchemy.exc import DisconnectionError
from config import Config
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Create declarative base for models
Base = declarative_base()

# Validate configuration before creating engine
try:
    Config.validate()
    logger.info(f"Connecting to database: {Config.get_connection_string()}")
except ValueError as e:
    logger.error(f"Configuration error: {str(e)}")
    raise


# Create database engine with connection pooling and error handling
engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    echo=Config.SQLALCHEMY_ECHO,
    future=True,
    pool_size=Config.SQLALCHEMY_POOL_SIZE,
    max_overflow=Config.SQLALCHEMY_MAX_OVERFLOW,
    pool_timeout=Config.SQLALCHEMY_POOL_TIMEOUT,
    pool_recycle=Config.SQLALCHEMY_POOL_RECYCLE,
    pool_pre_ping=True,  # Test connections before using them
    connect_args={
        "connect_timeout": 10,
        "application_name": "reports_service",
        "options": "-c timezone=utc"
    }
)


# Event listener to handle connection errors
@event.listens_for(pool.Pool, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Log successful database connections"""
    logger.info("Database connection established")


@event.listens_for(pool.Pool, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Test connection validity on checkout"""
    try:
        cursor = dbapi_conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
    except Exception as e:
        logger.error(f"Connection invalid on checkout: {str(e)}")
        raise DisconnectionError()


# Create session factory with scoped sessions
SessionLocal = scoped_session(
    sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
        future=True,
        expire_on_commit=False  # Keep objects accessible after commit
    )
)


def get_db():
    """
    Dependency function to get database session.
    Use this in Flask routes with context management.
    
    Usage:
        with get_db() as session:
            # Use session here
    """
    session = SessionLocal()
    try:
        yield session
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        session.rollback()
        raise
    finally:
        session.close()


def test_connection():
    """Test database connection and return status"""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return False


def close_db_connections():
    """Close all database connections gracefully"""
    try:
        SessionLocal.remove()
        engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing connections: {str(e)}")


# Reports service doesn't need to initialize tables
# That's handled by the Tasks service

# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from config import Config

# # Create engine with connection pooling optimized for Supabase
# engine = create_engine(
#     Config.get_database_uri(),
#     pool_size=2,              # Small pool for Supabase free tier
#     max_overflow=3,           # Maximum extra connections
#     pool_pre_ping=True,       # Verify connections before using
#     pool_recycle=300,         # Recycle connections after 5 minutes
#     pool_timeout=30,          # Wait 30s for connection
#     echo=False
# )

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# def get_db():
#     """Get database session with automatic cleanup."""
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# def init_db():
#     """Initialize database tables."""
#     try:
#         Base.metadata.create_all(bind=engine)
#         print("✓ Database tables created successfully")
#     except Exception as e:
#         print(f"✗ Database initialization error: {e}")
#         raise

# def test_connection():
#     """Test database connectivity."""
#     try:
#         with engine.connect() as conn:
#             conn.execute("SELECT 1")
#         print("✓ Database connection successful")
#         return True
#     except Exception as e:
#         print(f"✗ Database connection failed: {e}")
#         return False
