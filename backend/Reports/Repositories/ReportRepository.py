# Reports/Repositories/ReportRepository.py
import requests
import os
from typing import List, Dict, Any
from datetime import datetime


class ReportRepository:
    """Repository that directly calls Task service"""
    
    # For Docker
    # def __init__(self):
    #     self.task_service_url = os.getenv(
    #         "TASK_SERVICE_URL", 
    #         "http://tasks:8001"
    #     )
    #     self.timeout = 5

    def __init__(self):
        self.task_service_url = os.getenv(
            "TASK_SERVICE_URL", 
            "http://localhost:8001"
        )
        self.timeout = 5
    
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """Fetch all tasks - HTTP call embedded in repository"""
        try:
            response = requests.get(
                f"{self.task_service_url}/api/tasks",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch tasks: {str(e)}")
    
    def get_task_statistics(self) -> Dict[str, Any]:
        """Fetch statistics - HTTP call embedded"""
        try:
            response = requests.get(
                f"{self.task_service_url}/api/tasks/statistics",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            # Fallback: calculate locally
            tasks = self.get_all_tasks()
            return self._calculate_statistics(tasks)
    
    def get_project_statistics(self) -> List[Dict[str, Any]]:
        """Get statistics grouped by project"""
        tasks = self.get_all_tasks()
        
        projects = {}
        for task in tasks:
            project_name = task.get("project_name") or "Unassigned"
            
            if project_name not in projects:
                projects[project_name] = {
                    "project_name": project_name,
                    "total_tasks": 0,
                    "completed": 0,
                    "in_progress": 0,
                    "to_do": 0,
                    "blocked": 0
                }
            
            projects[project_name]["total_tasks"] += 1
            
            status = task.get("status")
            if status == "Completed":
                projects[project_name]["completed"] += 1
            elif status == "In Progress":
                projects[project_name]["in_progress"] += 1
            elif status == "To Do":
                projects[project_name]["to_do"] += 1
            elif status == "Blocked":
                projects[project_name]["blocked"] += 1
        
        result = []
        for project in projects.values():
            total = project["total_tasks"]
            completed = project["completed"]
            project["completion_rate"] = round((completed / total * 100), 1) if total > 0 else 0
            result.append(project)
        
        return result
    
    def get_user_productivity(self) -> List[Dict[str, Any]]:
        """Get productivity statistics by user"""
        tasks = self.get_all_tasks()
        
        user_stats = {}
        for task in tasks:
            assigned_users = task.get("assigned_users", [])
            if assigned_users:
                for user_id in assigned_users:
                    user_id_str = str(user_id)
                    
                    if user_id_str not in user_stats:
                        user_stats[user_id_str] = {
                            "user_id": user_id_str,
                            "total_tasks": 0,
                            "completed": 0,
                            "in_progress": 0
                        }
                    
                    user_stats[user_id_str]["total_tasks"] += 1
                    
                    status = task.get("status")
                    if status == "Completed":
                        user_stats[user_id_str]["completed"] += 1
                    elif status == "In Progress":
                        user_stats[user_id_str]["in_progress"] += 1
        
        for user_id, stats in user_stats.items():
            total = stats["total_tasks"]
            stats["completion_rate"] = round((stats["completed"] / total * 100), 1) if total > 0 else 0
        
        return list(user_stats.values())
    
    def get_tasks_by_date_range(
        self, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get tasks within a date range"""
        try:
            params = {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
            response = requests.get(
                f"{self.task_service_url}/api/tasks/date-range",
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            tasks = self.get_all_tasks()
            return self._filter_by_date_range(tasks, start_date, end_date)
    
    def get_overdue_tasks(self) -> List[Dict[str, Any]]:
        """Get all overdue tasks"""
        try:
            response = requests.get(
                f"{self.task_service_url}/api/tasks/overdue",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            tasks = self.get_all_tasks()
            return self._filter_overdue(tasks)
    
    def _calculate_statistics(self, tasks: List[Dict]) -> Dict[str, Any]:
        """Local calculation fallback"""
        total = len(tasks)
        status_counts = {}
        priority_counts = {}
        
        for task in tasks:
            status = task.get("status", "Unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
            priority = task.get("priority", "Unknown")
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
        
        return {
            "total_tasks": total,
            "by_status": status_counts,
            "by_priority": priority_counts
        }
    
    def _filter_by_date_range(
        self, 
        tasks: List[Dict], 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict]:
        """Filter tasks by date range"""
        filtered = []
        for task in tasks:
            task_start = task.get("start_date")
            if task_start and isinstance(task_start, str):
                task_start = datetime.fromisoformat(task_start.replace('Z', '+00:00'))
                if start_date <= task_start <= end_date:
                    filtered.append(task)
        return filtered
    
    def _filter_overdue(self, tasks: List[Dict]) -> List[Dict]:
        """Filter overdue tasks"""
        now = datetime.now()
        overdue = []
        
        for task in tasks:
            due_date = task.get("due_date")
            status = task.get("status")
            
            if due_date and status != "Completed":
                if isinstance(due_date, str):
                    due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                if due_date < now:
                    overdue.append(task)
        
        return overdue
