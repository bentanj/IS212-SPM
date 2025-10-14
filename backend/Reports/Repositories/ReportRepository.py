from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime
import sys
import os

# Add the parent 'backend' directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Now import from Tasks module
from Tasks.Models.Task import Task

class ReportRepository:
    """Repository for aggregating task data for reports"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_all_tasks(self) -> List[Task]:
        """Get all tasks for report generation"""
        return self.session.query(Task).all()
    
    def get_task_statistics(self) -> Dict[str, Any]:
        """Get aggregated task statistics"""
        total_tasks = self.session.query(func.count(Task.id)).scalar()
        
        status_counts = dict(
            self.session.query(
                Task.status,
                func.count(Task.id)
            ).group_by(Task.status).all()
        )
        
        priority_counts = dict(
            self.session.query(
                Task.priority,
                func.count(Task.id)
            ).group_by(Task.priority).all()
        )
        
        return {
            "total_tasks": total_tasks or 0,
            "by_status": status_counts,
            "by_priority": priority_counts
        }
    
    def get_project_statistics(self) -> List[Dict[str, Any]]:
        """Get statistics grouped by project"""
        results = self.session.query(
            Task.project_name,
            func.count(Task.id).label('total_tasks'),
            func.sum(case((Task.status == 'completed', 1), else_=0)).label('completed'),
            func.sum(case((Task.status == 'in_progress', 1), else_=0)).label('in_progress'),
            func.sum(case((Task.status == 'blocked', 1), else_=0)).label('blocked')
        ).group_by(Task.project_name).all()
        
        return [
            {
                "project_name": r.project_name,
                "total_tasks": r.total_tasks,
                "completed": r.completed or 0,
                "in_progress": r.in_progress or 0,
                "blocked": r.blocked or 0,
                "completion_rate": round((r.completed / r.total_tasks * 100), 1) if r.total_tasks > 0 else 0
            }
            for r in results
        ]
    
    def get_user_productivity(self) -> List[Dict[str, Any]]:
        """Get productivity statistics by user"""
        # Get all tasks with assigned users
        tasks = self.session.query(Task).filter(Task.assigned_users.isnot(None)).all()
        
        # Aggregate by user
        user_stats = {}
        for task in tasks:
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
                    if task.status == "completed":
                        user_stats[user_id_str]["completed"] += 1
                    elif task.status == "in_progress":
                        user_stats[user_id_str]["in_progress"] += 1
        
        # Calculate completion rates
        for user_id, stats in user_stats.items():
            total = stats["total_tasks"]
            stats["completion_rate"] = round((stats["completed"] / total * 100), 1) if total > 0 else 0
        
        return list(user_stats.values())
    
    def get_tasks_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Task]:
        """Get tasks within a date range"""
        return self.session.query(Task).filter(
            Task.start_date >= start_date,
            Task.start_date <= end_date
        ).all()
    
    def get_overdue_tasks(self) -> List[Task]:
        """Get all overdue tasks"""
        now = datetime.now()
        return self.session.query(Task).filter(
            Task.due_date < now,
            Task.status != 'completed'
        ).all()
