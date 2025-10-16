# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
# from config import Config
# from sqlalchemy import text

# engine = create_engine(
#     Config.SQLALCHEMY_DATABASE_URI,
#     echo=Config.SQLALCHEMY_ECHO,
#     future=True,
# )
# SessionLocal = scoped_session(
#     sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
# )
# Base = declarative_base()

# def init_db():
#     # import models here so Base.metadata is populated
#     from Models.Task import Task  # noqa
#     Base.metadata.create_all(bind=engine)

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import Config

# Create engine with connection pooling optimized for Supabase
engine = create_engine(
    Config.get_database_uri(),
    pool_size=2,              # Small pool for Supabase free tier
    max_overflow=3,           # Maximum extra connections
    pool_pre_ping=True,       # Verify connections before using
    pool_recycle=300,         # Recycle connections after 5 minutes
    pool_timeout=30,          # Wait 30s for connection
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Get database session with automatic cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")
    except Exception as e:
        print(f"✗ Database initialization error: {e}")
        raise

def test_connection():
    """Test database connectivity."""
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        print("✓ Database connection successful")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False
