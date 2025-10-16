from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class TaskAttachment:
    id: str
    task_id: int
    file_name: str
    file_path: str
    file_size: int
    file_type: str
    uploaded_by: int
    uploaded_at: datetime

    @staticmethod
    def from_record(record: dict) -> "TaskAttachment":
        return TaskAttachment(
            id=record.get("id"),
            task_id=record.get("task_id"),
            file_name=record.get("file_name"),
            file_path=record.get("file_path"),
            file_size=record.get("file_size"),
            file_type=record.get("file_type"),
            uploaded_by=record.get("uploaded_by"),
            uploaded_at=datetime.fromisoformat(record.get("uploaded_at")) if isinstance(record.get("uploaded_at"), str) else record.get("uploaded_at"),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "task_id": self.task_id,
            "file_name": self.file_name,
            "file_path": self.file_path,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "uploaded_by": self.uploaded_by,
            "uploaded_at": self.uploaded_at.isoformat() if isinstance(self.uploaded_at, datetime) else self.uploaded_at,
        }


