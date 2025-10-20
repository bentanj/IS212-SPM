import requests
import logging
from typing import List, Dict, Any, Optional
import os

logger = logging.getLogger(__name__)

class TaskServiceClient:
    """HTTP client for communicating with Tasks microservice"""
    
    def __init__(self):
        self.base_url = os.getenv('TASK_SERVICE_URL', 'http://tasks:8001')
        self.timeout = 30
        logger.info(f"TaskServiceClient initialized with URL: {self.base_url}")
    
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """Fetch all tasks from Tasks service"""
        try:
            url = f"{self.base_url}/api/tasks"
            logger.info(f"Fetching all tasks from: {url}")
            
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            tasks = response.json()
            logger.info(f"Successfully retrieved {len(tasks)} tasks")
            return tasks
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout connecting to Tasks service at {self.base_url}")
            raise Exception("Tasks service timeout")
        except requests.exceptions.ConnectionError:
            logger.error(f"Cannot connect to Tasks service at {self.base_url}")
            raise Exception("Tasks service unavailable")
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error from Tasks service: {e}")
            raise Exception(f"Tasks service error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error fetching tasks: {str(e)}")
            raise
    
    def get_task_by_id(self, task_id: int) -> Optional[Dict[str, Any]]:
        """Fetch a specific task by ID"""
        try:
            url = f"{self.base_url}/api/tasks/{task_id}"
            logger.info(f"Fetching task {task_id} from: {url}")
            
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            task = response.json()
            logger.info(f"Successfully retrieved task {task_id}")
            return task
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                logger.warning(f"Task {task_id} not found")
                return None
            logger.error(f"HTTP error fetching task {task_id}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error fetching task {task_id}: {str(e)}")
            raise
    
    def health_check(self) -> bool:
        """Check if Tasks service is healthy"""
        try:
            url = f"{self.base_url}/api/tasks/health"
            response = requests.get(url, timeout=5)
            return response.status_code == 200
        except Exception:
            return False
