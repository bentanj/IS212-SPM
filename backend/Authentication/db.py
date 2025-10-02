from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
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
        "application_name": "authentication_service"
    }
)
SessionLocal = scoped_session(
    sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
)
Base = declarative_base()

def init_db():
    # import models here so Base.metadata is populated
    from Models.User import User  # noqa
    Base.metadata.create_all(bind=engine)