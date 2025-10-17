import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Environment
    ENV = os.getenv("ENV", "dev")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

    # Flask secret
    SECRET_KEY = os.getenv("SECRET_KEY", "task-attachments-secret")

    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

    # Storage config
    STORAGE_BUCKET = os.getenv("STORAGE_BUCKET", "task-attachments")
    MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_BYTES", str(50 * 1024 * 1024)))  # 50MB
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }


