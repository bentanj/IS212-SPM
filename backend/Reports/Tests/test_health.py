import os
import pytest

# Ensure test mode
os.environ.setdefault("FLASK_ENV", "test")

from app import app  # noqa: E402


@pytest.mark.unit
def test_health_ok():
    """Test the health check endpoint returns OK status."""
    app.testing = True
    with app.test_client() as client:
        resp = client.get("/api/reports/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data == {"status": "ok", "service": "reports"}


