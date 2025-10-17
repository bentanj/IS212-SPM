from typing import Optional

# Handle both relative and absolute imports
try:
    from .config import Config
except ImportError:
    from config import Config

from supabase import create_client, Client


def get_supabase_client() -> Client:
    if not Config.SUPABASE_URL or not Config.SUPABASE_SERVICE_KEY:
        raise RuntimeError("Supabase configuration missing: SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)


