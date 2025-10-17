from typing import List, Optional

# Handle both relative and absolute imports
try:
    from ..db import get_supabase_client
    from ..Models.TaskAttachment import TaskAttachment
    from ..exceptions import AttachmentNotFoundError
except ImportError:
    from db import get_supabase_client
    from Models.TaskAttachment import TaskAttachment
    from exceptions import AttachmentNotFoundError


class AttachmentRepository:
    def __init__(self):
        self.client = get_supabase_client()
        self.table = self.client.table("task_attachments")

    def create(self, record: dict) -> TaskAttachment:
        # Insert with provided id so storage path and DB id match
        response = self.table.insert(record).execute()
        if not response.data or len(response.data) == 0:
            raise Exception("Failed to insert attachment record")
        return TaskAttachment.from_record(response.data[0])

    def find_by_id(self, attachment_id: str) -> TaskAttachment:
        response = self.table.select("*").eq("id", attachment_id).single().execute()
        if not response.data:
            raise AttachmentNotFoundError("Attachment not found")
        return TaskAttachment.from_record(response.data)

    def find_by_task_id(self, task_id: int) -> List[TaskAttachment]:
        response = self.table.select("*").eq("task_id", task_id).order("uploaded_at", desc=True).execute()
        records = response.data or []
        return [TaskAttachment.from_record(r) for r in records]

    def delete(self, attachment_id: str) -> TaskAttachment:
        # Return deleted record (Supabase can return if .select after delete)
        response = self.table.delete().eq("id", attachment_id).select("*").single().execute()
        if not response.data:
            raise AttachmentNotFoundError("Attachment not found")
        return TaskAttachment.from_record(response.data)

    def get_total_size_by_task(self, task_id: int) -> int:
        # Supabase: use RPC or aggregate. Here we fetch columns and sum client-side for simplicity.
        response = self.table.select("file_size").eq("task_id", task_id).execute()
        sizes = [r["file_size"] for r in (response.data or []) if r.get("file_size")]
        return sum(sizes)


