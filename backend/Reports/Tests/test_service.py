from datetime import datetime, timedelta
from typing import Iterable, Optional, Dict, Any, List
from uuid import UUID, uuid4
import pytest

from Services.ReportService import ReportService
from Repositories.ReportRepository import ReportRepository
from Tasks.Models.Task import Task


class InMemoryTaskRepo:
    """In-memory repository for testing report service."""
    
    def __init__(self):
        self._store: Dict[int, Task] = {}
        self._next_id = 1

    def get_all_tasks(self) -> List[Task]:
        """Get all tasks for report generation"""
        return list(self._store.values())

    def get_task_statistics(self) -> Dict[str, Any]:
        """Get aggregated task statistics"""
        total_tasks = len(self._store)
        
        # Count by status (with correct capitalization)
        status_counts = {}
        priority_counts = {}
        
        for task in self._store.values():
            # Count by status
            status = task.status
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Count by priority
            priority = task.priority
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
        
        return {
            "total_tasks": total_tasks,
            "by_status": status_counts,
            "by_priority": priority_counts
        }

    def get_project_statistics(self) -> List[Dict[str, Any]]:
        """Get statistics grouped by project"""
        project_map = {}
        
        for task in self._store.values():
            project = task.project_name
            if project not in project_map:
                project_map[project] = {
                    "project_name": project,
                    "total_tasks": 0,
                    "completed": 0,
                    "in_progress": 0,
                    "to_do": 0,
                    "blocked": 0
                }
            
            project_map[project]["total_tasks"] += 1
            
            if task.status == "Completed":
                project_map[project]["completed"] += 1
            elif task.status == "In Progress":
                project_map[project]["in_progress"] += 1
            elif task.status == "To Do":
                project_map[project]["to_do"] += 1
            elif task.status == "Blocked":
                project_map[project]["blocked"] += 1
        
        # Calculate completion rates
        for project_data in project_map.values():
            total = project_data["total_tasks"]
            completed = project_data["completed"]
            project_data["completion_rate"] = round((completed / total * 100), 1) if total > 0 else 0
        
        return list(project_map.values())

    def get_user_productivity(self) -> List[Dict[str, Any]]:
        """Get productivity statistics by user"""
        user_stats = {}
        
        for task in self._store.values():
            if task.assigned_users:
                for user_id in task.assigned_users:
                    user_id_str = str(user_id)
                    
                    if user_id_str not in user_stats:
                        user_stats[user_id_str] = {
                            "user_id": user_id_str,
                            "total_tasks": 0,
                            "completed": 0,
                            "in_progress": 0
                        }
                    
                    user_stats[user_id_str]["total_tasks"] += 1
                    
                    if task.status == "Completed":
                        user_stats[user_id_str]["completed"] += 1
                    elif task.status == "In Progress":
                        user_stats[user_id_str]["in_progress"] += 1
        
        # Calculate completion rates
        for stats in user_stats.values():
            total = stats["total_tasks"]
            stats["completion_rate"] = round((stats["completed"] / total * 100), 1) if total > 0 else 0
        
        return list(user_stats.values())

    def create(self, task_data: Dict[str, Any]) -> Task:
        """Create a task in memory"""
        task = Task(**task_data)
        task.id = self._next_id
        self._next_id += 1
        self._store[task.id] = task
        return task


# Test Fixtures
@pytest.fixture
def report_service():
    """Create a report service with in-memory repository."""
    return ReportService(InMemoryTaskRepo())


@pytest.fixture
def sample_tasks(report_service):
    """Create sample tasks for testing with correct status capitalization."""
    user1 = uuid4()
    user2 = uuid4()
    
    tasks = [
        # Completed tasks
        report_service.repo.create({
            'title': 'Completed Task 1',
            'status': 'Completed',  # Capitalized
            'priority': 'High',
            'project_name': 'Project A',
            'assigned_users': [user1],
            'completed_date': datetime.now() - timedelta(days=1)
        }),
        report_service.repo.create({
            'title': 'Completed Task 2',
            'status': 'Completed',  # Capitalized
            'priority': 'Medium',
            'project_name': 'Project B',
            'assigned_users': [user2],
            'completed_date': datetime.now() - timedelta(days=2)
        }),
        # In Progress tasks
        report_service.repo.create({
            'title': 'In Progress Task 1',
            'status': 'In Progress',  # Capitalized with space
            'priority': 'High',
            'project_name': 'Project A',
            'assigned_users': [user1]
        }),
        report_service.repo.create({
            'title': 'In Progress Task 2',
            'status': 'In Progress',  # Capitalized with space
            'priority': 'Low',
            'project_name': 'Project C',
            'assigned_users': [user2]
        }),
        # To Do tasks
        report_service.repo.create({
            'title': 'To Do Task 1',
            'status': 'To Do',  # Capitalized with space
            'priority': 'Medium',
            'project_name': 'Project A',
            'assigned_users': [user1]
        }),
        # Blocked task
        report_service.repo.create({
            'title': 'Blocked Task',
            'status': 'Blocked',  # Capitalized
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
    assert hasattr(report, 'summary')
    assert report.summary['total_tasks'] == 6
    assert report.summary['completed_tasks'] == 2
    assert report.summary['in_progress_tasks'] == 2
    assert report.summary['to_do_tasks'] == 1
    assert report.summary['blocked_tasks'] == 1
    assert report.summary['completion_rate'] == pytest.approx(33.3, 0.1)


@pytest.mark.unit
def test_generate_project_performance_report(report_service, sample_tasks):
    """Test generating project performance analytics report."""
    tasks, user1, user2 = sample_tasks
    
    report = report_service.generate_project_performance_report()
    
    assert report is not None
    assert 'projects' in report.data
    assert len(report.data['projects']) == 3  # Project A, B, C
    
    # Check Project A
    project_a = next((p for p in report.data['projects'] if p['project_name'] == 'Project A'), None)
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
    assert 'team_members' in report.data
    assert len(report.data['team_members']) >= 2
    
    # Check user1's productivity
    user1_data = next((u for u in report.data['team_members'] if u['user_id'] == str(user1)), None)
    assert user1_data is not None
    assert user1_data['total_tasks'] == 4  # Assigned to 4 tasks
    assert user1_data['completed'] == 1


@pytest.mark.unit
def test_list_available_reports(report_service):
    """Test listing all available report types."""
    reports = report_service.list_available_reports()
    
    assert isinstance(reports, list)
    assert len(reports) == 3
    assert any(r['id'] == 'task-completion-status' for r in reports)
    assert any(r['id'] == 'project-performance' for r in reports)
    assert any(r['id'] == 'team-productivity' for r in reports)


@pytest.mark.unit
def test_get_reports_summary(report_service, sample_tasks):
    """Test getting high-level reports summary."""
    tasks, _, _ = sample_tasks
    
    summary = report_service.get_reports_summary()
    
    assert 'total_tasks' in summary
    assert 'completion_rate' in summary
    assert 'total_projects' in summary
    assert 'total_team_members' in summary
    assert summary['total_tasks'] == 6
    assert summary['completion_rate'] == pytest.approx(33.3, 0.1)


@pytest.mark.unit
def test_empty_report_generation(report_service):
    """Test report generation with no tasks."""
    # Empty repository
    report = report_service.generate_task_completion_report()
    
    assert report is not None
    assert report.summary['total_tasks'] == 0
    assert report.summary['completion_rate'] == 0.0


@pytest.mark.unit
def test_report_metadata_structure(report_service, sample_tasks):
    """Test that report metadata has correct structure."""
    tasks, _, _ = sample_tasks
    
    report = report_service.generate_task_completion_report(user="test@example.com")
    
    assert report.metadata.report_id is not None
    assert report.metadata.report_type == "task_completion_status"
    assert report.metadata.generated_by == "test@example.com"
    assert isinstance(report.metadata.generated_at, datetime)
