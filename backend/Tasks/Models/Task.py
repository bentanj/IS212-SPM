from sqlalchemy import Column, BigInteger, Text, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from db import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)
    status = Column(Text, nullable=True)
    project_name = Column(Text, nullable=True)
    assigned_users = Column(ARRAY(UUID), nullable=True)
    parent_id = Column('parentID', BigInteger, nullable=True)
    departments = Column(ARRAY(Text), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "completed_date": self.completed_date.isoformat() if self.completed_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "priority": self.priority,
            "tags": self.tags,
            "status": self.status,
            "project_name": self.project_name,
            "assigned_users": [str(user_id) for user_id in self.assigned_users] if self.assigned_users else [],
            "parent_id": self.parent_id,
            "departments": self.departments if self.departments else []
        }

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"