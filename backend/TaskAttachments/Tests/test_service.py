import pytest
import tempfile
import os
import sys
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone
from io import BytesIO

# Add the parent directory to the path to enable imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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


@pytest.mark.unit
class TestAttachmentService:
    """Test AttachmentService functionality"""

    @pytest.fixture
    def mock_repo(self):
        """Mock AttachmentRepository"""
        return Mock(spec=AttachmentRepository)

    @pytest.fixture
    def mock_storage(self):
        """Mock StorageService"""
        return Mock(spec=StorageService)

    @pytest.fixture
    def attachment_service(self, mock_repo, mock_storage):
        """AttachmentService with mocked dependencies"""
        service = AttachmentService()
        service.repo = mock_repo
        service.storage = mock_storage
        return service

    @pytest.fixture
    def sample_file_storage(self):
        """Mock file storage object"""
        file_storage = Mock()
        file_storage.filename = "test.pdf"
        file_storage.mimetype = "application/pdf"
        file_storage.read.return_value = b"test file content"
        return file_storage

    @pytest.fixture
    def sample_attachment(self):
        """Sample TaskAttachment for testing"""
        return TaskAttachment(
            id="test-attachment-id",
            task_id=1,
            file_name="test.pdf",
            file_path="1/1234567890-test.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=1,
            uploaded_at=datetime.now(timezone.utc)
        )

    def test_validate_file_valid_pdf(self, attachment_service):
        """Test file validation with valid PDF"""
        attachment_service.repo.get_total_size_by_task.return_value = 0
        
        # Should not raise any exception
        attachment_service._validate_file("test.pdf", "application/pdf", 1024, 1)

    def test_validate_file_valid_excel(self, attachment_service):
        """Test file validation with valid Excel file"""
        attachment_service.repo.get_total_size_by_task.return_value = 0
        
        # Should not raise any exception
        attachment_service._validate_file("test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 2048, 1)

    def test_validate_file_invalid_type(self, attachment_service):
        """Test file validation with invalid file type"""
        attachment_service.repo.get_total_size_by_task.return_value = 0
        
        with pytest.raises(InvalidFileTypeError, match="Invalid file format. Only PDF and Excel files are allowed."):
            attachment_service._validate_file("test.txt", "text/plain", 1024, 1)

    def test_validate_file_missing_mime_type_guessed(self, attachment_service):
        """Test file validation with missing MIME type but valid extension"""
        attachment_service.repo.get_total_size_by_task.return_value = 0
        
        # Should not raise exception as mimetypes.guess_type will guess PDF
        attachment_service._validate_file("test.pdf", None, 1024, 1)

    def test_validate_file_size_exceeded(self, attachment_service):
        """Test file validation with size exceeding limit"""
        attachment_service.repo.get_total_size_by_task.return_value = 0
        
        with pytest.raises(FileSizeExceededError, match="File size exceeds 50MB limit."):
            attachment_service._validate_file("test.pdf", "application/pdf", 60 * 1024 * 1024, 1)

    def test_validate_file_storage_quota_exceeded(self, attachment_service):
        """Test file validation with storage quota exceeded"""
        attachment_service.repo.get_total_size_by_task.return_value = 40 * 1024 * 1024  # 40MB already used
        
        with pytest.raises(StorageQuotaExceededError, match="Total storage limit \\(50MB\\) exceeded"):
            attachment_service._validate_file("test.pdf", "application/pdf", 15 * 1024 * 1024, 1)

    def test_upload_attachment_success(self, attachment_service, sample_file_storage):
        """Test successful attachment upload"""
        # Mock repository and storage responses
        attachment_service.repo.get_total_size_by_task.return_value = 0
        attachment_service.storage.upload_file.return_value = ("1/1234567890-test.pdf", "bucket/1/1234567890-test.pdf")
        
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
        attachment_service.repo.create.return_value = mock_attachment

        result = attachment_service.upload_attachment(1, sample_file_storage, 1)

        assert result["id"] == "test-id"
        assert result["task_id"] == 1
        assert result["file_name"] == "test.pdf"
        attachment_service.storage.upload_file.assert_called_once()
        attachment_service.repo.create.assert_called_once()

    def test_upload_attachment_repo_failure_cleanup(self, attachment_service, sample_file_storage):
        """Test attachment upload with repository failure triggers storage cleanup"""
        attachment_service.repo.get_total_size_by_task.return_value = 0
        attachment_service.storage.upload_file.return_value = ("1/1234567890-test.pdf", "bucket/1/1234567890-test.pdf")
        attachment_service.repo.create.side_effect = Exception("Database error")

        with pytest.raises(Exception, match="Database error"):
            attachment_service.upload_attachment(1, sample_file_storage, 1)

        # Verify storage cleanup was attempted
        attachment_service.storage.delete_file.assert_called_once_with("1/1234567890-test.pdf")

    def test_upload_attachment_storage_cleanup_failure(self, attachment_service, sample_file_storage):
        """Test attachment upload with storage cleanup failure doesn't mask original error"""
        attachment_service.repo.get_total_size_by_task.return_value = 0
        attachment_service.storage.upload_file.return_value = ("1/1234567890-test.pdf", "bucket/1/1234567890-test.pdf")
        attachment_service.repo.create.side_effect = Exception("Database error")
        attachment_service.storage.delete_file.side_effect = Exception("Storage cleanup failed")

        # Original database error should still be raised
        with pytest.raises(Exception, match="Database error"):
            attachment_service.upload_attachment(1, sample_file_storage, 1)

    def test_list_attachments_for_task(self, attachment_service, sample_attachment):
        """Test listing attachments for a task"""
        attachment_service.repo.find_by_task_id.return_value = [sample_attachment]
        attachment_service.storage.get_signed_url.return_value = "https://signed-url.com/file"

        result = attachment_service.list_attachments_for_task(1)

        assert len(result) == 1
        assert result[0]["id"] == "test-attachment-id"
        assert result[0]["download_url"] == "https://signed-url.com/file"
        attachment_service.repo.find_by_task_id.assert_called_once_with(1)
        attachment_service.storage.get_signed_url.assert_called_once()

    def test_get_attachment(self, attachment_service, sample_attachment):
        """Test getting a single attachment"""
        attachment_service.repo.find_by_id.return_value = sample_attachment

        result = attachment_service.get_attachment("test-attachment-id")

        assert result["id"] == "test-attachment-id"
        assert result["task_id"] == 1
        attachment_service.repo.find_by_id.assert_called_once_with("test-attachment-id")

    def test_get_download_url(self, attachment_service, sample_attachment):
        """Test getting download URL for attachment"""
        attachment_service.repo.find_by_id.return_value = sample_attachment
        attachment_service.storage.get_signed_url.return_value = "https://signed-url.com/file"

        result = attachment_service.get_download_url("test-attachment-id")

        assert result == "https://signed-url.com/file"
        attachment_service.repo.find_by_id.assert_called_once_with("test-attachment-id")
        attachment_service.storage.get_signed_url.assert_called_once_with(sample_attachment.file_path, expires_in_seconds=3600)

    def test_delete_attachment_with_no_references(self, attachment_service, sample_attachment):
        """Test attachment deletion when no other tasks reference the file"""
        attachment_service.repo.delete.return_value = sample_attachment
        attachment_service.repo.count_file_references.return_value = 0

        attachment_service.delete_attachment("test-attachment-id")

        attachment_service.repo.delete.assert_called_once_with("test-attachment-id")
        attachment_service.repo.count_file_references.assert_called_once_with(
            sample_attachment.file_path,
            exclude_id="test-attachment-id"
        )
        attachment_service.storage.delete_file.assert_called_once_with(sample_attachment.file_path)

    def test_delete_attachment_with_references(self, attachment_service, sample_attachment):
        """Test attachment deletion when other tasks still reference the file"""
        attachment_service.repo.delete.return_value = sample_attachment
        attachment_service.repo.count_file_references.return_value = 2  # 2 other tasks still reference this file

        attachment_service.delete_attachment("test-attachment-id")

        attachment_service.repo.delete.assert_called_once_with("test-attachment-id")
        attachment_service.repo.count_file_references.assert_called_once_with(
            sample_attachment.file_path,
            exclude_id="test-attachment-id"
        )
        # Storage delete should NOT be called because other tasks reference the file
        attachment_service.storage.delete_file.assert_not_called()

    def test_delete_attachment_storage_failure_ignored(self, attachment_service, sample_attachment):
        """Test attachment deletion with storage failure is ignored"""
        attachment_service.repo.delete.return_value = sample_attachment
        attachment_service.repo.count_file_references.return_value = 0
        attachment_service.storage.delete_file.side_effect = Exception("Storage delete failed")

        # Should not raise exception even if storage delete fails
        attachment_service.delete_attachment("test-attachment-id")

        attachment_service.repo.delete.assert_called_once_with("test-attachment-id")
        attachment_service.storage.delete_file.assert_called_once_with(sample_attachment.file_path)

    def test_copy_attachments_to_task_success(self, attachment_service):
        """Test successful attachment copying from source to target task"""
        source_attachment1 = TaskAttachment(
            id="att-1",
            task_id=1,
            file_name="file1.pdf",
            file_path="1/123-file1.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=5,
            uploaded_at=datetime(2023, 1, 1, tzinfo=timezone.utc),
            original_task_id=None,
            is_inherited=False
        )

        source_attachment2 = TaskAttachment(
            id="att-2",
            task_id=1,
            file_name="file2.xlsx",
            file_path="1/456-file2.xlsx",
            file_size=2048,
            file_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            uploaded_by=5,
            uploaded_at=datetime(2023, 1, 2, tzinfo=timezone.utc),
            original_task_id=None,
            is_inherited=False
        )

        attachment_service.repo.find_by_task_id.return_value = [source_attachment1, source_attachment2]

        # Mock created attachments
        created_att1 = Mock()
        created_att1.to_dict.return_value = {
            "id": "new-att-1",
            "task_id": 2,
            "file_name": "file1.pdf",
            "file_path": "1/123-file1.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 5,
            "uploaded_at": "2023-01-01T00:00:00+00:00",
            "original_task_id": 1,
            "is_inherited": True
        }

        created_att2 = Mock()
        created_att2.to_dict.return_value = {
            "id": "new-att-2",
            "task_id": 2,
            "file_name": "file2.xlsx",
            "file_path": "1/456-file2.xlsx",
            "file_size": 2048,
            "file_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "uploaded_by": 5,
            "uploaded_at": "2023-01-02T00:00:00+00:00",
            "original_task_id": 1,
            "is_inherited": True
        }

        attachment_service.repo.create.side_effect = [created_att1, created_att2]

        result = attachment_service.copy_attachments_to_task(1, 2)

        assert len(result) == 2
        assert result[0]["id"] == "new-att-1"
        assert result[0]["task_id"] == 2
        assert result[0]["original_task_id"] == 1
        assert result[0]["is_inherited"] is True
        assert result[1]["id"] == "new-att-2"

        # Verify repository methods called correctly
        attachment_service.repo.find_by_task_id.assert_called_once_with(1)
        assert attachment_service.repo.create.call_count == 2

    def test_copy_attachments_to_task_preserves_original_uploader(self, attachment_service):
        """Test that copying attachments preserves the original uploader ID"""
        source_attachment = TaskAttachment(
            id="att-1",
            task_id=1,
            file_name="file.pdf",
            file_path="1/123-file.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=5,  # Original uploader
            uploaded_at=datetime(2023, 1, 1, tzinfo=timezone.utc),
            original_task_id=None,
            is_inherited=False
        )

        attachment_service.repo.find_by_task_id.return_value = [source_attachment]

        created_att = Mock()
        created_att.to_dict.return_value = {
            "id": "new-att",
            "task_id": 2,
            "file_name": "file.pdf",
            "file_path": "1/123-file.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 5,  # Should preserve original uploader
            "uploaded_at": "2023-01-01T00:00:00+00:00",
            "original_task_id": 1,
            "is_inherited": True
        }

        attachment_service.repo.create.return_value = created_att

        result = attachment_service.copy_attachments_to_task(1, 2)

        assert result[0]["uploaded_by"] == 5  # Original uploader preserved

        # Verify the record passed to create has correct uploaded_by
        call_args = attachment_service.repo.create.call_args[0][0]
        assert call_args["uploaded_by"] == 5

    def test_copy_attachments_to_task_tracks_inheritance_chain(self, attachment_service):
        """Test that copying already-inherited attachments maintains the original task ID"""
        # This attachment was already inherited from task 1
        inherited_attachment = TaskAttachment(
            id="att-1",
            task_id=2,
            file_name="file.pdf",
            file_path="1/123-file.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=5,
            uploaded_at=datetime(2023, 1, 1, tzinfo=timezone.utc),
            original_task_id=1,  # Originally from task 1
            is_inherited=True
        )

        attachment_service.repo.find_by_task_id.return_value = [inherited_attachment]

        created_att = Mock()
        created_att.to_dict.return_value = {
            "id": "new-att",
            "task_id": 3,
            "file_name": "file.pdf",
            "file_path": "1/123-file.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 5,
            "uploaded_at": "2023-01-01T00:00:00+00:00",
            "original_task_id": 1,  # Should track back to original task 1, not task 2
            "is_inherited": True
        }

        attachment_service.repo.create.return_value = created_att

        result = attachment_service.copy_attachments_to_task(2, 3)

        # Should track back to original task 1, not the intermediate task 2
        assert result[0]["original_task_id"] == 1

        call_args = attachment_service.repo.create.call_args[0][0]
        assert call_args["original_task_id"] == 1

    def test_copy_attachments_to_task_no_attachments(self, attachment_service):
        """Test copying when source task has no attachments"""
        attachment_service.repo.find_by_task_id.return_value = []

        result = attachment_service.copy_attachments_to_task(1, 2)

        assert len(result) == 0
        attachment_service.repo.find_by_task_id.assert_called_once_with(1)
        attachment_service.repo.create.assert_not_called()

    def test_copy_attachments_to_task_partial_failure(self, attachment_service):
        """Test copying attachments when some creations fail"""
        source_att1 = TaskAttachment(
            id="att-1",
            task_id=1,
            file_name="file1.pdf",
            file_path="1/123-file1.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=5,
            uploaded_at=datetime(2023, 1, 1, tzinfo=timezone.utc)
        )

        source_att2 = TaskAttachment(
            id="att-2",
            task_id=1,
            file_name="file2.pdf",
            file_path="1/456-file2.pdf",
            file_size=2048,
            file_type="application/pdf",
            uploaded_by=5,
            uploaded_at=datetime(2023, 1, 2, tzinfo=timezone.utc)
        )

        attachment_service.repo.find_by_task_id.return_value = [source_att1, source_att2]

        # First creation succeeds, second fails
        created_att = Mock()
        created_att.to_dict.return_value = {"id": "new-att-1"}

        attachment_service.repo.create.side_effect = [
            created_att,
            Exception("Database error")
        ]

        result = attachment_service.copy_attachments_to_task(1, 2)

        # Should return only the successful copy
        assert len(result) == 1
        assert result[0]["id"] == "new-att-1"
        assert attachment_service.repo.create.call_count == 2

    def test_copy_attachments_does_not_duplicate_files_in_storage(self, attachment_service):
        """Test that copying attachments reuses file paths and doesn't upload new files"""
        source_attachment = TaskAttachment(
            id="att-1",
            task_id=1,
            file_name="file.pdf",
            file_path="1/123-file.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=5,
            uploaded_at=datetime(2023, 1, 1, tzinfo=timezone.utc)
        )

        attachment_service.repo.find_by_task_id.return_value = [source_attachment]

        created_att = Mock()
        created_att.to_dict.return_value = {"id": "new-att"}
        attachment_service.repo.create.return_value = created_att

        attachment_service.copy_attachments_to_task(1, 2)

        # Storage service should NOT be called at all
        attachment_service.storage.upload_file.assert_not_called()

        # Verify the created record uses the same file_path
        call_args = attachment_service.repo.create.call_args[0][0]
        assert call_args["file_path"] == "1/123-file.pdf"


@pytest.mark.unit
class TestStorageService:
    """Test StorageService functionality"""

    @pytest.fixture
    def mock_client(self):
        """Mock Supabase client"""
        return Mock()

    @pytest.fixture
    def storage_service(self, mock_client):
        """StorageService with mocked client"""
        service = StorageService()
        service.client = mock_client
        return service

    def test_generate_path(self, storage_service):
        """Test path generation"""
        with patch('time.time', return_value=1234567890):
            path = storage_service._generate_path(1, "test file.pdf")
            assert path == "1/1234567890-test file.pdf"

    def test_generate_path_with_special_characters(self, storage_service):
        """Test path generation with special characters"""
        with patch('time.time', return_value=1234567890):
            path = storage_service._generate_path(1, "test/file\\name.pdf")
            assert path == "1/1234567890-test_file_name.pdf"

    def test_generate_path_with_unicode_dash(self, storage_service):
        """Test path generation with unicode dash characters like en-dash"""
        with patch('time.time', return_value=1761919616):
            path = storage_service._generate_path(144, "Week 11 Lab – Refactoring.pdf")
            assert path == "144/1761919616-Week 11 Lab _ Refactoring.pdf"

    def test_generate_path_no_extension(self, storage_service):
        """Test path generation without file extension"""
        with patch('time.time', return_value=1234567890):
            path = storage_service._generate_path(1, "testfile")
            assert path == "1/1234567890-testfile."

    @patch('time.time')
    @patch('builtins.open')
    @patch('requests.put')
    @patch('os.fdopen')
    @patch('tempfile.mkstemp')
    def test_upload_file_success(self, mock_mkstemp, mock_fdopen, mock_put, mock_open, mock_time, storage_service):
        """Test successful file upload"""
        mock_time.return_value = 1234567890
        mock_response = Mock()
        mock_response.status_code = 200
        mock_put.return_value = mock_response
        
        mock_mkstemp.return_value = (1, "/tmp/test_file.pdf")
        mock_file = Mock()
        mock_fdopen.return_value.__enter__.return_value = mock_file
        mock_open.return_value.__enter__.return_value = Mock()

        path, full_path = storage_service.upload_file(1, b"test data", "test.pdf", "application/pdf")

        assert path == "1/1234567890-test.pdf"
        assert full_path == "task-attachments/1/1234567890-test.pdf"
        mock_put.assert_called_once()

    @patch('builtins.open')
    @patch('requests.put')
    @patch('os.fdopen')
    @patch('tempfile.mkstemp')
    def test_upload_file_failure(self, mock_mkstemp, mock_fdopen, mock_put, mock_open, storage_service):
        """Test file upload failure"""
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.json.return_value = {"error": "Upload failed"}
        mock_put.return_value = mock_response
        
        mock_mkstemp.return_value = (1, "/tmp/test_file.pdf")
        mock_file = Mock()
        mock_fdopen.return_value.__enter__.return_value = mock_file
        mock_open.return_value.__enter__.return_value = Mock()

        with pytest.raises(Exception, match="Supabase REST upload failed \\(400\\)"):
            storage_service.upload_file(1, b"test data", "test.pdf", "application/pdf")

    def test_delete_file_success(self, storage_service):
        """Test successful file deletion"""
        mock_response = Mock()
        mock_response.error = None
        storage_service.client.storage.from_.return_value.remove.return_value = mock_response

        storage_service.delete_file("test/path.pdf")

        storage_service.client.storage.from_.assert_called_once_with("task-attachments")
        storage_service.client.storage.from_.return_value.remove.assert_called_once_with(["test/path.pdf"])

    def test_delete_file_failure(self, storage_service):
        """Test file deletion failure"""
        mock_response = Mock()
        mock_response.error = Mock()
        mock_response.error.message = "Delete failed"
        storage_service.client.storage.from_.return_value.remove.return_value = mock_response

        with pytest.raises(Exception, match="Storage delete failed: Delete failed"):
            storage_service.delete_file("test/path.pdf")

    def test_get_signed_url_success(self, storage_service):
        """Test successful signed URL generation"""
        mock_response = Mock()
        mock_response.error = None
        mock_response.signed_url = "https://signed-url.com/file"
        storage_service.client.storage.from_.return_value.create_signed_url.return_value = mock_response

        result = storage_service.get_signed_url("test/path.pdf", 3600)

        assert result == "https://signed-url.com/file"
        storage_service.client.storage.from_.assert_called_once_with("task-attachments")
        storage_service.client.storage.from_.return_value.create_signed_url.assert_called_once_with("test/path.pdf", 3600)

    def test_get_signed_url_failure(self, storage_service):
        """Test signed URL generation failure"""
        mock_response = Mock()
        mock_response.error = Mock()
        mock_response.error.message = "URL generation failed"
        storage_service.client.storage.from_.return_value.create_signed_url.return_value = mock_response

        with pytest.raises(Exception, match="Signed URL generation failed: URL generation failed"):
            storage_service.get_signed_url("test/path.pdf", 3600)


@pytest.mark.unit
class TestAttachmentRepository:
    """Test AttachmentRepository functionality"""

    @pytest.fixture
    def mock_client(self):
        """Mock Supabase client"""
        return Mock()

    @pytest.fixture
    def mock_table(self):
        """Mock Supabase table"""
        return Mock()

    @pytest.fixture
    def attachment_repo(self, mock_client, mock_table):
        """AttachmentRepository with mocked dependencies"""
        repo = AttachmentRepository()
        repo.client = mock_client
        repo.table = mock_table
        return repo

    def test_create_success(self, attachment_repo):
        """Test successful attachment creation"""
        mock_response = Mock()
        mock_response.data = [{
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }]
        attachment_repo.table.insert.return_value.execute.return_value = mock_response

        record = {
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }

        result = attachment_repo.create(record)

        assert isinstance(result, TaskAttachment)
        assert result.id == "test-id"
        assert result.task_id == 1
        attachment_repo.table.insert.assert_called_once_with(record)

    def test_create_failure(self, attachment_repo):
        """Test attachment creation failure"""
        mock_response = Mock()
        mock_response.data = []
        attachment_repo.table.insert.return_value.execute.return_value = mock_response

        record = {"task_id": 1, "file_name": "test.pdf"}

        with pytest.raises(Exception, match="Failed to insert attachment record"):
            attachment_repo.create(record)

    def test_find_by_id_success(self, attachment_repo):
        """Test successful attachment retrieval by ID"""
        mock_response = Mock()
        mock_response.data = {
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }
        attachment_repo.table.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        result = attachment_repo.find_by_id("test-id")

        assert isinstance(result, TaskAttachment)
        assert result.id == "test-id"
        attachment_repo.table.select.assert_called_once_with("*")

    def test_find_by_id_not_found(self, attachment_repo):
        """Test attachment retrieval by ID when not found"""
        mock_response = Mock()
        mock_response.data = None
        attachment_repo.table.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

        with pytest.raises(AttachmentNotFoundError, match="Attachment not found"):
            attachment_repo.find_by_id("nonexistent-id")

    def test_find_by_task_id_success(self, attachment_repo):
        """Test successful attachment retrieval by task ID"""
        mock_response = Mock()
        mock_response.data = [
            {
                "id": "test-id-1",
                "task_id": 1,
                "file_name": "test1.pdf",
                "file_path": "1/1234567890-test1.pdf",
                "file_size": 1024,
                "file_type": "application/pdf",
                "uploaded_by": 1,
                "uploaded_at": "2023-01-01T00:00:00Z"
            },
            {
                "id": "test-id-2",
                "task_id": 1,
                "file_name": "test2.pdf",
                "file_path": "1/1234567890-test2.pdf",
                "file_size": 2048,
                "file_type": "application/pdf",
                "uploaded_by": 1,
                "uploaded_at": "2023-01-01T01:00:00Z"
            }
        ]
        attachment_repo.table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response

        result = attachment_repo.find_by_task_id(1)

        assert len(result) == 2
        assert all(isinstance(att, TaskAttachment) for att in result)
        assert result[0].id == "test-id-1"
        assert result[1].id == "test-id-2"
        attachment_repo.table.select.assert_called_once_with("*")

    def test_find_by_task_id_empty(self, attachment_repo):
        """Test attachment retrieval by task ID when no attachments exist"""
        mock_response = Mock()
        mock_response.data = None
        attachment_repo.table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response

        result = attachment_repo.find_by_task_id(1)

        assert len(result) == 0

    def test_delete_success(self, attachment_repo):
        """Test successful attachment deletion"""
        mock_response = Mock()
        mock_response.data = {
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }
        attachment_repo.table.delete.return_value.eq.return_value.select.return_value.single.return_value.execute.return_value = mock_response

        result = attachment_repo.delete("test-id")

        assert isinstance(result, TaskAttachment)
        assert result.id == "test-id"
        attachment_repo.table.delete.assert_called_once()

    def test_delete_not_found(self, attachment_repo):
        """Test attachment deletion when not found"""
        mock_response = Mock()
        mock_response.data = None
        attachment_repo.table.delete.return_value.eq.return_value.select.return_value.single.return_value.execute.return_value = mock_response

        with pytest.raises(AttachmentNotFoundError, match="Attachment not found"):
            attachment_repo.delete("nonexistent-id")

    def test_get_total_size_by_task(self, attachment_repo):
        """Test getting total size by task"""
        mock_response = Mock()
        mock_response.data = [
            {"file_size": 1024},
            {"file_size": 2048},
            {"file_size": None},  # Should be ignored
            {"file_size": 512}
        ]
        attachment_repo.table.select.return_value.eq.return_value.execute.return_value = mock_response

        result = attachment_repo.get_total_size_by_task(1)

        assert result == 1024 + 2048 + 512  # 3584 bytes
        attachment_repo.table.select.assert_called_once_with("file_size")

    def test_get_total_size_by_task_empty(self, attachment_repo):
        """Test getting total size by task when no attachments exist"""
        mock_response = Mock()
        mock_response.data = None
        attachment_repo.table.select.return_value.eq.return_value.execute.return_value = mock_response

        result = attachment_repo.get_total_size_by_task(1)

        assert result == 0


@pytest.mark.unit
class TestTaskAttachmentModel:
    """Test TaskAttachment model functionality"""

    def test_from_record(self):
        """Test TaskAttachment creation from record"""
        record = {
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": "2023-01-01T00:00:00Z"
        }

        attachment = TaskAttachment.from_record(record)

        assert attachment.id == "test-id"
        assert attachment.task_id == 1
        assert attachment.file_name == "test.pdf"
        assert attachment.file_path == "1/1234567890-test.pdf"
        assert attachment.file_size == 1024
        assert attachment.file_type == "application/pdf"
        assert attachment.uploaded_by == 1
        assert isinstance(attachment.uploaded_at, datetime)

    def test_from_record_with_datetime_object(self):
        """Test TaskAttachment creation from record with datetime object"""
        now = datetime.now(timezone.utc)
        record = {
            "id": "test-id",
            "task_id": 1,
            "file_name": "test.pdf",
            "file_path": "1/1234567890-test.pdf",
            "file_size": 1024,
            "file_type": "application/pdf",
            "uploaded_by": 1,
            "uploaded_at": now
        }

        attachment = TaskAttachment.from_record(record)

        assert attachment.uploaded_at == now

    def test_to_dict(self):
        """Test TaskAttachment conversion to dictionary"""
        now = datetime.now(timezone.utc)
        attachment = TaskAttachment(
            id="test-id",
            task_id=1,
            file_name="test.pdf",
            file_path="1/1234567890-test.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=1,
            uploaded_at=now
        )

        result = attachment.to_dict()

        assert result["id"] == "test-id"
        assert result["task_id"] == 1
        assert result["file_name"] == "test.pdf"
        assert result["file_path"] == "1/1234567890-test.pdf"
        assert result["file_size"] == 1024
        assert result["file_type"] == "application/pdf"
        assert result["uploaded_by"] == 1
        assert result["uploaded_at"] == now.isoformat()

    def test_to_dict_with_string_datetime(self):
        """Test TaskAttachment conversion to dictionary with string datetime"""
        attachment = TaskAttachment(
            id="test-id",
            task_id=1,
            file_name="test.pdf",
            file_path="1/1234567890-test.pdf",
            file_size=1024,
            file_type="application/pdf",
            uploaded_by=1,
            uploaded_at="2023-01-01T00:00:00Z"  # String datetime
        )

        result = attachment.to_dict()

        assert result["uploaded_at"] == "2023-01-01T00:00:00Z"


if __name__ == "__main__":
    pytest.main([__file__])
