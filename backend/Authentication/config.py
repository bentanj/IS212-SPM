import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    USER = os.getenv("DB_USER")
    PASSWORD = os.getenv("DB_PASSWORD")
    HOST = os.getenv("DB_HOST")
    PORT = os.getenv("DB_PORT")
    DBNAME = os.getenv("DB_NAME")
    SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
    SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
    ENV = os.getenv("ENV", "dev")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    
    # OAuth Configuration
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    
    # JWT Configuration
    JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret-key-here")
    JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "your-jwt-refresh-secret-key-here")
    JWT_ACCESS_TOKEN_EXPIRES = 15 * 60  # 15 minutes in seconds
    JWT_REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60  # 7 days in seconds