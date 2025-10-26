from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
# Handle both relative and absolute imports
try:
    from .config import Config
except ImportError:
    from config import Config
from sqlalchemy import text
import logging

# Configure logging for database issues
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    echo=Config.SQLALCHEMY_ECHO,
    future=True,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,   # Recycle connections every hour
    pool_size=5,         # Maintain 5 connections in pool
    max_overflow=10,     # Allow up to 10 additional connections
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
        "application_name": "user_management_service"
    }
)
SessionLocal = scoped_session(
    sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
)
Base = declarative_base()

def init_db(engine_to_use=None):
    # import models here so Base.metadata is populated
    try:
        from .Models.User import User  # noqa
    except ImportError:
        from Models.User import User  # noqa

    # Use provided engine or default to global engine
    target_engine = engine_to_use if engine_to_use is not None else engine
    Base.metadata.create_all(bind=target_engine)
