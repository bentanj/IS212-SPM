import os
import pytest

# Ensure test mode
os.environ.setdefault("FLASK_ENV", "test")

from app import app  # noqa: E402

@pytest.mark.unit
def test_health_ok():
    app.testing = True
    with app.test_client() as client:
        resp = client.get("/api/tasks/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data == {"status": "ok", "service": "tasks"}


