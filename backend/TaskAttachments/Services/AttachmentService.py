from datetime import datetime, timezone
from typing import List, Tuple
import mimetypes
import uuid

# Handle both relative and absolute imports
try:
    from ..config import Config
    from ..Repositories.AttachmentRepository import AttachmentRepository
    from ..Services.StorageService import StorageService
    from ..exceptions import (
        InvalidFileTypeError,
        FileSizeExceededError,
        StorageQuotaExceededError,
        AttachmentNotFoundError,
    )
except ImportError:
    from config import Config
    from Repositories.AttachmentRepository import AttachmentRepository
    from Services.StorageService import StorageService
    from exceptions import (
        InvalidFileTypeError,
        FileSizeExceededError,
        StorageQuotaExceededError,
        AttachmentNotFoundError,
    )


class AttachmentService:
    def __init__(self):
        self.repo = AttachmentRepository()
        self.storage = StorageService()

    def _validate_file(self, filename: str, mime_type: str, file_size: int, task_id: int):
        # Normalize/guess MIME type if missing and compare case-insensitively
        guessed = mimetypes.guess_type(filename)[0]
        effective_mime = (mime_type or guessed or "").lower()
        allowed = {m.lower() for m in Config.ALLOWED_MIME_TYPES}
        if effective_mime not in allowed:
            raise InvalidFileTypeError("Invalid file format. Only PDF and Excel files are allowed.")

        if file_size > Config.MAX_FILE_SIZE_BYTES:
            raise FileSizeExceededError("File size exceeds 50MB limit.")

        current_total = self.repo.get_total_size_by_task(task_id)
        if current_total + file_size > Config.MAX_FILE_SIZE_BYTES:
            raise StorageQuotaExceededError(
                f"Total storage limit (50MB) exceeded for this task. Current usage: {current_total / (1024 * 1024):.2f} MB",
                current_usage_bytes=current_total,
            )

    def upload_attachment(self, task_id: int, file_storage, uploaded_by: str) -> dict:
        # file_storage: Werkzeug FileStorage
        filename = file_storage.filename
        mime_type = file_storage.mimetype
        data = file_storage.read()
        file_size = len(data)

        self._validate_file(filename, mime_type, file_size, task_id)

        # Ensure we pass a reliable content type to storage
        guessed = mimetypes.guess_type(filename)[0]
        content_type = mime_type or guessed or "application/octet-stream"

        # Upload with minimal path (no id in path)
        path, full_path = self.storage.upload_file(task_id, data, filename, content_type)

        now_iso = datetime.now(timezone.utc).isoformat()
        # Let DB generate UUID id; keep path minimal
        record = {
            "task_id": task_id,
            "file_name": filename,
            "file_path": path,
            "file_size": file_size,
            "file_type": mime_type,
            "uploaded_by": uploaded_by,
            "uploaded_at": now_iso,
        }

        try:
            created = self.repo.create(record)
            return created.to_dict()
        except Exception:
            try:
                self.storage.delete_file(path)
            except Exception:
                pass
            raise

    def list_attachments_for_task(self, task_id: int) -> List[dict]:
        attachments = self.repo.find_by_task_id(task_id)
        results = []
        for a in attachments:
            signed_url = self.storage.get_signed_url(a.file_path, expires_in_seconds=3600)
            item = a.to_dict()
            item["download_url"] = signed_url
            results.append(item)
        return results

    def get_attachment(self, attachment_id: str) -> dict:
        att = self.repo.find_by_id(attachment_id)
        return att.to_dict()

    def get_download_url(self, attachment_id: str) -> str:
        att = self.repo.find_by_id(attachment_id)
        return self.storage.get_signed_url(att.file_path, expires_in_seconds=3600)

    def delete_attachment(self, attachment_id: str) -> None:
        att = self.repo.delete(attachment_id)

        # Check if any other tasks reference this file before deleting from storage
        references_count = self.repo.count_file_references(att.file_path, exclude_id=attachment_id)

        # Only delete from storage if no other tasks reference this file
        if references_count == 0:
            try:
                self.storage.delete_file(att.file_path)
            except Exception:
                pass

    def copy_attachments_to_task(self, source_task_id: int, target_task_id: int) -> List[dict]:
        """
        Copy all attachments from source task to target task.
        Used for recurring tasks to inherit parent task attachments.
        Does NOT duplicate files in storage - only creates new database records.

        Returns list of created attachment dictionaries.
        """
        source_attachments = self.repo.find_by_task_id(source_task_id)
        copied_attachments = []

        for source_att in source_attachments:
            now_iso = datetime.now(timezone.utc).isoformat()

            # Determine the original task ID
            original_task_id = source_att.original_task_id if source_att.is_inherited else source_task_id

            # Create new record pointing to same file
            record = {
                "task_id": target_task_id,
                "file_name": source_att.file_name,
                "file_path": source_att.file_path,  # Same path - no file copy!
                "file_size": source_att.file_size,
                "file_type": source_att.file_type,
                "uploaded_by": source_att.uploaded_by,  # Preserve original uploader
                "uploaded_at": source_att.uploaded_at.isoformat() if isinstance(source_att.uploaded_at, datetime) else source_att.uploaded_at,
                "original_task_id": original_task_id,  # Track original source
                "is_inherited": True,  # Mark as inherited
            }

            try:
                created = self.repo.create(record)
                copied_attachments.append(created.to_dict())
            except Exception as e:
                # Log error but continue with other files
                print(f"Error copying attachment {source_att.id}: {str(e)}")
                continue

        return copied_attachments


