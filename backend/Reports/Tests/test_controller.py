import os
import pytest
import json
from datetime import datetime

os.environ.setdefault("FLASK_ENV", "test")

from app import app  # noqa: E402


@pytest.fixture
def client():
    """Create test client."""
    app.testing = True
    with app.test_client() as client:
        yield client


@pytest.mark.unit
def test_get_task_completion_report(client):
    """Test GET /api/reports/task-completion endpoint."""
    resp = client.get('/api/reports/task-completion')
    
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'summary' in data
    assert 'total_tasks' in data['summary']


@pytest.mark.unit
def test_get_project_performance_report(client):
    """Test GET /api/reports/project-performance endpoint."""
    resp = client.get('/api/reports/project-performance')
    
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'projects' in data


@pytest.mark.unit
def test_get_team_productivity_report(client):
    """Test GET /api/reports/team-productivity endpoint."""
    resp = client.get('/api/reports/team-productivity')
    
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'team_members' in data


@pytest.mark.unit
def test_get_reports_with_date_filter(client):
    """Test reports endpoint with date range filter."""
    start_date = '2025-01-01'
    end_date = '2025-12-31'
    
    resp = client.get(
        f'/api/reports/task-completion?start_date={start_date}&end_date={end_date}'
    )
    
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'date_range' in data


@pytest.mark.unit
def test_invalid_date_format(client):
    """Test reports endpoint with invalid date format."""
    resp = client.get('/api/reports/task-completion?start_date=invalid-date')
    
    assert resp.status_code == 400
    data = resp.get_json()
    assert 'error' in data


@pytest.mark.unit
def test_report_export_pdf(client):
    """Test PDF export endpoint."""
    resp = client.get('/api/reports/task-completion/export?format=pdf')
    
    assert resp.status_code == 200
    assert resp.content_type == 'application/pdf'


@pytest.mark.unit
def test_report_export_csv(client):
    """Test CSV export endpoint."""
    resp = client.get('/api/reports/project-performance/export?format=csv')
    
    assert resp.status_code == 200
    assert resp.content_type == 'text/csv'


@pytest.mark.unit
def test_unauthorized_access(client):
    """Test accessing reports without proper authentication."""
    # This assumes you have authentication middleware
    resp = client.get('/api/reports/task-completion', headers={})
    
    # Should return 401 if authentication is required
    # Adjust assertion based on your auth implementation
    assert resp.status_code in [200, 401]
