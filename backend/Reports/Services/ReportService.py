# Services/ReportService.py
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
from Repositories.ReportRepository import ReportRepository
from Models.Report import ReportMetadata, ReportData
import logging

logger = logging.getLogger(__name__)

class ReportService:
    """Service for generating various types of reports with date range filtering"""

    def __init__(self):
        self.repo = ReportRepository()
        logger.info("ReportService initialized successfully")

    def _filter_tasks_by_date(
        self, 
        tasks: List[Dict[str, Any]], 
        start_date: str, 
        end_date: str
    ) -> List[Dict[str, Any]]:
        """Filter tasks by due date range"""
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            filtered_tasks = []
            for task in tasks:
                task_id = task.get('id', 'Unknown')
                due_date_str = task.get('due_date') or task.get('dueDate')
                
                if not due_date_str:
                    logger.debug(f"Task {task_id}: No due date, skipping")
                    continue
                
                try:
                    # Handle ISO format with timezone (e.g., 2025-10-01T00:00:00+00:00)
                    if 'T' in str(due_date_str):
                        # Parse ISO format and extract date only
                        due_date = datetime.fromisoformat(str(due_date_str).replace('Z', '+00:00')).date()
                    else:
                        # Simple date format
                        due_date = datetime.strptime(str(due_date_str), '%Y-%m-%d').date()
                    
                    # Check if task falls within date range
                    if start_dt <= due_date <= end_dt:
                        filtered_tasks.append(task)
                        logger.debug(f"Task {task_id}: Due {due_date} - INCLUDED")
                    else:
                        logger.debug(f"Task {task_id}: Due {due_date} - Outside range ({start_date} to {end_date})")
                        
                except (ValueError, TypeError, AttributeError) as e:
                    logger.warning(f"Task {task_id}: Could not parse due_date '{due_date_str}': {str(e)}")
                    continue
            
            logger.info(f"Filtered {len(filtered_tasks)} tasks from {len(tasks)} total tasks (range: {start_date} to {end_date})")
            return filtered_tasks
            
        except Exception as e:
            logger.error(f"Error filtering tasks by date: {str(e)}", exc_info=True)
            raise

    def generate_project_performance_report(
        self, 
        start_date: str, 
        end_date: str
    ) -> ReportData:
        """Generate project performance report (Per Project) with date filtering"""
        try:
            logger.info(f"Generating project performance report from {start_date} to {end_date}")
            report_id = str(uuid4())
            
            # Get all tasks and filter by date range
            all_tasks = self.repo.get_all_tasks()
            filtered_tasks = self._filter_tasks_by_date(all_tasks, start_date, end_date)
            
            # Generate project statistics from filtered tasks
            projects = self.repo.get_project_statistics_from_tasks(filtered_tasks)
            
            metadata = ReportMetadata(
                report_id=report_id,
                report_type="project_performance",
                generated_at=datetime.utcnow(),
                generated_by="system",
                parameters={
                    "start_date": start_date,
                    "end_date": end_date,
                    "report_subtype": "per_project",
                    "tasks_in_range": len(filtered_tasks),
                    "total_tasks": len(all_tasks)
                }
            )
            
            # Calculate summary
            total_projects = len(projects)
            total_tasks = sum(p["total_tasks"] for p in projects)
            total_completed = sum(p["completed"] for p in projects)
            avg_completion = (
                sum(p["completion_rate"] for p in projects) / total_projects 
                if total_projects > 0 else 0.0
            )
            
            summary = {
                "total_projects": total_projects,
                "total_tasks": total_tasks,
                "total_completed": total_completed,
                "average_completion_rate": round(avg_completion, 1)
            }
            
            logger.info(f"Project performance report generated. Projects: {total_projects}, Tasks: {total_tasks}")
            return ReportData(
                metadata=metadata,
                summary=summary,
                data={"projects": projects}
            )
            
        except Exception as e:
            logger.error(f"Error generating project performance report: {str(e)}", exc_info=True)
            raise

    def generate_team_productivity_report(
        self, 
        start_date: str, 
        end_date: str
    ) -> ReportData:
        """Generate team productivity report (Per User) with date filtering"""
        try:
            logger.info(f"Generating team productivity report from {start_date} to {end_date}")
            report_id = str(uuid4())
            
            # Get all tasks and filter by date range
            all_tasks = self.repo.get_all_tasks()
            filtered_tasks = self._filter_tasks_by_date(all_tasks, start_date, end_date)
            
            # Generate user productivity from filtered tasks
            users = self.repo.get_user_productivity_from_tasks(filtered_tasks)
            
            metadata = ReportMetadata(
                report_id=report_id,
                report_type="team_productivity",
                generated_at=datetime.utcnow(),
                generated_by="system",
                parameters={
                    "start_date": start_date,
                    "end_date": end_date,
                    "report_subtype": "per_user",
                    "tasks_in_range": len(filtered_tasks),
                    "total_tasks": len(all_tasks)
                }
            )
            
            # Calculate summary
            total_users = len(users)
            total_tasks = sum(u["total_tasks"] for u in users)
            total_completed = sum(u["completed"] for u in users)
            avg_completion = (
                sum(u["completion_rate"] for u in users) / total_users 
                if total_users > 0 else 0.0
            )
            
            summary = {
                "total_team_members": total_users,
                "total_tasks_assigned": total_tasks,
                "total_completed": total_completed,
                "average_completion_rate": round(avg_completion, 1)
            }
            
            logger.info(f"Team productivity report generated. Users: {total_users}, Tasks: {total_tasks}")
            return ReportData(
                metadata=metadata,
                summary=summary,
                data={"team_members": users}
            )
            
        except Exception as e:
            logger.error(f"Error generating team productivity report: {str(e)}", exc_info=True)
            raise

    def get_reports_summary(self) -> Dict[str, Any]:
        """Get high-level summary for all reports"""
        try:
            logger.info("Getting reports summary...")
            stats = self.repo.get_task_statistics()
            all_tasks = self.repo.get_all_tasks()
            projects = self.repo.get_project_statistics_from_tasks(all_tasks)
            users = self.repo.get_user_productivity_from_tasks(all_tasks)
            
            return {
                "total_tasks": stats["total_tasks"],
                "total_projects": len(projects),
                "total_team_members": len(users),
                "completion_rate": round(
                    (stats["by_status"].get("Completed", 0) / stats["total_tasks"] * 100), 1
                ) if stats["total_tasks"] > 0 else 0.0,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting reports summary: {str(e)}", exc_info=True)
            raise
