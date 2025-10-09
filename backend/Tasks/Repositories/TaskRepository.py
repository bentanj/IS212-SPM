from typing import Iterable, Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from uuid import UUID
from Models.Task import Task

class TaskRepository:
    def __init__(self, session: Session):
        self.session = session

    def list(self) -> Iterable[Task]:
        return self.session.query(Task).all()

    def get(self, task_id: int) -> Optional[Task]:
        return self.session.get(Task, task_id)

    def create(self, task_data: Dict[str, Any]) -> Task:
        task = Task(**task_data)
        self.session.add(task)
        self.session.flush()
        return task

    def update(self, task_id: int, task_data: Dict[str, Any]) -> Optional[Task]:
        task = self.session.get(Task, task_id)
        if task:
            for key, value in task_data.items():
                if hasattr(task, key):
                    setattr(task, key, value)
            self.session.flush()
        return task

    def delete(self, task_id: int) -> bool:
        task = self.session.get(Task, task_id)
        if task:
            self.session.delete(task)
            self.session.flush()
            return True
        return False

    def find_by_status(self, status: str) -> Iterable[Task]:
        return self.session.query(Task).filter(Task.status == status).all()

    def find_by_project(self, project_name: str) -> Iterable[Task]:
        return self.session.query(Task).filter(Task.project_name == project_name).all()

    def find_by_assigned_user(self, user_id: UUID) -> Iterable[Task]:
        return self.session.query(Task).filter(Task.assigned_users.any(user_id)).all()

    def find_by_priority(self, priority: str) -> Iterable[Task]:
        return self.session.query(Task).filter(Task.priority == priority).all()

    def find_overdue_tasks(self) -> Iterable[Task]:
        now = datetime.now()
        return self.session.query(Task).filter(
            and_(Task.due_date < now, Task.status != 'completed')
        ).all()

    def find_by_criteria(self, filters: Dict[str, Any]) -> Iterable[Task]:
        query = self.session.query(Task)

        if 'status' in filters:
            query = query.filter(Task.status == filters['status'])
        if 'project_name' in filters:
            query = query.filter(Task.project_name == filters['project_name'])
        if 'priority' in filters:
            query = query.filter(Task.priority == filters['priority'])
        if 'assigned_user' in filters:
            query = query.filter(Task.assigned_users.any(filters['assigned_user']))
        if 'due_before' in filters:
            query = query.filter(Task.due_date <= filters['due_before'])
        if 'due_after' in filters:
            query = query.filter(Task.due_date >= filters['due_after'])
        if 'start_date_after' in filters:
            query = query.filter(Task.start_date >= filters['start_date_after'])
        if 'start_date_before' in filters:
            query = query.filter(Task.start_date <= filters['start_date_before'])
        if 'parent_id' in filters:
            query = query.filter(Task.parent_id == filters['parent_id'])
        if 'departments' in filters:
            # Use PostgreSQL array overlap operator &&
            query = query.filter(Task.departments.op('&&')(filters['departments']))

        return query.all()

    def find_by_parent(self, parent_id: int) -> Iterable[Task]:
        return self.session.query(Task).filter(Task.parent_id == parent_id).all()

    def find_root_tasks(self) -> Iterable[Task]:
        return self.session.query(Task).filter(Task.parent_id == None).all()

    def count_by_status(self) -> Dict[str, int]:
        results = self.session.query(Task.status, self.session.query(Task).filter(Task.status == Task.status).count()).group_by(Task.status).all()
        return {status: count for status, count in results}