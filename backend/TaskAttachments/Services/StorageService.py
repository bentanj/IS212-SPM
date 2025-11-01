import os
import time
import tempfile
import mimetypes
from typing import Tuple
import requests

# Handle both relative and absolute imports
try:
    from ..config import Config
    from ..db import get_supabase_client
except ImportError:
    from config import Config
    from db import get_supabase_client


class StorageService:
    def __init__(self):
        self.client = get_supabase_client()
        self.bucket = Config.STORAGE_BUCKET

    def _generate_path(self, task_id: int, original_filename: str) -> str:
        base, ext = os.path.splitext(original_filename)
        # Sanitize filename to only allow alphanumeric, hyphens, underscores, spaces, and periods
        # This prevents issues with special characters in Supabase Storage
        safe_base = ''.join(c if c.isalnum() or c in (' ', '-', '_', '.') else '_' for c in base)
        # Replace multiple consecutive spaces or underscores with a single one
        safe_base = ' '.join(safe_base.split())
        ext_only = ext.lstrip('.')
        timestamp = int(time.time())
        return f"{task_id}/{timestamp}-{safe_base}.{ext_only}"

    def upload_file(self, task_id: int, file_stream, original_filename: str, content_type: str) -> Tuple[str, str]:
        path = self._generate_path(task_id, original_filename)
        # Normalize to raw bytes
        if hasattr(file_stream, 'read'):
            data = file_stream.read()
        else:
            data = file_stream

        # Write to temp file so SDK infers MIME from extension
        suffix = os.path.splitext(original_filename)[1] or ""
        fd, tmp_path = tempfile.mkstemp(prefix="upload_", suffix=suffix, dir="/tmp")
        try:
            with os.fdopen(fd, 'wb') as tmp_file:
                tmp_file.write(data)

            # Determine content type from filename if not provided
            guessed = mimetypes.guess_type(original_filename)[0]
            ct = content_type or guessed or "application/octet-stream"

            # Canonical upload via Supabase Storage REST API
            # PUT {SUPABASE_URL}/storage/v1/object/{bucket}/{path}
            url = f"{Config.SUPABASE_URL}/storage/v1/object/{self.bucket}/{path}"
            headers = {
                "Authorization": f"Bearer {Config.SUPABASE_SERVICE_KEY}",
                "Content-Type": ct,
                "x-upsert": "false",
            }
            with open(tmp_path, 'rb') as f:
                resp = requests.put(url, data=f, headers=headers, timeout=60)
            if resp.status_code >= 400:
                try:
                    detail = resp.json()
                except Exception:
                    detail = resp.text
                raise Exception(f"Supabase REST upload failed ({resp.status_code}): {detail}")
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        # REST upload returns 200/201 on success. Nothing else to validate here.
        return path, f"{self.bucket}/{path}"

    def delete_file(self, path: str) -> None:
        res = self.client.storage.from_(self.bucket).remove([path])
        if getattr(res, 'error', None):
            raise Exception(f"Storage delete failed: {res.error.message}")

    def get_signed_url(self, path: str, expires_in_seconds: int = 3600) -> str:
        res = self.client.storage.from_(self.bucket).create_signed_url(path, expires_in_seconds)
        if getattr(res, 'error', None):
            raise Exception(f"Signed URL generation failed: {res.error.message}")
        url = res.get('signedURL') if isinstance(res, dict) else getattr(res, 'signed_url', None) or getattr(res, 'signedURL', None)
        return url


