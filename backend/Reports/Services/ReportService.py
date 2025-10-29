# Services/ReportService.py

from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
from Repositories.ReportRepository import ReportRepository
from Models.Report import ReportMetadata, ReportData
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import os
import threading

logger = logging.getLogger(__name__)


class ReportService:
    """Service for generating various types of reports with date range filtering"""
    
    # Class-level shared session for User Service API calls (singleton pattern)
    _user_service_session = None
    _session_lock = threading.Lock()
    
    def __init__(self):
        """
        Initialize ReportService
        
        """
        self.repo = ReportRepository()
        self.user_service_url = os.getenv('USER_SERVICE_URL', 'http://users:8003')
        
        # Initialize shared session only once (thread-safe)
        if ReportService._user_service_session is None:
            with ReportService._session_lock:
                # Double-check locking pattern
                if ReportService._user_service_session is None:
                    ReportService._user_service_session = self._create_user_service_session()
                    logger.info("ReportService: User service session pool initialized")
        
        logger.info("ReportService initialized successfully")
    
    def _create_user_service_session(self) -> requests.Session:
        """Create a session with connection pooling for User Service API calls"""
        session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "POST", "OPTIONS"],
            backoff_factor=0.5,
            raise_on_status=False
        )
        
        # Create adapter with connection pooling
        adapter = HTTPAdapter(
            pool_connections=5,               # Cache up to 5 connection pools
            pool_maxsize=10,                  # Max 10 connections per pool
            max_retries=retry_strategy,
            pool_block=False
        )
        
        # Mount adapter for HTTP and HTTPS
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set persistent headers
        session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate'
        })
        
        logger.info("ReportService: User service connection pool created (pool_size=10)")
        return session

    def _get_user_info(self, user_id: str) -> Dict[str, str]:
        """
        Fetch user information from user service (single user)
        
        """
        try:
            # Convert user_id to integer
            user_id_int = int(user_id) if isinstance(user_id, str) else user_id
            
            logger.info(f"Fetching user info for user_id: {user_id_int} from {self.user_service_url}")
            
            # Use shared session instead of requests.post()
            response = ReportService._user_service_session.post(
                f"{self.user_service_url}/api/users/filter",
                json={"userIds": [user_id_int]},
                timeout=5
            )
            
            logger.info(f"User Service response status: {response.status_code}")
            
            if response.status_code == 200:
                users_data = response.json()
                logger.info(f"User data received: {users_data}")
                
                # Extract first user from array
                if users_data and len(users_data) > 0:
                    user_data = users_data[0]
                    
                    # Your User Service returns 'name' field
                    full_name = user_data.get('name', '')
                    
                    # Split the full name into first and last name
                    name_parts = full_name.split(' ', 1) if full_name else ['User', str(user_id)]
                    first_name = name_parts[0] if len(name_parts) > 0 else 'User'
                    last_name = name_parts[1] if len(name_parts) > 1 else str(user_id)
                    
                    logger.info(f"Mapped user {user_id}: {first_name} {last_name}")
                    
                    return {
                        'first_name': first_name,
                        'last_name': last_name,
                        'email': user_data.get('email', '')
                    }
                else:
                    logger.warning(f"No user found in response for user_id {user_id}")
            else:
                logger.warning(f"User Service returned status {response.status_code} for user {user_id}")
                logger.warning(f"Response content: {response.text}")
            
        except ValueError as e:
            logger.error(f"Invalid user_id format '{user_id}': {str(e)}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error fetching user {user_id}: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error fetching user {user_id}: {str(e)}", exc_info=True)
        
        # Fallback logic
        logger.warning(f"Using fallback name for user {user_id}")
        return {'first_name': 'User', 'last_name': str(user_id), 'email': ''}

    def _get_users_batch(self, user_ids: List) -> Dict[int, Dict[str, str]]:
        """
        Fetch multiple users in a single batch request (OPTIMIZED)
        
        Args:
            user_ids: List of user IDs to fetch (can be strings or ints)
        
        Returns:
            Dictionary mapping user_id (int) to user info dict
        
   
        """
        if not user_ids:
            return {}
        
        try:
            # Convert all IDs to integers
            user_ids_int = []
            for uid in user_ids:
                try:
                    user_ids_int.append(int(uid) if isinstance(uid, str) else uid)
                except (ValueError, TypeError):
                    logger.warning(f"Skipping invalid user_id: {uid}")
                    continue
            
            if not user_ids_int:
                return {}
            
            logger.info(f"🚀 Batch fetching {len(user_ids_int)} users from {self.user_service_url}")
            
            # Single API Call
            response = ReportService._user_service_session.post(
                f"{self.user_service_url}/api/users/filter",
                json={"userIds": user_ids_int},
                timeout=10  # Higher timeout for batch
            )
            
            logger.info(f"Batch user fetch response status: {response.status_code}")
            
            if response.status_code == 200:
                users_data = response.json()
                logger.info(f"✅ Received {len(users_data)} users in batch (requested {len(user_ids_int)})")
                
                # Map user_id to user info
                users_map = {}
                for user_data in users_data:
                    user_id = user_data.get('id') or user_data.get('userId')
                    full_name = user_data.get('name', '')
                    
                    name_parts = full_name.split(' ', 1) if full_name else ['User', str(user_id)]
                    first_name = name_parts[0] if len(name_parts) > 0 else 'User'
                    last_name = name_parts[1] if len(name_parts) > 1 else str(user_id)
                    
                    users_map[int(user_id)] = {
                        'first_name': first_name,
                        'last_name': last_name,
                        'email': user_data.get('email', '')
                    }
                
                return users_map
            else:
                logger.warning(f"Batch user fetch failed with status {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error in batch user fetch: {str(e)}", exc_info=True)
            return {}

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
                    # Handle ISO format with timezone
                    if 'T' in str(due_date_str):
                        due_date = datetime.fromisoformat(str(due_date_str).replace('Z', '+00:00')).date()
                    else:
                        due_date = datetime.strptime(str(due_date_str), '%Y-%m-%d').date()
                    
                    if start_dt <= due_date <= end_dt:
                        filtered_tasks.append(task)
                        logger.debug(f"Task {task_id}: Due {due_date} - INCLUDED")
                    else:
                        logger.debug(f"Task {task_id}: Due {due_date} - Outside range")
                        
                except (ValueError, TypeError, AttributeError) as e:
                    logger.warning(f"Task {task_id}: Could not parse due_date '{due_date_str}': {str(e)}")
                    continue
            
            logger.info(f"Filtered {len(filtered_tasks)} tasks from {len(tasks)} total tasks")
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
            
            all_tasks = self.repo.get_all_tasks()
            filtered_tasks = self._filter_tasks_by_date(all_tasks, start_date, end_date)
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
        """
        Generate user productivity report (Per User) with date filtering
        
        """
        try:
            logger.info(f"Generating user productivity report from {start_date} to {end_date}")
            report_id = str(uuid4())
            
            all_tasks = self.repo.get_all_tasks()
            filtered_tasks = self._filter_tasks_by_date(all_tasks, start_date, end_date)
            users = self.repo.get_user_productivity_from_tasks(filtered_tasks)
            
            # Calculate total unique users
            unique_user_ids = set()
            for task in filtered_tasks:
                assigned_to = task.get('assignedTo') or task.get('assigned_to')
                if assigned_to:
                    unique_user_ids.add(assigned_to)
            
            total_users_count = len(unique_user_ids)
            logger.info(f"Found {total_users_count} users with tasks in date range")
            
            # Batch Fetch
            user_ids_to_fetch = [user.get('user_id') for user in users if user.get('user_id')]
            logger.info(f"🚀 Batch fetching {len(user_ids_to_fetch)} user details...")
            users_info_map = self._get_users_batch(user_ids_to_fetch)
            
            # Map User info from Batch fetching
            for user in users:
                user_id = user.get('user_id')
                if user_id:
                    user_id_int = int(user_id) if isinstance(user_id, str) else user_id
                    
                    if user_id_int in users_info_map:
                        user_info = users_info_map[user_id_int]
                        user['first_name'] = user_info['first_name']
                        user['last_name'] = user_info['last_name']
                        full_name = f"{user_info['first_name']} {user_info['last_name']}".strip()
                        user['full_name'] = full_name if full_name else f"User {user_id}"
                        user['email'] = user_info.get('email', '')
                    else:
                        # Fallback for missing users
                        logger.warning(f"User {user_id} not found in batch result")
                        user['first_name'] = 'User'
                        user['last_name'] = str(user_id)
                        user['full_name'] = f"User {user_id}"
                        user['email'] = ''
            
            # Calculate summary metrics
            total_tasks = sum(u.get('total_tasks', 0) for u in users)
            total_completed = sum(u.get('completed', 0) for u in users)
            avg_completion = sum(u.get('completion_rate', 0) for u in users) / total_users_count if total_users_count > 0 else 0.0
            
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
            
            summary = {
                'total_team_members': total_users_count,
                'total_tasks_assigned': total_tasks,
                'total_completed': total_completed,
                'average_completion_rate': round(avg_completion, 1)
            }
            
            logger.info(f"✅ User productivity report generated. Users: {total_users_count}, Tasks: {total_tasks}")
            
            return ReportData(
                metadata=metadata,
                summary=summary,
                data={'team_members': users}
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
            
            week_tasks = [
                task for task in tasks
                if self._get_task_date(task) and
                current <= self._get_task_date(task) <= week_end
            ]
            
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
            month_start = max(start_dt, datetime(current_year, current_month, 1).date())
            last_day = monthrange(current_year, current_month)[1]
            month_end = min(end_dt, datetime(current_year, current_month, last_day).date())
            
            month_tasks = [
                task for task in tasks
                if self._get_task_date(task) and
                month_start <= self._get_task_date(task) <= month_end
            ]
            
            status_counts = self._count_by_status(month_tasks)
            month_name = datetime(current_year, current_month, 1).strftime('%B %Y')
            
            monthly_data.append({
                'month': f"{current_year}-{current_month:02d}",
                'month_name': month_name,
                **status_counts
            })
            
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
            
            all_tasks = self.repo.get_all_tasks()
            logger.info(f"Retrieved {len(all_tasks)} total tasks")
            
            departments = set()
            for task in all_tasks:
                task_departments = task.get('departments', [])
                
                if isinstance(task_departments, list):
                    for dept in task_departments:
                        if dept and dept.strip():
                            departments.add(dept.strip())
                elif isinstance(task_departments, str):
                    if task_departments.strip():
                        departments.add(task_departments.strip())
            
            sorted_departments = sorted(list(departments))
            
            logger.info(f"Found {len(sorted_departments)} unique departments: {sorted_departments}")
            return sorted_departments
            
        except Exception as e:
            logger.error(f"Error getting unique departments: {str(e)}", exc_info=True)
            return []

    def _get_department_users(self, department: str, tasks: List[Dict]) -> List[Dict[str, Any]]:
        """
        Get list of unique users working in a specific department
        
        """
        try:
            # Collect unique user IDs from department tasks
            user_ids = set()
            for task in tasks:
                assigned_users = task.get('assignedusers') or task.get('assignedUsers') or []
                for user_data in assigned_users:
                    if isinstance(user_data, dict):
                        user_id = user_data.get('userId') or user_data.get('user_id')
                        if user_id:
                            user_ids.add(str(user_id))
            
            logger.info(f"Found {len(user_ids)} unique users in department '{department}'")
            
            # Batch Fetch
            logger.info(f"🚀 Batch fetching {len(user_ids)} user details for department '{department}'...")
            users_info_map = self._get_users_batch(list(user_ids))
            
            # Build users list from batch result 
            users_list = []
            for user_id in user_ids:
                user_id_int = int(user_id) if isinstance(user_id, str) else user_id
                
                if user_id_int in users_info_map:
                    user_info = users_info_map[user_id_int]
                    users_list.append({
                        'user_id': str(user_id),
                        'full_name': f"{user_info['first_name']} {user_info['last_name']}".strip(),
                        'first_name': user_info['first_name'],
                        'last_name': user_info['last_name'],
                        'email': user_info.get('email', '')
                    })
                else:
                    # Fallback for missing users
                    logger.warning(f"User {user_id} not found in batch result")
                    users_list.append({
                        'user_id': str(user_id),
                        'full_name': f"User {user_id}",
                        'first_name': 'User',
                        'last_name': str(user_id),
                        'email': ''
                    })
            
            # Sort by full name
            users_list.sort(key=lambda x: x['full_name'])
            
            logger.info(f"✅ Retrieved details for {len(users_list)} users in department '{department}'")
            return users_list
        
        except Exception as e:
            logger.error(f"Error getting department users: {str(e)}", exc_info=True)
            return []

    def generate_department_activity_report(
        self,
        department: str,
        aggregation: str,
        start_date: str,
        end_date: str
    ) -> ReportData:
        """
        Generate department task activity report with weekly or monthly aggregation
        
       
        """
        try:
            logger.info(f"Generating department activity report for '{department}' ({aggregation}) from {start_date} to {end_date}")
            report_id = str(uuid4())
            
            all_tasks = self.repo.get_all_tasks()
            filtered_tasks = self._filter_tasks_by_date(all_tasks, start_date, end_date)
            
            # Filter tasks by department
            department_tasks = []
            for task in filtered_tasks:
                task_departments = task.get('departments', [])
                
                if isinstance(task_departments, list):
                    if any(dept.strip().lower() == department.lower() for dept in task_departments if dept):
                        department_tasks.append(task)
                elif isinstance(task_departments, str):
                    if task_departments.strip().lower() == department.lower():
                        department_tasks.append(task)
            
            logger.info(f"Found {len(department_tasks)} tasks for department '{department}'")
            
            # Get aggregated data
            if aggregation == "weekly":
                aggregated_data = self._aggregate_by_week(department_tasks, start_date, end_date)
                data_key = "weekly_data"
            else:
                aggregated_data = self._aggregate_by_month(department_tasks, start_date, end_date)
                data_key = "monthly_data"
            
            # Calculate status totals
            status_totals = {
                'to_do': sum(period.get('to_do', 0) for period in aggregated_data),
                'in_progress': sum(period.get('in_progress', 0) for period in aggregated_data),
                'blocked': sum(period.get('blocked', 0) for period in aggregated_data),
                'completed': sum(period.get('completed', 0) for period in aggregated_data),
                'overdue': sum(period.get('overdue', 0) for period in aggregated_data),
            }
            
            total_tasks = len(department_tasks)
            
            # Get users using BATCH fetching
            department_users = self._get_department_users(department, department_tasks)
            logger.info(f"Retrieved {len(department_users)} users for department '{department}'")

            metadata = ReportMetadata(
                report_id=report_id,
                report_type="department_activity",
                generated_at=datetime.utcnow(),
                generated_by="system",
                parameters={
                    "department": department,
                    "aggregation": aggregation,
                    "start_date": start_date,
                    "end_date": end_date
                },
            )
            
            summary = {
                "total_tasks": total_tasks,
                "status_totals": status_totals,
                "total_users": len(department_users)
            }
            
            data = {
                "department": department,
                "aggregation": aggregation,
                data_key: aggregated_data,
                "users": department_users
            }
            
            logger.info(f"✅ Department activity report generated. Tasks: {total_tasks}, Users: {len(department_users)}")
            return ReportData(
                metadata=metadata,
                summary=summary,
                data=data
            )
            
        except Exception as e:
            logger.error(f"Error generating department activity report: {str(e)}", exc_info=True)
            raise
    
    @classmethod
    def close_session(cls):
        """Close the shared session (call on application shutdown)"""
        if cls._user_service_session:
            cls._user_service_session.close()
            cls._user_service_session = None
            logger.info("ReportService: User service session closed")
