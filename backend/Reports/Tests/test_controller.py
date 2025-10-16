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
def test_list_available_reports(client):
    """Test GET /api/reports endpoint lists all report types."""
    resp = client.get('/api/reports')
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 3
    report_ids = [r["id"] for r in data]
    assert "task-completion-status" in report_ids
    assert "project-performance" in report_ids
    assert "team-productivity" in report_ids


@pytest.mark.unit
def test_get_task_completion_report_data(client):
    """Test GET /api/reports/task-completion/data endpoint."""
    resp = client.get('/api/reports/task-completion/data')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'metadata' in data
    assert 'summary' in data
    assert 'data' in data
    assert 'total_tasks' in data['summary']
    assert 'completed_tasks' in data['summary']
    assert 'in_progress_tasks' in data['summary']
    assert 'to_do_tasks' in data['summary']
    assert 'blocked_tasks' in data['summary']
    assert 'completion_rate' in data['summary']


@pytest.mark.unit
def test_get_project_performance_report_data(client):
    """Test GET /api/reports/project-performance/data endpoint."""
    resp = client.get('/api/reports/project-performance/data')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'metadata' in data
    assert 'summary' in data
    assert 'data' in data
    assert 'projects' in data['data']
    assert isinstance(data['data']['projects'], list)


@pytest.mark.unit
def test_get_team_productivity_report_data(client):
    """Test GET /api/reports/team-productivity/data endpoint."""
    resp = client.get('/api/reports/team-productivity/data')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'metadata' in data
    assert 'summary' in data
    assert 'data' in data
    assert 'team_members' in data['data']
    assert isinstance(data['data']['team_members'], list)


@pytest.mark.unit
def test_get_reports_summary(client):
    """Test GET /api/reports/summary endpoint."""
    resp = client.get('/api/reports/summary')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'total_tasks' in data
    assert 'completion_rate' in data
    assert 'total_projects' in data
    assert 'total_team_members' in data
    assert 'generated_at' in data


@pytest.mark.unit
def test_report_metadata_structure(client):
    """Test that report metadata contains correct fields."""
    resp = client.get('/api/reports/task-completion/data')
    assert resp.status_code == 200
    data = resp.get_json()
    
    metadata = data['metadata']
    assert 'report_id' in metadata
    assert 'report_type' in metadata
    assert 'generated_at' in metadata
    assert metadata['report_type'] == 'task_completion_status'


@pytest.mark.unit
def test_task_data_camelCase_fields(client):
    """Test that task data returns camelCase fields for frontend."""
    resp = client.get('/api/reports/task-completion/data')
    assert resp.status_code == 200
    data = resp.get_json()
    
    if data['data']['tasks']:
        task = data['data']['tasks'][0]
        # Check for camelCase fields frontend expects
        assert 'projectName' in task
        assert 'assignedUsers' in task
        assert 'completedDate' in task or task['status'] != 'Completed'


@pytest.mark.unit
def test_error_handling_invalid_endpoint(client):
    """Test error handling for non-existent endpoint."""
    resp = client.get('/api/reports/nonexistent')
    assert resp.status_code == 404


