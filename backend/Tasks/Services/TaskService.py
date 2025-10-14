from typing import Iterable, Optional, Dict, Any, List
from datetime import datetime
from Repositories.TaskRepository import TaskRepository
from Models.Task import Task
from exceptions import TaskNotFoundError, TaskValidationError, InvalidTaskStatusError

# Maximum number of users that can be assigned to a single task
MAX_ASSIGNED_USERS = 5

class TaskService:
    def __init__(self, repo: TaskRepository):
        self.repo = repo

    def list_tasks(self) -> Iterable[Task]:
        return self.repo.list()

    def get_task_by_id(self, task_id: int) -> Task:
        task = self.repo.get(task_id)
        if not task:
            raise TaskNotFoundError(f"Task with id {task_id} not found")
        return task

    def create_task(self, task_data: Dict[str, Any]) -> Task:
        self._validate_task_data(task_data)

        # Validate parent_id if provided
        if 'parent_id' in task_data and task_data['parent_id'] is not None:
            parent_task = self.repo.get(task_data['parent_id'])
            if not parent_task:
                raise TaskValidationError(f"Parent task with id {task_data['parent_id']} not found")

        if 'start_date' not in task_data or task_data['start_date'] is None:
            task_data['start_date'] = datetime.now()

        if 'status' not in task_data or task_data['status'] is None:
            task_data['status'] = 'pending'

        if 'description' not in task_data or task_data['description'] is None:
            task_data['description'] = ''

        if 'due_date' not in task_data or task_data['due_date'] is None:
            # Default to 7 days from start date
            from datetime import timedelta
            start_date = task_data['start_date']
            task_data['due_date'] = start_date + timedelta(days=7)

        if 'priority' not in task_data or task_data['priority'] is None:
            task_data['priority'] = 'medium'

        return self.repo.create(task_data)

    def update_task(self, task_id: int, task_data: Dict[str, Any]) -> Task:
        existing_task = self.repo.get(task_id)
        if not existing_task:
            raise TaskNotFoundError(f"Task with id {task_id} not found")

        self._validate_task_data(task_data, is_update=True)
        self._validate_status_transition(existing_task, task_data.get('status'))

        # Validate parent_id if being updated
        if 'parent_id' in task_data and task_data['parent_id'] is not None:
            if task_data['parent_id'] == task_id:
                raise TaskValidationError("A task cannot be its own parent")
            parent_task = self.repo.get(task_data['parent_id'])
            if not parent_task:
                raise TaskValidationError(f"Parent task with id {task_data['parent_id']} not found")

        if 'status' in task_data and task_data['status'] == 'completed':
            if not existing_task.completed_date:
                task_data['completed_date'] = datetime.now()

        updated_task = self.repo.update(task_id, task_data)
        if not updated_task:
            raise TaskNotFoundError(f"Task with id {task_id} not found")
        return updated_task

    def delete_task(self, task_id: int) -> bool:
        return self.repo.delete(task_id)

    def get_tasks_by_status(self, status: str) -> Iterable[Task]:
        return self.repo.find_by_status(status)

    def get_tasks_by_project(self, project_name: str) -> Iterable[Task]:
        return self.repo.find_by_project(project_name)

    def get_tasks_by_user(self, user_id: int) -> Iterable[Task]:
        return self.repo.find_by_assigned_user(user_id)

    def get_tasks_by_priority(self, priority: str) -> Iterable[Task]:
        return self.repo.find_by_priority(priority)

    def get_overdue_tasks(self) -> Iterable[Task]:
        return self.repo.find_overdue_tasks()

    def search_tasks(self, filters: Dict[str, Any]) -> Iterable[Task]:
        return self.repo.find_by_criteria(filters)

    def get_subtasks(self, parent_id: int) -> Iterable[Task]:
        parent_task = self.repo.get(parent_id)
        if not parent_task:
            raise TaskNotFoundError(f"Parent task with id {parent_id} not found")
        return self.repo.find_by_parent(parent_id)

    def get_root_tasks(self) -> Iterable[Task]:
        return self.repo.find_root_tasks()

    def mark_task_completed(self, task_id: int) -> Optional[Task]:
        return self.update_task(task_id, {
            'status': 'completed',
            'completed_date': datetime.now()
        })

    def assign_users_to_task(self, task_id: int, user_ids: List[int]) -> Optional[Task]:
        return self.update_task(task_id, {'assigned_users': user_ids})

    def add_user_to_task(self, task_id: int, user_id: int) -> Optional[Task]:
        task = self.repo.get(task_id)
        if not task:
            return None

        current_users = task.assigned_users or []
        if user_id not in current_users:
            if len(current_users) >= MAX_ASSIGNED_USERS:
                raise TaskValidationError(f"Cannot assign more than {MAX_ASSIGNED_USERS} users to a task")
            current_users.append(user_id)
            return self.update_task(task_id, {'assigned_users': current_users})

        return task

    def remove_user_from_task(self, task_id: int, user_id: int) -> Optional[Task]:
        task = self.repo.get(task_id)
        if not task:
            return None

        current_users = task.assigned_users or []
        if user_id in current_users:
            current_users.remove(user_id)
            return self.update_task(task_id, {'assigned_users': current_users})

        return task

    def get_task_statistics(self) -> Dict[str, Any]:
        all_tasks = list(self.repo.list())

        total_tasks = len(all_tasks)
        completed_tasks = len([t for t in all_tasks if t.status == 'completed'])
        overdue_tasks = len(list(self.repo.find_overdue_tasks()))

        status_counts = {}
        priority_counts = {}

        for task in all_tasks:
            status_counts[task.status] = status_counts.get(task.status, 0) + 1
            priority_counts[task.priority] = priority_counts.get(task.priority, 0) + 1

        return {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': total_tasks - completed_tasks,
            'overdue_tasks': overdue_tasks,
            'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            'status_breakdown': status_counts,
            'priority_breakdown': priority_counts
        }

    def _validate_task_data(self, task_data: Dict[str, Any], is_update: bool = False) -> None:
        if not is_update and ('title' not in task_data or not task_data['title'].strip()):
            raise TaskValidationError("Task title is required")

        if 'priority' in task_data and task_data['priority']:
            valid_priorities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            if task_data['priority'] not in valid_priorities:
                raise TaskValidationError(f"Priority must be one of: {', '.join(map(str, valid_priorities))}")

        if 'status' in task_data and task_data['status']:
            valid_statuses = ["To Do", "In Progress", "Completed", "Blocked"]
            if task_data['status'] not in valid_statuses:
                raise TaskValidationError(f"Status must be one of: {', '.join(valid_statuses)}")

        if 'due_date' in task_data and 'start_date' in task_data:
            if (task_data['due_date'] and task_data['start_date'] and
                task_data['due_date'] < task_data['start_date']):
                raise TaskValidationError("Due date cannot be before start date")

        if 'assigned_users' in task_data and task_data['assigned_users']:
            if len(task_data['assigned_users']) > MAX_ASSIGNED_USERS:
                raise TaskValidationError(f"Cannot assign more than {MAX_ASSIGNED_USERS} users to a task")

    def _validate_status_transition(self, task: Task, new_status: Optional[str]) -> None:
        if not new_status or new_status == task.status:
            return

        valid_transitions = {
            'pending': ['in_progress', 'cancelled'],
            'in_progress': ['completed', 'pending', 'cancelled'],
            'completed': [],  # Cannot change from completed
            'cancelled': ['pending']  # Can reopen cancelled tasks
        }

        current_status = task.status or 'pending'
        if new_status not in valid_transitions.get(current_status, []):
            raise InvalidTaskStatusError(
                f"Cannot transition from '{current_status}' to '{new_status}'"
            )