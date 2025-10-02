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
            results = [t for t in results if t.project_name ==
                       filters['project_name']]
        if 'priority' in filters:
            results = [t for t in results if t.priority == filters['priority']]
        if 'assigned_user' in filters:
            results = [
                t for t in results if t.assigned_users and filters['assigned_user'] in t.assigned_users]
        if 'parent_id' in filters:
            results = [t for t in results if t.parent_id ==
                       filters['parent_id']]
        return results

    def find_by_parent(self, parent_id: int) -> Iterable[Task]:
        return [t for t in self._store.values() if t.parent_id == parent_id]

    def find_root_tasks(self) -> Iterable[Task]:
        return [t for t in self._store.values() if t.parent_id is None]


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


@pytest.mark.unit
def test_create_task_with_parent():
    service = TaskService(InMemoryRepo())
    parent = service.create_task({'title': 'Parent Task'})
    subtask = service.create_task({'title': 'Subtask', 'parent_id': parent.id})

    assert subtask.parent_id == parent.id
    assert subtask.title == 'Subtask'


@pytest.mark.unit
def test_create_task_with_invalid_parent():
    from exceptions import TaskValidationError
    service = TaskService(InMemoryRepo())

    with pytest.raises(TaskValidationError, match="Parent task with id 999 not found"):
        service.create_task({'title': 'Orphan Task', 'parent_id': 999})


@pytest.mark.unit
def test_update_task_parent():
    service = TaskService(InMemoryRepo())
    parent = service.create_task({'title': 'Parent Task'})
    task = service.create_task({'title': 'Task'})

    updated = service.update_task(task.id, {'parent_id': parent.id})
    assert updated.parent_id == parent.id


@pytest.mark.unit
def test_update_task_cannot_be_own_parent():
    from exceptions import TaskValidationError
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task'})

    with pytest.raises(TaskValidationError, match="A task cannot be its own parent"):
        service.update_task(task.id, {'parent_id': task.id})


@pytest.mark.unit
def test_get_subtasks():
    service = TaskService(InMemoryRepo())
    parent = service.create_task({'title': 'Parent Task'})
    subtask1 = service.create_task(
        {'title': 'Subtask 1', 'parent_id': parent.id})
    subtask2 = service.create_task(
        {'title': 'Subtask 2', 'parent_id': parent.id})
    other_task = service.create_task({'title': 'Other Task'})

    subtasks = list(service.get_subtasks(parent.id))
    assert len(subtasks) == 2
    assert subtask1 in subtasks
    assert subtask2 in subtasks
    assert other_task not in subtasks


@pytest.mark.unit
def test_get_subtasks_invalid_parent():
    from exceptions import TaskNotFoundError
    service = TaskService(InMemoryRepo())

    with pytest.raises(TaskNotFoundError, match="Parent task with id 999 not found"):
        service.get_subtasks(999)


@pytest.mark.unit
def test_get_root_tasks():
    service = TaskService(InMemoryRepo())
    root1 = service.create_task({'title': 'Root Task 1'})
    root2 = service.create_task({'title': 'Root Task 2'})
    parent = service.create_task({'title': 'Parent Task'})
    subtask = service.create_task({'title': 'Subtask', 'parent_id': parent.id})

    root_tasks = list(service.get_root_tasks())
    assert len(root_tasks) == 3
    assert root1 in root_tasks
    assert root2 in root_tasks
    assert parent in root_tasks
    assert subtask not in root_tasks


@pytest.mark.unit
def test_search_tasks_by_parent_id():
    service = TaskService(InMemoryRepo())
    parent = service.create_task({'title': 'Parent Task'})
    subtask1 = service.create_task(
        {'title': 'Subtask 1', 'parent_id': parent.id})
    subtask2 = service.create_task(
        {'title': 'Subtask 2', 'parent_id': parent.id})
    other_task = service.create_task({'title': 'Other Task'})

    results = list(service.search_tasks({'parent_id': parent.id}))
    assert len(results) == 2
    assert subtask1 in results
    assert subtask2 in results
    assert other_task not in results
