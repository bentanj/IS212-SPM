from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
from Repositories.ReportRepository import ReportRepository
from Models.Report import ReportMetadata, ReportData
from exceptions import ReportValidationError
import logging

logger = logging.getLogger(__name__)

class ReportService:
    """Service for generating various types of reports"""
    
    def __init__(self):
        self.repo = ReportRepository()
        logger.info("ReportService initialized successfully")
    
    def generate_task_completion_report(self, user: Optional[str] = None) -> ReportData:
        """Generate comprehensive task completion/status report"""
        try:
            logger.info("Starting task completion report generation...")
            report_id = str(uuid4())
            
            # Get all tasks and statistics
            tasks = self.repo.get_all_tasks()
            stats = self.repo.get_task_statistics()
            
            # Calculate completion metrics
            total = stats["total_tasks"]
            completed = stats["by_status"].get("Completed", 0)
            in_progress = stats["by_status"].get("In Progress", 0)
            blocked = stats["by_status"].get("Blocked", 0)
            to_do = stats["by_status"].get("To Do", 0)
            
            # Get unique projects
            unique_projects = len(set(
                task.get("project_name") or task.get("projectName") or "No Project" 
                for task in tasks
            ))
            
            # Prepare tasks list for frontend
            tasks_data = []
            for task in tasks:
                # Extract and format assigned users properly
                assigned_users = task.get("assigned_users") or task.get("assignedUsers") or []
                assigned_users_formatted = []
                
                if isinstance(assigned_users, list):
                    for user_data in assigned_users:
                        # Handle both user object and user ID formats
                        if isinstance(user_data, dict):
                            # User is a full object from database
                            assigned_users_formatted.append({
                                "id": str(user_data.get("userId") or user_data.get("user_id", "")),
                                "name": user_data.get("name", "Unknown User"),
                                "department": user_data.get("department", "N/A"),
                                "role": user_data.get("role", "N/A")
                            })
                        elif isinstance(user_data, (int, str)):
                            # User is just an ID
                            assigned_users_formatted.append({
                                "id": str(user_data),
                                "name": f"User {user_data}",
                                "department": "N/A",
                                "role": "N/A"
                            })
                
                tasks_data.append({
                    "id": task.get("task_id") or task.get("id"),
                    "title": task.get("title"),
                    "status": task.get("status"),
                    "priority": task.get("priority"),
                    "projectName": task.get("project_name") or task.get("projectName"),
                    "assignedUsers": assigned_users_formatted,
                    "dueDate": task.get("due_date") or task.get("dueDate"),
                    "completedDate": task.get("completed_date") or task.get("completedDate")
                })
            
            # Create metadata
            metadata = ReportMetadata(
                report_id=report_id,
                report_type="task_completion",
                generated_at=datetime.utcnow(),
                generated_by=user or "system",
                parameters={}
            )
            
            # Summary with correct field names for frontend
            summary = {
                "total_tasks": total,
                "completed_tasks": completed,
                "in_progress_tasks": in_progress,
                "blocked_tasks": blocked,
                "to_do_tasks": to_do,
                "completion_rate": round((completed / total * 100), 1) if total > 0 else 0.0,
                "unique_projects": unique_projects,
                "unique_departments": 5,  # TODO: Calculate actual departments
                "by_priority": stats["by_priority"]
            }
            
            logger.info(f"Task completion report generated successfully. Total tasks: {total}")
            return ReportData(
                metadata=metadata,
                summary=summary,
                data={"tasks": tasks_data}
            )
        except Exception as e:
            logger.error(f"Error generating task completion report: {str(e)}", exc_info=True)
            raise
    
    def generate_project_performance_report(self) -> ReportData:
        """Generate project performance report"""
        try:
            logger.info("Starting project performance report generation...")
            report_id = str(uuid4())
            
            projects = self.repo.get_project_statistics()
            
            metadata = ReportMetadata(
                report_id=report_id,
                report_type="project_performance",
                generated_at=datetime.utcnow(),
                generated_by="system",
                parameters={}
            )
            
            # Calculate summary
            total_projects = len(projects)
            total_tasks = sum(p["total_tasks"] for p in projects)
            total_completed = sum(p["completed"] for p in projects)
            avg_completion = sum(p["completion_rate"] for p in projects) / total_projects if total_projects > 0 else 0.0
            
            summary = {
                "total_projects": total_projects,
                "total_tasks": total_tasks,
                "total_completed": total_completed,
                "average_completion_rate": round(avg_completion, 1)
            }
            
            logger.info(f"Project performance report generated. Total projects: {total_projects}")
            return ReportData(
                metadata=metadata,
                summary=summary,
                data={"projects": projects}
            )
        except Exception as e:
            logger.error(f"Error generating project performance report: {str(e)}", exc_info=True)
            raise
    
    def generate_team_productivity_report(self) -> ReportData:
        """Generate team productivity report"""
        try:
            logger.info("Starting team productivity report generation...")
            report_id = str(uuid4())
            
            users = self.repo.get_user_productivity()
            
            metadata = ReportMetadata(
                report_id=report_id,
                report_type="team_productivity",
                generated_at=datetime.utcnow(),
                generated_by="system",
                parameters={}
            )
            
            # Calculate summary
            total_users = len(users)
            total_tasks = sum(u["total_tasks"] for u in users)
            total_completed = sum(u["completed"] for u in users)
            avg_completion = sum(u["completion_rate"] for u in users) / total_users if total_users > 0 else 0.0
            
            summary = {
                "total_team_members": total_users,
                "total_tasks_assigned": total_tasks,
                "total_completed": total_completed,
                "average_completion_rate": round(avg_completion, 1)
            }
            
            logger.info(f"Team productivity report generated. Total users: {total_users}")
            return ReportData(
                metadata=metadata,
                summary=summary,
                data={"team_members": users}
            )
        except Exception as e:
            logger.error(f"Error generating team productivity report: {str(e)}", exc_info=True)
            raise
    
    def list_available_reports(self) -> List[Dict[str, str]]:
        """List all available report types"""
        return [
            {"id": "task-completion", "name": "Task Completion Report", "description": "Overview of task completion status"},
            {"id": "project-performance", "name": "Project Performance Report", "description": "Performance metrics by project"},
            {"id": "team-productivity", "name": "Team Productivity Report", "description": "Individual and team productivity metrics"}
        ]
    
    def get_reports_summary(self) -> Dict[str, Any]:
        """Get high-level summary for all reports"""
        try:
            logger.info("Getting reports summary...")
            stats = self.repo.get_task_statistics()
            projects = self.repo.get_project_statistics()
            users = self.repo.get_user_productivity()
            
            return {
                "total_tasks": stats["total_tasks"],
                "total_projects": len(projects),
                "total_users": len(users),
                "completion_rate": round(
                    (stats["by_status"].get("Completed", 0) / stats["total_tasks"] * 100), 1
                ) if stats["total_tasks"] > 0 else 0.0
            }
        except Exception as e:
            logger.error(f"Error getting reports summary: {str(e)}", exc_info=True)
            raise
