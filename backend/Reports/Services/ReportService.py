# Services/ReportService.py
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
from Repositories.ReportRepository import ReportRepository
from Models.Report import ReportMetadata, ReportData
import logging
import requests
import os

logger = logging.getLogger(__name__)

class ReportService:
    """Service for generating various types of reports with date range filtering"""

    def __init__(self):
        self.repo = ReportRepository()
        logger.info("ReportService initialized successfully")
        # ADD THIS LINE - Set the authentication service URL
        self.auth_service_url = os.getenv('AUTHENTICATION_SERVICE_URL', 'http://users:8003')
        logger.info("ReportService initialized successfully")

    def _get_user_info(self, user_id: str) -> Dict[str, str]:
        """
        Fetch user information from user service
        
        ✅ UPDATED: Now calls User Service instead of auth service
        Maintains 100% backward compatibility with same return format
        """
        try:
            # ✅ CHANGED: New endpoint format for User Service
            response = requests.get(
                f"{self.user_service_url}/api/users/{user_id}",
                timeout=5
            )
            
            if response.status_code == 200:
                user_data = response.json()
                
                # ✅ ADAPTED: Map User Service fields to expected format
                # User Service returns: staff_fname, staff_lname, email
                # We need to return: first_name, last_name, email
                return {
                    'first_name': user_data.get('staff_fname', ''),  
                    'last_name': user_data.get('staff_lname', ''),   
                    'email': user_data.get('email', '')             
                }
            else:
                logger.warning(f"User Service returned status {response.status_code} for user {user_id}")
                
        except Exception as e:
            logger.warning(f"Failed to fetch user {user_id} from User Service: {str(e)}")
        
        
        return {'first_name': 'User', 'last_name': str(user_id), 'email': ''}


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

    def generate_user_productivity_report(
        self, 
        start_date: str, 
        end_date: str
    ) -> ReportData:
        """Generate user productivity report (Per User) with date filtering"""
        try:
            logger.info(f"Generating user productivity report from {start_date} to {end_date}")
            report_id = str(uuid4())
            
            # Get all tasks and filter by date range
            all_tasks = self.repo.get_all_tasks()
            filtered_tasks = self._filter_tasks_by_date(all_tasks, start_date, end_date)
            
            # Generate user productivity from filtered tasks
            users = self.repo.get_user_productivity_from_tasks(filtered_tasks)

            # Fetch user names for each user
            for user in users:
                user_id = user.get('user_id')
                if user_id:
                    user_info = self._get_user_info(user_id)
                    user['first_name'] = user_info['first_name']
                    user['last_name'] = user_info['last_name']
                    # Create full_name by combining first and last name
                    full_name = f"{user_info['first_name']} {user_info['last_name']}".strip()
                    user['full_name'] = full_name if full_name else f"User {user_id}"
            
            metadata = ReportMetadata(
                report_id=report_id,
                report_type="user_productivity",
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
                "total_users": total_users,
                "total_tasks_assigned": total_tasks,
                "total_completed": total_completed,
                "average_completion_rate": round(avg_completion, 1)
            }
            
            logger.info(f"User productivity report generated. Users: {total_users}, Tasks: {total_tasks}")
            return ReportData(
                metadata=metadata,
                summary=summary,
                data={"team_members": users}
            )
            
        except Exception as e:
            logger.error(f"Error generating user productivity report: {str(e)}", exc_info=True)
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
                "total_user": len(users),
                "completion_rate": round(
                    (stats["by_status"].get("Completed", 0) / stats["total_tasks"] * 100), 1
                ) if stats["total_tasks"] > 0 else 0.0,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting reports summary: {str(e)}", exc_info=True)
            raise

    ################## Helper Methods for Department Report ##################
    def _aggregate_by_week(self, tasks: List[Dict], start_date: str, end_date: str) -> List[Dict]:
        """Aggregate tasks by week"""
        from datetime import timedelta
        
        start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        weekly_data = []
        current = start_dt
        
        while current <= end_dt:
            week_end = min(current + timedelta(days=6), end_dt)
            
            # Filter tasks for this week
            week_tasks = [
                task for task in tasks
                if self._get_task_date(task) and
                current <= self._get_task_date(task) <= week_end
            ]
            
            # Count by status
            status_counts = self._count_by_status(week_tasks)
            
            weekly_data.append({
                'week_start': current.strftime('%Y-%m-%d'),
                'week_end': week_end.strftime('%Y-%m-%d'),
                **status_counts
            })
            
            current = week_end + timedelta(days=1)
        
        return weekly_data

    def _aggregate_by_month(self, tasks: List[Dict], start_date: str, end_date: str) -> List[Dict]:
        """Aggregate tasks by month"""
        from calendar import monthrange
        
        start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        monthly_data = []
        current_year = start_dt.year
        current_month = start_dt.month
        
        while (current_year < end_dt.year) or (current_year == end_dt.year and current_month <= end_dt.month):
            # Get month boundaries
            month_start = max(start_dt, datetime(current_year, current_month, 1).date())
            last_day = monthrange(current_year, current_month)[1]
            month_end = min(end_dt, datetime(current_year, current_month, last_day).date())
            
            # Filter tasks for this month
            month_tasks = [
                task for task in tasks
                if self._get_task_date(task) and
                month_start <= self._get_task_date(task) <= month_end
            ]
            
            # Count by status
            status_counts = self._count_by_status(month_tasks)
            
            month_name = datetime(current_year, current_month, 1).strftime('%B %Y')
            
            monthly_data.append({
                'month': f"{current_year}-{current_month:02d}",
                'month_name': month_name,
                **status_counts
            })
            
            # Move to next month
            if current_month == 12:
                current_month = 1
                current_year += 1
            else:
                current_month += 1
        
        return monthly_data

    def _get_task_date(self, task: Dict) -> Optional[datetime.date]:
        """Extract date from task"""
        due_date_str = task.get('due_date') or task.get('dueDate')
        if not due_date_str:
            return None
        
        try:
            if 'T' in str(due_date_str):
                return datetime.fromisoformat(str(due_date_str).replace('Z', '+00:00')).date()
            else:
                return datetime.strptime(str(due_date_str), '%Y-%m-%d').date()
        except (ValueError, TypeError, AttributeError):
            return None

    def _count_by_status(self, tasks: List[Dict]) -> Dict[str, int]:
        """Count tasks by status"""
        now = datetime.now().date()
        
        counts = {
            'to_do': 0,
            'in_progress': 0,
            'blocked': 0,
            'completed': 0,
            'overdue': 0
        }
        
        for task in tasks:
            status = task.get('status', '').lower()
            due_date = self._get_task_date(task)
            
            # Check if overdue
            if status not in ['completed', 'done'] and due_date and due_date < now:
                counts['overdue'] += 1
            elif status in ['to do', 'todo', 'to_do']:
                counts['to_do'] += 1
            elif status in ['in progress', 'in_progress', 'inprogress']:
                counts['in_progress'] += 1
            elif status == 'blocked':
                counts['blocked'] += 1
            elif status in ['completed', 'done']:
                counts['completed'] += 1
        
        return counts
    ################## End ##################
    
    def get_unique_departments(self) -> List[str]:
        """Get list of unique departments from all tasks"""
        try:
            logger.info("Fetching unique departments from tasks")
            
            # Get all tasks
            all_tasks = self.repo.get_all_tasks()
            logger.info(f"Retrieved {len(all_tasks)} total tasks")
            
            # Extract unique departments
            departments = set()
            for task in all_tasks:
                # ✅ FIX: Access 'departments' (plural) array instead of 'department'
                task_departments = task.get('departments', [])
                
                # Handle if it's a list (array)
                if isinstance(task_departments, list):
                    for dept in task_departments:
                        if dept and dept.strip():  # Only add non-empty departments
                            departments.add(dept.strip())
                # Handle if it's a string (fallback for backwards compatibility)
                elif isinstance(task_departments, str):
                    if task_departments.strip():
                        departments.add(task_departments.strip())
            
            # Sort alphabetically
            sorted_departments = sorted(list(departments))
            
            logger.info(f"Found {len(sorted_departments)} unique departments: {sorted_departments}")
            return sorted_departments
            
        except Exception as e:
            logger.error(f"Error getting unique departments: {str(e)}", exc_info=True)
            # Return empty list on error rather than crashing
            return []

    # ✅ ADD THIS NEW METHOD - Main department report generator
    def generate_department_activity_report(
            self,
            department: str,
            aggregation: str,
            start_date: str,
            end_date: str
        ) -> ReportData:
        """Generate department task activity report with weekly or monthly aggregation"""
        try:
            logger.info(f"Generating department activity report for {department} ({aggregation}) from {start_date} to {end_date}")
            report_id = str(uuid4())
            
            # Get all tasks and filter by date range
            all_tasks = self.repo.get_all_tasks()
            filtered_tasks = self._filter_tasks_by_date(all_tasks, start_date, end_date)
            
            # ✅ FIX: Filter tasks by department (handle array field)
            department_tasks = []
            for task in filtered_tasks:
                task_departments = task.get('departments', [])
                
                # Handle if it's a list (array)
                if isinstance(task_departments, list):
                    # Check if department exists in the array
                    if any(dept.strip().lower() == department.lower() for dept in task_departments if dept):
                        department_tasks.append(task)
                # Handle if it's a string (fallback)
                elif isinstance(task_departments, str):
                    if task_departments.strip().lower() == department.lower():
                        department_tasks.append(task)
            
            logger.info(f"Found {len(department_tasks)} tasks for department '{department}' out of {len(filtered_tasks)} filtered tasks")
            
            # Get aggregated data
            if aggregation == 'weekly':
                aggregated_data = self._aggregate_by_week(department_tasks, start_date, end_date)
                data_key = 'weekly_data'
            else:  # monthly
                aggregated_data = self._aggregate_by_month(department_tasks, start_date, end_date)
                data_key = 'monthly_data'
            
            # Calculate status totals across all periods
            status_totals = {
                'to_do': sum(period.get('to_do', 0) for period in aggregated_data),
                'in_progress': sum(period.get('in_progress', 0) for period in aggregated_data),
                'blocked': sum(period.get('blocked', 0) for period in aggregated_data),
                'completed': sum(period.get('completed', 0) for period in aggregated_data),
                'overdue': sum(period.get('overdue', 0) for period in aggregated_data),
            }
            
            total_tasks = len(department_tasks)
            
            metadata = ReportMetadata(
                report_id=report_id,
                report_type="department_activity",
                generated_at=datetime.utcnow(),
                generated_by="system",
                parameters={
                    "department": department,
                    "aggregation": aggregation,
                    "start_date": start_date,
                    "end_date": end_date,
                    "tasks_in_range": total_tasks
                }
            )
            
            summary = {
                "total_tasks": total_tasks,
                "status_totals": status_totals
            }
            
            data = {
                "department": department,
                "aggregation": aggregation,
                data_key: aggregated_data
            }
            
            logger.info(f"Department activity report generated. Total tasks: {total_tasks}")
            
            return ReportData(
                metadata=metadata,
                summary=summary,
                data=data
            )
            
        except Exception as e:
            logger.error(f"Error generating department activity report: {str(e)}", exc_info=True)
            raise

                