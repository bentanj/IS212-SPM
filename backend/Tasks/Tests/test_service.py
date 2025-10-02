from datetime import datetime
from typing import Iterable, Optional, Dict, Any, List
from uuid import UUID, uuid4
import pytest

from Services.TaskService import TaskService
from Models.Task import Task


class InMemoryRepo:
    def __init__(self):
        self._store: Dict[int, Task] = {}
        self._next_id = 1

    def list(self) -> Iterable[Task]:
        return list(self._store.values())

    def get(self, task_id: int) -> Optional[Task]:
        return self._store.get(task_id)

    def create(self, task_data: Dict[str, Any]) -> Task:
        task = Task(**task_data)
        task.id = self._next_id
        self._next_id += 1
        self._store[task.id] = task
        return task

    def update(self, task_id: int, task_data: Dict[str, Any]) -> Optional[Task]:
        task = self._store.get(task_id)
        if not task:
            return None
        for k, v in task_data.items():
            if hasattr(task, k):
                setattr(task, k, v)
        self._store[task_id] = task
        return task

    def delete(self, task_id: int) -> bool:
        return self._store.pop(task_id, None) is not None

    # The service calls below may be used by tests; implement minimal behavior
    def find_by_status(self, status: str) -> Iterable[Task]:
        return [t for t in self._store.values() if t.status == status]

    def find_by_project(self, project_name: str) -> Iterable[Task]:
        return [t for t in self._store.values() if t.project_name == project_name]

    def find_by_assigned_user(self, user_id: UUID) -> Iterable[Task]:
        return [t for t in self._store.values() if t.assigned_users and user_id in t.assigned_users]

    def find_by_priority(self, priority: str) -> Iterable[Task]:
        return [t for t in self._store.values() if t.priority == priority]

    def find_overdue_tasks(self) -> Iterable[Task]:
        now = datetime.now()
        return [t for t in self._store.values() if t.due_date and t.due_date < now and t.status != 'completed']

    def find_by_criteria(self, filters: Dict[str, Any]) -> Iterable[Task]:
        results = list(self._store.values())
        if 'status' in filters:
            results = [t for t in results if t.status == filters['status']]
        if 'project_name' in filters:
            results = [t for t in results if t.project_name == filters['project_name']]
        if 'priority' in filters:
            results = [t for t in results if t.priority == filters['priority']]
        if 'assigned_user' in filters:
            results = [t for t in results if t.assigned_users and filters['assigned_user'] in t.assigned_users]
        return results


@pytest.mark.unit
def test_create_task_defaults():
    service = TaskService(InMemoryRepo())
    task = service.create_task({
        'title': 'Test Task'
    })

    assert task.id == 1
    assert task.title == 'Test Task'
    assert task.status == 'pending'
    assert task.description == ''
    assert task.start_date is not None
    assert task.due_date is not None


@pytest.mark.unit
def test_mark_completed_sets_completed_date():
    service = TaskService(InMemoryRepo())
    t = service.create_task({'title': 'Finish', 'status': 'in_progress'})

    updated = service.mark_task_completed(t.id)
    assert updated.status == 'completed'
    assert updated.completed_date is not None


@pytest.mark.unit
def test_assign_and_remove_users():
    service = TaskService(InMemoryRepo())
    t = service.create_task({'title': 'Assign Test'})
    u1, u2 = uuid4(), uuid4()

    updated = service.assign_users_to_task(t.id, [u1, u2])
    assert set(updated.assigned_users) == {u1, u2}

    updated2 = service.remove_user_from_task(t.id, u1)
    assert set(updated2.assigned_users) == {u2}


