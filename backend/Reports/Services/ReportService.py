from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
from Repositories.ReportRepository import ReportRepository
from Models.Report import ReportMetadata, ReportData
from exceptions import ReportValidationError

class ReportService:
    """Service for generating various types of reports"""
    
    def __init__(self, repo: ReportRepository):
        self.repo = repo
    
    def generate_task_completion_report(self, user: Optional[str] = None) -> ReportData:
        """Generate comprehensive task completion/status report"""
        report_id = str(uuid4())
        
        # Get all tasks and statistics
        tasks = self.repo.get_all_tasks()
        stats = self.repo.get_task_statistics()
        
        # Calculate completion metrics
        total = stats["total_tasks"]
        completed = stats["by_status"].get("completed", 0)
        in_progress = stats["by_status"].get("in_progress", 0)
        blocked = stats["by_status"].get("blocked", 0)
        pending = stats["by_status"].get("pending", 0)
        
        # Prepare task details
        task_details = [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "priority": task.priority,
                "project_name": task.project_name,
                "start_date": task.start_date.isoformat() if task.start_date else None,
                "completed_date": task.completed_date.isoformat() if task.completed_date else None,
                "due_date": task.due_date.isoformat() if task.due_date else None
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
            "completed": completed,
            "in_progress": in_progress,
            "blocked": blocked,
            "pending": pending,
            "completion_rate": round((completed / total * 100), 1) if total > 0 else 0,
            "by_priority": stats["by_priority"]
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
    
    def list_available_reports(self) -> List[Dict[str, Any]]:
        """List all available report types"""
        return [
            {
                "id": "task_completion_status",
                "title": "Task Completion/Status Report",
                "description": "Comprehensive overview of task completion rates, status distribution, and progress tracking.",
                "category": "Task Management"
            },
            {
                "id": "project_performance",
                "title": "Project Performance Analytics",
                "description": "Detailed analysis of project performance metrics including completion rates and team efficiency.",
                "category": "Project Analytics"
            },
            {
                "id": "team_productivity",
                "title": "Team Productivity Report",
                "description": "In-depth productivity analysis covering individual and team performance metrics.",
                "category": "Team Analytics"
            }
        ]
