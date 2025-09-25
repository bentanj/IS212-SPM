import os
import pytest


@pytest.mark.integration
def test_database_connection_alive():
    """Integration: verifies DB connectivity using configured SQLAlchemy engine.

    Skips unless RUN_INTEGRATION=true is set in the environment.
    Requires valid DB_* env vars (e.g., Supabase creds) available to the process.
    """
    if os.getenv("RUN_INTEGRATION", "false").lower() != "true":
        pytest.skip("Integration test skipped (set RUN_INTEGRATION=true to enable)")

    # Import inside test to avoid side effects during collection when env isn't set
    from sqlalchemy import text  # type: ignore
    from db import engine  # type: ignore

    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1


