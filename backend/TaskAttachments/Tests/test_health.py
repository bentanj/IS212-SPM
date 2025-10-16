import pytest
import sys
import os

# Add the parent directory to the path to enable imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app


@pytest.mark.unit
class TestHealthEndpoint:
    """Test health endpoint functionality"""

    @pytest.fixture
    def app(self):
        """Create test Flask app"""
        app = create_app()
        app.config['TESTING'] = True
        return app

    @pytest.fixture
    def client(self, app):
        """Test client"""
        return app.test_client()

    def test_health_endpoint(self, client):
        """Test health endpoint returns correct response"""
        response = client.get('/api/task-attachments/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ok'
        assert data['service'] == 'task-attachments'

    def test_health_endpoint_content_type(self, client):
        """Test health endpoint returns JSON content type"""
        response = client.get('/api/task-attachments/health')
        
        assert response.status_code == 200
        assert response.content_type == 'application/json'


if __name__ == "__main__":
    pytest.main([__file__])
