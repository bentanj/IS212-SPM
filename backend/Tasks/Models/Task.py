from sqlalchemy import Column, BigInteger, Text, DateTime, ARRAY, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import requests
import os
from db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(BigInteger, nullable=True)
    tags = Column(ARRAY(Text), nullable=True)
    status = Column(Text, nullable=True)
    project_name = Column(Text, nullable=True)
    assigned_users = Column(ARRAY(Integer), nullable=True)
    parent_id = Column('parentID', BigInteger, nullable=True)
    departments = Column(ARRAY(Text), nullable=True)
    comments = Column(JSONB, nullable=True, default=[])
    recurrence_frequency = Column('recurrenceFrequency', Text, nullable=True)
    recurrence_interval = Column('recurrenceInterval', Integer, nullable=True)

    def to_dict(self, db_session: Optional[Session] = None, fetch_users: bool = True) -> Dict[str, Any]:
        # Fetch assigned users via HTTP call to Authentication service
        assigned_users_data = []
        if fetch_users and self.assigned_users:
            try:
                # Get Auth service URL from environment or use default
                auth_service_url = os.getenv(
                    'AUTH_SERVICE_URL', 'http://authentication:8002')

                # Fetch each user via HTTP request
                for user_id in self.assigned_users:
                    try:
                        response = requests.get(
                            f"{auth_service_url}/api/users/{user_id}",
                            timeout=2
                        )
                        if response.status_code == 200:
                            assigned_users_data.append(response.json())
                        else:
                            # User not found, skip
                            print(
                                f"Warning: User {user_id} not found (status {response.status_code})")
                    except requests.exceptions.RequestException as e:
                        print(f"Warning: Failed to fetch user {user_id}: {e}")

                # If no users were fetched successfully, fall back to user IDs
                if not assigned_users_data:
                    assigned_users_data = self.assigned_users
            except Exception as e:
                # If fetching users fails, fall back to returning user IDs
                print(f"Warning: Failed to fetch user details: {e}")
                assigned_users_data = self.assigned_users if self.assigned_users else []
        else:
            # If fetch_users is False, return user IDs only
            assigned_users_data = self.assigned_users if self.assigned_users else []

        return {
            "taskId": self.id,
            "title": self.title,
            "description": self.description,
            "startDate": self.start_date.isoformat() if self.start_date else None,
            "completedDate": self.completed_date.isoformat() if self.completed_date else None,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "priority": self.priority,
            "tags": self.tags if self.tags else [],
            "status": self.status,
            "project_name": self.project_name,
            "assignedUsers": assigned_users_data,
            "parentTaskId": self.parent_id,
            "departments": self.departments if self.departments else [],
            "comments": self.comments if self.comments else [],
            "recurrenceFrequency": self.recurrence_frequency,
            "recurrenceInterval": self.recurrence_interval
        }

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
