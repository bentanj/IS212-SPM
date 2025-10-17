import pytest
import os
import tempfile
import sys
from unittest.mock import patch, Mock
from datetime import datetime, timezone
from io import BytesIO

# Add the parent directory to the path to enable imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from Services.AttachmentService import AttachmentService
from Services.StorageService import StorageService
from Repositories.AttachmentRepository import AttachmentRepository
from Models.TaskAttachment import TaskAttachment
from exceptions import (
    InvalidFileTypeError,
    FileSizeExceededError,
    StorageQuotaExceededError,
    AttachmentNotFoundError,
)


@pytest.mark.integration
class TestAttachmentIntegration:
    """Integration tests for TaskAttachments service"""

    @pytest.fixture(scope="class")
    def test_app(self):
        """Create test Flask app"""
        app = create_app()
        app.config['TESTING'] = True
        app.config['ENV'] = 'test'
        return app

    @pytest.fixture
    def client(self, test_app):
        """Test client"""
        return test_app.test_client()

    @pytest.fixture
    def mock_file_storage(self):
        """Mock file storage for testing"""
        file_storage = Mock()
        file_storage.filename = "test.pdf"
        file_storage.mimetype = "application/pdf"
        file_storage.read.return_value = b"test file content"
        return file_storage

    def test_health_endpoint(self, client):
        """Test health endpoint"""
        response = client.get('/api/task-attachments/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ok'
        assert data['service'] == 'task-attachments'

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_upload_endpoint_success(self, mock_service_class, client, mock_file_storage):
        """Test successful file upload endpoint"""
        # Mock service response
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.upload_attachment.return_value = {
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }

        # Create test data
        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'task_id': '1',
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 201
        response_data = response.get_json()
        assert response_data['id'] == 'test-id'
        assert response_data['task_id'] == 1
        assert response_data['file_name'] == 'test.pdf'

    def test_upload_endpoint_missing_file(self, client):
        """Test upload endpoint with missing file"""
        data = {
            'task_id': '1',
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', data=data)

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'File is required' in response_data['error']

    def test_upload_endpoint_missing_task_id(self, client, mock_file_storage):
        """Test upload endpoint with missing task_id"""
        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'task_id is required' in response_data['error']

    def test_upload_endpoint_invalid_task_id(self, client, mock_file_storage):
        """Test upload endpoint with invalid task_id"""
        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'task_id': 'invalid',
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'task_id must be an integer' in response_data['error']

    def test_upload_endpoint_missing_uploaded_by(self, client, mock_file_storage):
        """Test upload endpoint with missing uploaded_by"""
        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'task_id': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'uploaded_by is required' in response_data['error']

    def test_upload_endpoint_invalid_uploaded_by(self, client, mock_file_storage):
        """Test upload endpoint with invalid uploaded_by"""
        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'task_id': '1',
            'uploaded_by': 'invalid'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'uploaded_by must be an integer' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_upload_endpoint_invalid_file_type(self, mock_service_class, client, mock_file_storage):
        """Test upload endpoint with invalid file type"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.upload_attachment.side_effect = InvalidFileTypeError("Invalid file format. Only PDF and Excel files are allowed.")

        data = {
            'file': (BytesIO(b'test file content'), 'test.txt'),
            'task_id': '1',
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Invalid file format. Only PDF and Excel files are allowed.' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_upload_endpoint_file_size_exceeded(self, mock_service_class, client, mock_file_storage):
        """Test upload endpoint with file size exceeded"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.upload_attachment.side_effect = FileSizeExceededError("File size exceeds 50MB limit.")

        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'task_id': '1',
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'File size exceeds 50MB limit.' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_upload_endpoint_storage_quota_exceeded(self, mock_service_class, client, mock_file_storage):
        """Test upload endpoint with storage quota exceeded"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.upload_attachment.side_effect = StorageQuotaExceededError(
            "Total storage limit (50MB) exceeded for this task. Current usage: 40.00 MB",
            current_usage_bytes=40 * 1024 * 1024
        )

        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'task_id': '1',
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 400
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Total storage limit (50MB) exceeded' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_upload_endpoint_server_error(self, mock_service_class, client, mock_file_storage):
        """Test upload endpoint with server error"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.upload_attachment.side_effect = Exception("Database connection failed")

        data = {
            'file': (BytesIO(b'test file content'), 'test.pdf'),
            'task_id': '1',
            'uploaded_by': '1'
        }

        response = client.post('/api/task-attachments/upload', 
                             data=data, 
                             content_type='multipart/form-data')

        assert response.status_code == 500
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Upload failed: Database connection failed' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_list_attachments_endpoint_success(self, mock_service_class, client):
        """Test successful list attachments endpoint"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.list_attachments_for_task.return_value = [
            {
                "id": "test-id-1",
                "task_id": 1,
                "file_name": "test1.pdf",
                "file_path": "1/1234567890-test1.pdf",
                "file_size": 1024,
                "file_type": "application/pdf",
                "uploaded_by": 1,
                "uploaded_at": "2023-01-01T00:00:00Z",
                "download_url": "https://signed-url.com/file1"
            },
            {
                "id": "test-id-2",
                "task_id": 1,
                "file_name": "test2.pdf",
                "file_path": "1/1234567890-test2.pdf",
                "file_size": 2048,
                "file_type": "application/pdf",
                "uploaded_by": 1,
                "uploaded_at": "2023-01-01T01:00:00Z",
                "download_url": "https://signed-url.com/file2"
            }
        ]

        response = client.get('/api/task-attachments/task/1')

        assert response.status_code == 200
        response_data = response.get_json()
        assert len(response_data) == 2
        assert response_data[0]['id'] == 'test-id-1'
        assert response_data[1]['id'] == 'test-id-2'
        mock_service.list_attachments_for_task.assert_called_once_with(1)

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_list_attachments_endpoint_server_error(self, mock_service_class, client):
        """Test list attachments endpoint with server error"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.list_attachments_for_task.side_effect = Exception("Database error")

        response = client.get('/api/task-attachments/task/1')

        assert response.status_code == 500
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Database error' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_get_download_url_endpoint_success(self, mock_service_class, client):
        """Test successful get download URL endpoint"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.get_download_url.return_value = "https://signed-url.com/file"

        response = client.get('/api/task-attachments/test-id/download')

        assert response.status_code == 200
        response_data = response.get_json()
        assert response_data['url'] == 'https://signed-url.com/file'
        mock_service.get_download_url.assert_called_once_with('test-id')

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_get_download_url_endpoint_not_found(self, mock_service_class, client):
        """Test get download URL endpoint with attachment not found"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.get_download_url.side_effect = AttachmentNotFoundError("Attachment not found")

        response = client.get('/api/task-attachments/nonexistent-id/download')

        assert response.status_code == 404
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Attachment not found' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_get_download_url_endpoint_server_error(self, mock_service_class, client):
        """Test get download URL endpoint with server error"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.get_download_url.side_effect = Exception("Storage error")

        response = client.get('/api/task-attachments/test-id/download')

        assert response.status_code == 500
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Storage error' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_get_attachment_endpoint_success(self, mock_service_class, client):
        """Test successful get attachment endpoint"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.get_attachment.return_value = {
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }

        response = client.get('/api/task-attachments/test-id')

        assert response.status_code == 200
        response_data = response.get_json()
        assert response_data['id'] == 'test-id'
        assert response_data['task_id'] == 1
        assert response_data['file_name'] == 'test.pdf'
        mock_service.get_attachment.assert_called_once_with('test-id')

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_get_attachment_endpoint_not_found(self, mock_service_class, client):
        """Test get attachment endpoint with attachment not found"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.get_attachment.side_effect = AttachmentNotFoundError("Attachment not found")

        response = client.get('/api/task-attachments/nonexistent-id')

        assert response.status_code == 404
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Attachment not found' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_get_attachment_endpoint_server_error(self, mock_service_class, client):
        """Test get attachment endpoint with server error"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.get_attachment.side_effect = Exception("Database error")

        response = client.get('/api/task-attachments/test-id')

        assert response.status_code == 500
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Database error' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_delete_attachment_endpoint_success(self, mock_service_class, client):
        """Test successful delete attachment endpoint"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.delete_attachment.return_value = None

        response = client.delete('/api/task-attachments/test-id')

        assert response.status_code == 200
        response_data = response.get_json()
        assert response_data['success'] is True
        mock_service.delete_attachment.assert_called_once_with('test-id')

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_delete_attachment_endpoint_not_found(self, mock_service_class, client):
        """Test delete attachment endpoint with attachment not found"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.delete_attachment.side_effect = AttachmentNotFoundError("Attachment not found")

        response = client.delete('/api/task-attachments/nonexistent-id')

        assert response.status_code == 404
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Attachment not found' in response_data['error']

    @patch('Controllers.AttachmentController.AttachmentService')
    def test_delete_attachment_endpoint_server_error(self, mock_service_class, client):
        """Test delete attachment endpoint with server error"""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.delete_attachment.side_effect = Exception("Database error")

        response = client.delete('/api/task-attachments/test-id')

        assert response.status_code == 500
        response_data = response.get_json()
        assert 'error' in response_data
        assert 'Database error' in response_data['error']

    def test_upload_endpoint_with_x_user_id_header(self, client):
        """Test upload endpoint using X-User-Id header"""
        with patch('Controllers.AttachmentController.AttachmentService') as mock_service_class:
            mock_service = Mock()
            mock_service_class.return_value = mock_service
            mock_service.upload_attachment.return_value = {
                "id": "test-id",
                "task_id": 1,
                "file_name": "test.pdf",
                "file_path": "1/1234567890-test.pdf",
                "file_size": 1024,
                "file_type": "application/pdf",
                "uploaded_by": 1,
                "uploaded_at": "2023-01-01T00:00:00Z"
            }

            data = {
                'file': (BytesIO(b'test file content'), 'test.pdf'),
                'task_id': '1'
            }

            headers = {'X-User-Id': '1'}

            response = client.post('/api/task-attachments/upload', 
                                 data=data, 
                                 content_type='multipart/form-data',
                                 headers=headers)

            assert response.status_code == 201
            response_data = response.get_json()
            assert response_data['id'] == 'test-id'
            mock_service.upload_attachment.assert_called_once()
            # Verify uploaded_by was set to 1 from header
            call_args = mock_service.upload_attachment.call_args
            assert call_args[0][2] == 1  # uploaded_by parameter


@pytest.mark.integration
class TestAttachmentServiceIntegration:
    """Integration tests for AttachmentService with real dependencies"""

    @pytest.fixture
    def attachment_service(self):
        """AttachmentService instance"""
        return AttachmentService()

    @pytest.fixture
    def sample_file_storage(self):
        """Sample file storage for testing"""
        file_storage = Mock()
        file_storage.filename = "test.pdf"
        file_storage.mimetype = "application/pdf"
        file_storage.read.return_value = b"test file content"
        return file_storage

    @patch('Services.AttachmentService.AttachmentRepository')
    @patch('Services.AttachmentService.StorageService')
    def test_upload_attachment_integration(self, mock_storage_class, mock_repo_class, attachment_service, sample_file_storage):
        """Test upload attachment with mocked dependencies"""
        # Mock repository
        mock_repo = Mock()
        mock_repo_class.return_value = mock_repo
        mock_repo.get_total_size_by_task.return_value = 0
        
        mock_attachment = Mock()
        mock_attachment.to_dict.return_value = {
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }
        mock_repo.create.return_value = mock_attachment

        # Mock storage
        mock_storage = Mock()
        mock_storage_class.return_value = mock_storage
        mock_storage.upload_file.return_value = ("1/1234567890-test.pdf", "bucket/1/1234567890-test.pdf")

        # Replace the service's dependencies with mocks
        attachment_service.repo = mock_repo
        attachment_service.storage = mock_storage

        result = attachment_service.upload_attachment(1, sample_file_storage, 1)

        assert result["task_id"] == 1
        assert result["file_name"] == "test.pdf"
        assert result["file_type"] == "application/pdf"
        assert result["uploaded_by"] == 1
        assert "id" in result
        assert "uploaded_at" in result
        mock_repo.get_total_size_by_task.assert_called_once_with(1)
        mock_storage.upload_file.assert_called_once()
        mock_repo.create.assert_called_once()

    @patch('Services.AttachmentService.AttachmentRepository')
    @patch('Services.AttachmentService.StorageService')
    def test_list_attachments_integration(self, mock_storage_class, mock_repo_class, attachment_service):
        """Test list attachments with mocked dependencies"""
        # Mock repository
        mock_repo = Mock()
        mock_repo_class.return_value = mock_repo
        
        sample_attachment = TaskAttachment(
            id="test-id",
            task_id=1,
            file_name="test.pdf",
            file_path="1/1234567890-test.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=1,
            uploaded_at=datetime.now(timezone.utc)
        )
        mock_repo.find_by_task_id.return_value = [sample_attachment]

        # Mock storage
        mock_storage = Mock()
        mock_storage_class.return_value = mock_storage
        mock_storage.get_signed_url.return_value = "https://signed-url.com/file"

        # Replace the service's dependencies with mocks
        attachment_service.repo = mock_repo
        attachment_service.storage = mock_storage

        result = attachment_service.list_attachments_for_task(1)

        assert len(result) == 1
        assert result[0]["id"] == "test-id"
        assert result[0]["download_url"] == "https://signed-url.com/file"
        mock_repo.find_by_task_id.assert_called_once_with(1)
        mock_storage.get_signed_url.assert_called_once()

    @patch('Services.AttachmentService.AttachmentRepository')
    @patch('Services.AttachmentService.StorageService')
    def test_delete_attachment_integration(self, mock_storage_class, mock_repo_class, attachment_service):
        """Test delete attachment with mocked dependencies"""
        # Mock repository
        mock_repo = Mock()
        mock_repo_class.return_value = mock_repo
        
        sample_attachment = TaskAttachment(
            id="test-id",
            task_id=1,
            file_name="test.pdf",
            file_path="1/1234567890-test.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=1,
            uploaded_at=datetime.now(timezone.utc)
        )
        mock_repo.delete.return_value = sample_attachment

        # Mock storage
        mock_storage = Mock()
        mock_storage_class.return_value = mock_storage

        # Replace the service's dependencies with mocks
        attachment_service.repo = mock_repo
        attachment_service.storage = mock_storage

        attachment_service.delete_attachment("test-id")

        mock_repo.delete.assert_called_once_with("test-id")
        mock_storage.delete_file.assert_called_once_with(sample_attachment.file_path)


if __name__ == "__main__":
    pytest.main([__file__])
