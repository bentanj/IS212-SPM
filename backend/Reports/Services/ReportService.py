from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
from Repositories.ReportRepository import ReportRepository
from Models.Report import ReportMetadata, ReportData
from exceptions import ReportValidationError


class ReportService:
    """Service for generating various types of reports"""

    def __init__(self):
        self.repo = ReportRepository()  # No session parameter


    def generate_task_completion_report(self, user: Optional[str] = None) -> ReportData:
        """Generate comprehensive task completion/status report"""
        report_id = str(uuid4())

        # Get all tasks and statistics
        tasks = self.repo.get_all_tasks()
        stats = self.repo.get_task_statistics()

        # Calculate completion metrics (matching frontend status names)
        total = stats["total_tasks"]
        completed = stats["by_status"].get("Completed", 0)
        in_progress = stats["by_status"].get("In Progress", 0)
        blocked = stats["by_status"].get("Blocked", 0)
        to_do = stats["by_status"].get("To Do", 0)

        # Prepare task details with all fields frontend needs
        task_details = [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "priority": task.priority,
                "projectName": task.project_name,
                "startDate": task.start_date.isoformat() if task.start_date else None,
                "completedDate": task.completed_date.isoformat() if task.completed_date else None,
                "dueDate": task.due_date.isoformat() if task.due_date else None,
                "description": task.description,
                "assignedUsers": self._format_assigned_users(task),
            }
            for task in tasks
        ]

        # Create metadata
        metadata = ReportMetadata(
            report_id=report_id,
            report_type="task_completion_status",
            generated_at=datetime.now(),
            generated_by=user,
            parameters={}
        )

        # Create summary
        summary = {
            "total_tasks": total,
            "completed_tasks": completed,
            "in_progress_tasks": in_progress,
            "blocked_tasks": blocked,
            "to_do_tasks": to_do,
            "completion_rate": round((completed / total * 100), 1) if total > 0 else 0,
            "by_priority": stats["by_priority"],
            "unique_projects": len(set(task.project_name for task in tasks)),
            "unique_departments": self._count_unique_departments(tasks)
        }

        # Return report data
        return ReportData(
            metadata=metadata,
            data={"tasks": task_details},
            summary=summary
        )

    def generate_project_performance_report(self, user: Optional[str] = None) -> ReportData:
        """Generate project performance analytics report"""
        report_id = str(uuid4())

        # Get project statistics
        project_stats = self.repo.get_project_statistics()

        # Enhance with "To Do" status
        for project in project_stats:
            project["to_do"] = project.get("to_do", 0)

        # Create metadata
        metadata = ReportMetadata(
            report_id=report_id,
            report_type="project_performance",
            generated_at=datetime.now(),
            generated_by=user,
            parameters={}
        )

        # Calculate summary metrics
        total_projects = len(project_stats)
        total_tasks = sum(p["total_tasks"] for p in project_stats)
        total_completed = sum(p["completed"] for p in project_stats)
        avg_completion_rate = round(
            sum(p["completion_rate"] for p in project_stats) / total_projects, 1
        ) if total_projects > 0 else 0

        summary = {
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "total_completed": total_completed,
            "average_completion_rate": avg_completion_rate
        }

        return ReportData(
            metadata=metadata,
            data={"projects": project_stats},
            summary=summary
        )

    def generate_team_productivity_report(self, user: Optional[str] = None) -> ReportData:
        """Generate team productivity report"""
        report_id = str(uuid4())

        # Get user productivity statistics
        user_stats = self.repo.get_user_productivity()

        # Create metadata
        metadata = ReportMetadata(
            report_id=report_id,
            report_type="team_productivity",
            generated_at=datetime.now(),
            generated_by=user,
            parameters={}
        )

        # Calculate summary metrics
        total_users = len(user_stats)
        total_tasks = sum(u["total_tasks"] for u in user_stats)
        total_completed = sum(u["completed"] for u in user_stats)
        avg_completion_rate = round(
            sum(u["completion_rate"] for u in user_stats) / total_users, 1
        ) if total_users > 0 else 0

        summary = {
            "total_team_members": total_users,
            "total_tasks_assigned": total_tasks,
            "total_completed": total_completed,
            "average_completion_rate": avg_completion_rate
        }

        return ReportData(
            metadata=metadata,
            data={"team_members": user_stats},
            summary=summary
        )

    def get_reports_summary(self) -> Dict[str, Any]:
        """Get high-level summary for dashboard"""
        stats = self.repo.get_task_statistics()
        total = stats["total_tasks"]
        completed = stats["by_status"].get("Completed", 0)

        return {
            "total_tasks": total,
            "completion_rate": round((completed / total * 100), 1) if total > 0 else 0,
            "total_projects": len(self.repo.get_project_statistics()),
            "total_team_members": len(self.repo.get_user_productivity()),
            "generated_at": datetime.now().isoformat()
        }

    def list_available_reports(self) -> List[Dict[str, Any]]:
        """List all available report types"""
        return [
            {
                "id": "task-completion-status",
                "title": "Task Completion/Status Report",
                "description": "Comprehensive overview of task completion rates, status distribution, and progress tracking.",
                "category": "Task Management",
                "estimatedTime": "2-3 minutes"
            },
            {
                "id": "project-performance",
                "title": "Project Performance Analytics",
                "description": "Detailed analysis of project performance metrics including completion rates and team efficiency.",
                "category": "Project Analytics",
                "estimatedTime": "3-4 minutes"
            },
            {
                "id": "team-productivity",
                "title": "Team Productivity Report",
                "description": "In-depth productivity analysis covering individual and team performance metrics.",
                "category": "Team Analytics",
                "estimatedTime": "2-3 minutes"
            }
        ]

    def _format_assigned_users(self, task) -> List[Dict[str, Any]]:
        """Format assigned users with full details"""
        if not task.assigned_users:
            return []
        
        # This assumes you have a User model/table to join
        # Adjust based on your actual schema
        return [
            {
                "id": str(user_id),
                "name": "User Name",  # Fetch from User table
                "department": "Department",  # Fetch from User table
                "role": "Role"  # Fetch from User table
            }
            for user_id in task.assigned_users
        ]

    def _count_unique_departments(self, tasks) -> int:
        """Count unique departments from tasks"""
        departments = set()
        for task in tasks:
            if task.assigned_users:
                # Fetch departments from User table for each assigned user
                # This is a placeholder - adjust based on your schema
                pass
        return len(departments)
