from typing import Dict, Any, List
from collections import defaultdict
from Services.TaskServiceClient import TaskServiceClient
import logging

logger = logging.getLogger(__name__)

class ReportRepository:
    """Repository for generating report data from Tasks service"""
    
    def __init__(self):
        self.task_client = TaskServiceClient()
        logger.info("ReportRepository initialized")
    
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """Get all tasks from Tasks service"""
        try:
            tasks = self.task_client.get_all_tasks()
            logger.info(f"Retrieved {len(tasks)} tasks from Tasks service")
            return tasks
        except Exception as e:
            logger.error(f"Error fetching tasks: {str(e)}")
            raise
    
    def get_task_statistics(self) -> Dict[str, Any]:
        """Calculate task statistics"""
        try:
            tasks = self.get_all_tasks()
            
            status_counts = defaultdict(int)
            priority_counts = defaultdict(int)
            
            for task in tasks:
                status = task.get('status', 'Unknown')
                priority = task.get('priority', 'Unknown')
                
                status_counts[status] += 1
                priority_counts[str(priority)] += 1
            
            stats = {
                "total_tasks": len(tasks),
                "by_status": dict(status_counts),
                "by_priority": dict(priority_counts)
            }
            
            logger.info(f"Calculated statistics for {len(tasks)} tasks")
            return stats
            
        except Exception as e:
            logger.error(f"Error calculating statistics: {str(e)}")
            raise
    
    def get_project_statistics(self) -> List[Dict[str, Any]]:
        """Get statistics grouped by project"""
        try:
            tasks = self.get_all_tasks()
            projects = defaultdict(lambda: {
                'total_tasks': 0,
                'completed': 0,
                'in_progress': 0,
                'to_do': 0
            })
            
            for task in tasks:
                project = task.get('project_name') or task.get('projectName') or 'No Project'
                status = task.get('status', 'Unknown')
                
                projects[project]['total_tasks'] += 1
                
                if status == 'Completed':
                    projects[project]['completed'] += 1
                elif status == 'In Progress':
                    projects[project]['in_progress'] += 1
                elif status == 'To Do':
                    projects[project]['to_do'] += 1
            
            result = []
            for project_name, stats in projects.items():
                completion_rate = (stats['completed'] / stats['total_tasks'] * 100) if stats['total_tasks'] > 0 else 0
                result.append({
                    'project_name': project_name,
                    'total_tasks': stats['total_tasks'],
                    'completed': stats['completed'],
                    'in_progress': stats['in_progress'],
                    'to_do': stats['to_do'],
                    'completion_rate': round(completion_rate, 1)
                })
            
            logger.info(f"Generated statistics for {len(result)} projects")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating project statistics: {str(e)}")
            raise
    
    def get_user_productivity(self) -> List[Dict[str, Any]]:
        """Get productivity statistics by user"""
        try:
            tasks = self.get_all_tasks()
            users = defaultdict(lambda: {
                'total_tasks': 0,
                'completed': 0
            })
            
            for task in tasks:
                assigned_users = task.get('assigned_users') or task.get('assignedUsers') or []
                status = task.get('status', 'Unknown')
                
                for user_data in assigned_users:
                    if isinstance(user_data, dict):
                        user_id = user_data.get('userId') or user_data.get('user_id')
                        user_name = user_data.get('name', f'User {user_id}')
                    else:
                        user_id = user_data
                        user_name = f'User {user_id}'
                    
                    users[user_id]['name'] = user_name
                    users[user_id]['total_tasks'] += 1
                    
                    if status == 'Completed':
                        users[user_id]['completed'] += 1
            
            result = []
            for user_id, stats in users.items():
                completion_rate = (stats['completed'] / stats['total_tasks'] * 100) if stats['total_tasks'] > 0 else 0
                result.append({
                    'user_id': user_id,
                    'user_name': stats['name'],
                    'total_tasks': stats['total_tasks'],
                    'completed': stats['completed'],
                    'completion_rate': round(completion_rate, 1)
                })
            
            logger.info(f"Generated productivity stats for {len(result)} users")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating user productivity: {str(e)}")
            raise
