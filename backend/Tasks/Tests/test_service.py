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
        if 'due_before' in filters:
            results = [t for t in results if t.due_date and t.due_date <= filters['due_before']]
        if 'due_after' in filters:
            results = [t for t in results if t.due_date and t.due_date >= filters['due_after']]
        if 'start_date_after' in filters:
            results = [t for t in results if t.start_date and t.start_date >= filters['start_date_after']]
        if 'start_date_before' in filters:
            results = [t for t in results if t.start_date and t.start_date <= filters['start_date_before']]
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


@pytest.mark.unit
def test_search_tasks_by_date_range():
    from datetime import timedelta
    service = TaskService(InMemoryRepo())

    now = datetime.now()
    past = now - timedelta(days=10)
    future = now + timedelta(days=10)

    task1 = service.create_task({'title': 'Past Task', 'due_date': past})
    task2 = service.create_task({'title': 'Future Task', 'due_date': future})
    task3 = service.create_task({'title': 'Now Task', 'due_date': now})

    # Filter due_before
    results = list(service.search_tasks({'due_before': now}))
    assert task1 in results
    assert task3 in results
    assert task2 not in results

    # Filter due_after
    results = list(service.search_tasks({'due_after': now}))
    assert task2 in results
    assert task3 in results
    assert task1 not in results


@pytest.mark.unit
def test_search_tasks_by_multiple_filters():
    service = TaskService(InMemoryRepo())

    task1 = service.create_task({'title': 'Task 1', 'status': 'pending', 'priority': 'high', 'project_name': 'SPM'})
    task2 = service.create_task({'title': 'Task 2', 'status': 'pending', 'priority': 'low', 'project_name': 'SPM'})
    task3 = service.create_task({'title': 'Task 3', 'status': 'completed', 'priority': 'high', 'project_name': 'Other'})

    results = list(service.search_tasks({
        'status': 'pending',
        'priority': 'high',
        'project_name': 'SPM'
    }))

    assert len(results) == 1
    assert task1 in results
    assert task2 not in results
    assert task3 not in results


@pytest.mark.unit
def test_search_tasks_with_null_dates():
    service = TaskService(InMemoryRepo())
    from datetime import timedelta

    now = datetime.now()
    task_with_date = service.create_task({'title': 'Has date', 'due_date': now})
    # Explicitly create task with null due_date by updating after creation
    task_without_date = service.create_task({'title': 'No date'})
    task_without_date.due_date = None

    # Tasks with null dates should be excluded from date filters
    results = list(service.search_tasks({'due_before': now + timedelta(days=1)}))
    assert task_with_date in results
    assert task_without_date not in results

    results = list(service.search_tasks({'due_after': now - timedelta(days=1)}))
    assert task_with_date in results
    assert task_without_date not in results


@pytest.mark.unit
def test_search_tasks_exact_date_boundary():
    service = TaskService(InMemoryRepo())

    exact_time = datetime(2025, 10, 15, 12, 0, 0)
    task = service.create_task({'title': 'Exact Task', 'due_date': exact_time})

    # Test exact boundary with due_before (uses <=)
    results = list(service.search_tasks({'due_before': exact_time}))
    assert task in results

    # Test exact boundary with due_after (uses >=)
    results = list(service.search_tasks({'due_after': exact_time}))
    assert task in results


@pytest.mark.unit
def test_search_tasks_empty_filters():
    service = TaskService(InMemoryRepo())
    task1 = service.create_task({'title': 'Task 1'})
    task2 = service.create_task({'title': 'Task 2'})

    # Empty filters should return all tasks
    results = list(service.search_tasks({}))
    assert len(results) == 2
    assert task1 in results
    assert task2 in results


@pytest.mark.unit
def test_search_tasks_no_results():
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task', 'status': 'pending'})

    # Filter that matches nothing
    results = list(service.search_tasks({'status': 'nonexistent_status'}))
    assert len(results) == 0


@pytest.mark.unit
def test_search_tasks_combined_date_and_status():
    from datetime import timedelta
    service = TaskService(InMemoryRepo())

    now = datetime.now()
    future = now + timedelta(days=5)

    task1 = service.create_task({'title': 'Pending Future', 'status': 'pending', 'due_date': future})
    task2 = service.create_task({'title': 'Completed Future', 'status': 'completed', 'due_date': future})
    task3 = service.create_task({'title': 'Pending Past', 'status': 'pending', 'due_date': now - timedelta(days=1)})

    # Combined filters: pending AND due in future
    results = list(service.search_tasks({
        'status': 'pending',
        'due_after': now
    }))

    assert len(results) == 1
    assert task1 in results
    assert task2 not in results
    assert task3 not in results


@pytest.mark.unit
def test_parent_id_filter_with_zero():
    service = TaskService(InMemoryRepo())
    # parent_id=0 is technically valid but shouldn't match anything
    task = service.create_task({'title': 'Task'})

    results = list(service.search_tasks({'parent_id': 0}))
    assert len(results) == 0


@pytest.mark.unit
def test_search_tasks_case_sensitivity():
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task', 'project_name': 'SPM', 'status': 'pending'})

    # Test case sensitivity for project_name
    results = list(service.search_tasks({'project_name': 'SPM'}))
    assert len(results) == 1

    results = list(service.search_tasks({'project_name': 'spm'}))
    assert len(results) == 0  # Case-sensitive, should not match

    # Test case sensitivity for status
    results = list(service.search_tasks({'status': 'PENDING'}))
    assert len(results) == 0  # Case-sensitive, should not match


@pytest.mark.unit
def test_start_date_filters():
    from datetime import timedelta
    service = TaskService(InMemoryRepo())

    now = datetime.now()
    past = now - timedelta(days=5)
    future = now + timedelta(days=5)

    task1 = service.create_task({'title': 'Past Start', 'start_date': past})
    task2 = service.create_task({'title': 'Future Start', 'start_date': future})
    task3 = service.create_task({'title': 'Now Start', 'start_date': now})

    # Filter start_date_before
    results = list(service.search_tasks({'start_date_before': now}))
    assert task1 in results
    assert task3 in results
    assert task2 not in results

    # Filter start_date_after
    results = list(service.search_tasks({'start_date_after': now}))
    assert task2 in results
    assert task3 in results
    assert task1 not in results


@pytest.mark.unit
def test_date_range_inclusive():
    from datetime import timedelta
    service = TaskService(InMemoryRepo())

    start = datetime(2025, 10, 1, 0, 0, 0)
    end = datetime(2025, 10, 31, 23, 59, 59)

    task_before = service.create_task({'title': 'Before', 'due_date': start - timedelta(days=1)})
    task_start = service.create_task({'title': 'Start', 'due_date': start})
    task_middle = service.create_task({'title': 'Middle', 'due_date': datetime(2025, 10, 15, 12, 0, 0)})
    task_end = service.create_task({'title': 'End', 'due_date': end})
    task_after = service.create_task({'title': 'After', 'due_date': end + timedelta(days=1)})

    # Test inclusive range
    results = list(service.search_tasks({
        'due_after': start,
        'due_before': end
    }))

    assert task_before not in results
    assert task_start in results
    assert task_middle in results
    assert task_end in results
    assert task_after not in results


@pytest.mark.unit
def test_create_task_with_4_assigned_users():
    service = TaskService(InMemoryRepo())
    users = [uuid4() for _ in range(4)]

    task = service.create_task({
        'title': 'Task with 4 users',
        'assigned_users': users
    })

    assert len(task.assigned_users) == 4
    assert set(task.assigned_users) == set(users)


@pytest.mark.unit
def test_create_task_with_5_assigned_users():
    service = TaskService(InMemoryRepo())
    users = [uuid4() for _ in range(5)]

    task = service.create_task({
        'title': 'Task with 5 users',
        'assigned_users': users
    })

    assert len(task.assigned_users) == 5
    assert set(task.assigned_users) == set(users)


@pytest.mark.unit
def test_create_task_with_6_assigned_users_fails():
    from exceptions import TaskValidationError
    service = TaskService(InMemoryRepo())
    users = [uuid4() for _ in range(6)]

    with pytest.raises(TaskValidationError, match="Cannot assign more than 5 users to a task"):
        service.create_task({
            'title': 'Task with 6 users',
            'assigned_users': users
        })


@pytest.mark.unit
def test_update_task_with_6_assigned_users_fails():
    from exceptions import TaskValidationError
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task'})
    users = [uuid4() for _ in range(6)]

    with pytest.raises(TaskValidationError, match="Cannot assign more than 5 users to a task"):
        service.update_task(task.id, {'assigned_users': users})


@pytest.mark.unit
def test_assign_users_to_task_with_5_users():
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task'})
    users = [uuid4() for _ in range(5)]

    updated = service.assign_users_to_task(task.id, users)

    assert len(updated.assigned_users) == 5
    assert set(updated.assigned_users) == set(users)


@pytest.mark.unit
def test_assign_users_to_task_with_6_users_fails():
    from exceptions import TaskValidationError
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task'})
    users = [uuid4() for _ in range(6)]

    with pytest.raises(TaskValidationError, match="Cannot assign more than 5 users to a task"):
        service.assign_users_to_task(task.id, users)


@pytest.mark.unit
def test_add_user_to_task_up_to_5_users():
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task'})
    users = [uuid4() for _ in range(5)]

    # Add 5 users one by one
    for user in users:
        task = service.add_user_to_task(task.id, user)

    assert len(task.assigned_users) == 5
    assert set(task.assigned_users) == set(users)


@pytest.mark.unit
def test_add_user_to_task_exceeding_5_users_fails():
    from exceptions import TaskValidationError
    service = TaskService(InMemoryRepo())
    task = service.create_task({'title': 'Task'})
    users = [uuid4() for _ in range(6)]

    # Add 5 users successfully
    for user in users[:5]:
        task = service.add_user_to_task(task.id, user)

    assert len(task.assigned_users) == 5

    # Adding 6th user should fail
    with pytest.raises(TaskValidationError, match="Cannot assign more than 5 users to a task"):
        service.add_user_to_task(task.id, users[5])
