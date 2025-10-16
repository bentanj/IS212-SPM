# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Config:
#     USER = os.getenv("DB_USER")
#     PASSWORD = os.getenv("DB_PASSWORD")
#     HOST = os.getenv("DB_HOST")
#     PORT = os.getenv("DB_PORT")
#     DBNAME = os.getenv("DB_NAME")
#     SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
#     SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
#     ENV = os.getenv("ENV", "dev")
#     FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase Database Configuration
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'postgres')
    
    # Use port 6543 for Transaction mode (recommended for Supabase)
    # Use port 5432 for Session mode (limited connections)
    POOLER_PORT = '6543'  # Transaction pooling mode
    
    @classmethod
    def get_database_uri(cls):
        """Get database connection URI for Supabase with transaction pooling."""
        if not cls.DB_PASSWORD or not cls.DB_HOST:
            raise ValueError("Database credentials not set in environment")
        
        # Use pgbouncer transaction mode (port 6543) for better connection handling
        return f"postgresql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.POOLER_PORT}/{cls.DB_NAME}"
    
    @classmethod
    def validate(cls):
        """Validate configuration."""
        required = ['DB_USER', 'DB_PASSWORD', 'DB_HOST']
        missing = [var for var in required if not getattr(cls, var)]
        if missing:
            raise ValueError(f"Missing required config: {', '.join(missing)}")
        return True
