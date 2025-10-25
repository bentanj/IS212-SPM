import os
import pytest

# Ensure test mode
os.environ["FLASK_ENV"] = "test"
os.environ["ENV"] = "test"

from app import create_app  # noqa: E402

@pytest.mark.unit
def test_health_ok():
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        resp = client.get("/api/tasks/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data == {"status": "ok", "service": "tasks"}


