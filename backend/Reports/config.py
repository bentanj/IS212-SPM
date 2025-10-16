import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables from .env file
load_dotenv()


class Config:
    """Configuration class for database and application settings"""
    
    # Database credentials
    USER = os.getenv("DB_USER")
    PASSWORD = os.getenv("DB_PASSWORD")
    HOST = os.getenv("DB_HOST")
    PORT = os.getenv("DB_PORT", "5432")
    DBNAME = os.getenv("DB_NAME", "postgres")
    
    # URL-encode password to handle special characters
    ENCODED_PASSWORD = quote_plus(PASSWORD) if PASSWORD else ""
    
    # SQLAlchemy database URI with connection parameters
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql+psycopg2://{USER}:{ENCODED_PASSWORD}@{HOST}:{PORT}/{DBNAME}"
        f"?sslmode=require"
        f"&connect_timeout=10"
        f"&application_name=reports_service"
    )
    
    # Database configuration
    SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
    SQLALCHEMY_POOL_SIZE = int(os.getenv("SQLALCHEMY_POOL_SIZE", "5"))
    SQLALCHEMY_POOL_TIMEOUT = int(os.getenv("SQLALCHEMY_POOL_TIMEOUT", "30"))
    SQLALCHEMY_POOL_RECYCLE = int(os.getenv("SQLALCHEMY_POOL_RECYCLE", "3600"))
    SQLALCHEMY_MAX_OVERFLOW = int(os.getenv("SQLALCHEMY_MAX_OVERFLOW", "10"))
    
    # Application configuration
    ENV = os.getenv("ENV", "dev")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    @staticmethod
    def validate():
        """Validate that required environment variables are set"""
        required_vars = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME"]
        missing = [var for var in required_vars if not os.getenv(var)]
        
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        return True
    
    @staticmethod
    def get_connection_string():
        """Get sanitized connection string for logging (without password)"""
        user = Config.USER
        host = Config.HOST
        port = Config.PORT
        dbname = Config.DBNAME
        return f"postgresql://{user}:***@{host}:{port}/{dbname}"


# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Config:
#     # Supabase Database Configuration
#     DB_USER = os.getenv('DB_USER', 'postgres')
#     DB_PASSWORD = os.getenv('DB_PASSWORD')
#     DB_HOST = os.getenv('DB_HOST')
#     DB_PORT = os.getenv('DB_PORT', '5432')
#     DB_NAME = os.getenv('DB_NAME', 'postgres')
    
#     # Use port 6543 for Transaction mode (recommended for Supabase)
#     # Use port 5432 for Session mode (limited connections)
#     POOLER_PORT = '6543'  # Transaction pooling mode
    
#     @classmethod
#     def get_database_uri(cls):
#         """Get database connection URI for Supabase with transaction pooling."""
#         if not cls.DB_PASSWORD or not cls.DB_HOST:
#             raise ValueError("Database credentials not set in environment")
        
#         # Use pgbouncer transaction mode (port 6543) for better connection handling
#         return f"postgresql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.POOLER_PORT}/{cls.DB_NAME}"
    
#     @classmethod
#     def validate(cls):
#         """Validate configuration."""
#         required = ['DB_USER', 'DB_PASSWORD', 'DB_HOST']
#         missing = [var for var in required if not getattr(cls, var)]
#         if missing:
#             raise ValueError(f"Missing required config: {', '.join(missing)}")
#         return True
    
