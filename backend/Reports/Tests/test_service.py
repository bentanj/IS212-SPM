from datetime import datetime, timedelta
from typing import Iterable, Optional, Dict, Any, List
from uuid import UUID, uuid4
import sys
import os
import pytest

# Add the parent 'backend' directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Now import from Tasks module
from Tasks.Models.Task import Task
from backend.Reports.Services.ReportService import ReportService



class InMemoryTaskRepo:
    """In-memory repository for testing report service."""
    
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
        return [t for t in self._store.values() if t.due_date and t.due_date < now and t.status != 'Completed']

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


# Test Fixtures
@pytest.fixture
def report_service():
    """Create a report service with in-memory repository."""
    return ReportService(InMemoryTaskRepo())


@pytest.fixture
def sample_tasks(report_service):
    """Create sample tasks for testing."""
    user1 = uuid4()
    user2 = uuid4()
    
    tasks = [
        # Completed tasks
        report_service.repo.create({
            'title': 'Completed Task 1',
            'status': 'Completed',
            'priority': 'High',
            'project_name': 'Project A',
            'assigned_users': [user1],
            'completed_date': datetime.now() - timedelta(days=1)
        }),
        report_service.repo.create({
            'title': 'Completed Task 2',
            'status': 'Completed',
            'priority': 'Medium',
            'project_name': 'Project B',
            'assigned_users': [user2],
            'completed_date': datetime.now() - timedelta(days=2)
        }),
        # In Progress tasks
        report_service.repo.create({
            'title': 'In Progress Task 1',
            'status': 'In Progress',
            'priority': 'High',
            'project_name': 'Project A',
            'assigned_users': [user1]
        }),
        report_service.repo.create({
            'title': 'In Progress Task 2',
            'status': 'In Progress',
            'priority': 'Low',
            'project_name': 'Project C',
            'assigned_users': [user2]
        }),
        # To Do tasks
        report_service.repo.create({
            'title': 'To Do Task 1',
            'status': 'To Do',
            'priority': 'Medium',
            'project_name': 'Project A',
            'assigned_users': [user1]
        }),
        # Blocked task
        report_service.repo.create({
            'title': 'Blocked Task',
            'status': 'Blocked',
            'priority': 'High',
            'project_name': 'Project B',
            'assigned_users': [user1, user2]
        }),
    ]
    return tasks, user1, user2


# Unit Tests
@pytest.mark.unit
def test_generate_task_completion_report(report_service, sample_tasks):
    """Test generating task completion status report."""
    tasks, user1, user2 = sample_tasks
    
    report = report_service.generate_task_completion_report()
    
    assert report is not None
    assert 'summary' in report
    assert report['summary']['total_tasks'] == 6
    assert report['summary']['completed_tasks'] == 2
    assert report['summary']['in_progress_tasks'] == 2
    assert report['summary']['to_do_tasks'] == 1
    assert report['summary']['blocked_tasks'] == 1
    assert report['summary']['completion_rate'] == pytest.approx(33.33, 0.01)


@pytest.mark.unit
def test_generate_project_performance_report(report_service, sample_tasks):
    """Test generating project performance analytics report."""
    tasks, user1, user2 = sample_tasks
    
    report = report_service.generate_project_performance_report()
    
    assert report is not None
    assert 'projects' in report
    assert len(report['projects']) == 3  # Project A, B, C
    
    # Check Project A
    project_a = next((p for p in report['projects'] if p['name'] == 'Project A'), None)
    assert project_a is not None
    assert project_a['total_tasks'] == 3
    assert project_a['completed'] == 1
    assert project_a['in_progress'] == 1
    assert project_a['to_do'] == 1


@pytest.mark.unit
def test_generate_team_productivity_report(report_service, sample_tasks):
    """Test generating team productivity report."""
    tasks, user1, user2 = sample_tasks
    
    report = report_service.generate_team_productivity_report()
    
    assert report is not None
    assert 'team_members' in report
    assert len(report['team_members']) >= 2
    
    # Check user1's productivity
    user1_data = next((u for u in report['team_members'] if u['user_id'] == str(user1)), None)
    assert user1_data is not None
    assert user1_data['total_tasks'] == 4  # Assigned to 4 tasks
    assert user1_data['completed_tasks'] == 1


@pytest.mark.unit
def test_filter_tasks_by_status(report_service, sample_tasks):
    """Test filtering tasks by status."""
    tasks, _, _ = sample_tasks
    
    completed = report_service.filter_tasks_by_status('Completed')
    assert len(list(completed)) == 2
    
    in_progress = report_service.filter_tasks_by_status('In Progress')
    assert len(list(in_progress)) == 2
    
    blocked = report_service.filter_tasks_by_status('Blocked')
    assert len(list(blocked)) == 1


@pytest.mark.unit
def test_filter_tasks_by_project(report_service, sample_tasks):
    """Test filtering tasks by project."""
    tasks, _, _ = sample_tasks
    
    project_a_tasks = report_service.filter_tasks_by_project('Project A')
    assert len(list(project_a_tasks)) == 3
    
    project_b_tasks = report_service.filter_tasks_by_project('Project B')
    assert len(list(project_b_tasks)) == 2


@pytest.mark.unit
def test_filter_tasks_by_priority(report_service, sample_tasks):
    """Test filtering tasks by priority."""
    tasks, _, _ = sample_tasks
    
    high_priority = report_service.filter_tasks_by_priority('High')
    assert len(list(high_priority)) == 3
    
    medium_priority = report_service.filter_tasks_by_priority('Medium')
    assert len(list(medium_priority)) == 2
    
    low_priority = report_service.filter_tasks_by_priority('Low')
    assert len(list(low_priority)) == 1


@pytest.mark.unit
def test_calculate_completion_rate(report_service, sample_tasks):
    """Test calculating completion rate."""
    tasks, _, _ = sample_tasks
    
    completion_rate = report_service.calculate_completion_rate()
    assert completion_rate == pytest.approx(33.33, 0.01)


@pytest.mark.unit
def test_get_overdue_tasks(report_service):
    """Test getting overdue tasks."""
    # Create overdue task
    overdue_task = report_service.repo.create({
        'title': 'Overdue Task',
        'status': 'In Progress',
        'priority': 'High',
        'project_name': 'Project X',
        'due_date': datetime.now() - timedelta(days=5)
    })
    
    overdue = list(report_service.get_overdue_tasks())
    assert len(overdue) >= 1
    assert any(t.title == 'Overdue Task' for t in overdue)


@pytest.mark.unit
def test_empty_report_generation(report_service):
    """Test report generation with no tasks."""
    # Empty repository
    report = report_service.generate_task_completion_report()
    
    assert report is not None
    assert report['summary']['total_tasks'] == 0
    assert report['summary']['completion_rate'] == 0.0


@pytest.mark.unit
def test_report_with_date_range(report_service, sample_tasks):
    """Test generating report within specific date range."""
    tasks, _, _ = sample_tasks
    
    start_date = datetime.now() - timedelta(days=7)
    end_date = datetime.now()
    
    report = report_service.generate_task_completion_report(
        start_date=start_date,
        end_date=end_date
    )
    
    assert report is not None
    assert 'date_range' in report
    assert report['date_range']['start'] == start_date.isoformat()
    assert report['date_range']['end'] == end_date.isoformat()
