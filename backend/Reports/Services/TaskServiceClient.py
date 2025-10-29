# Services/TaskServiceClient.py
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging
from typing import List, Dict, Any, Optional
import os
import threading

logger = logging.getLogger(__name__)


class TaskServiceClient:
    """HTTP client for communicating with Tasks microservice with connection pooling"""
    
    # Class-level shared session (singleton pattern)
    _session = None
    _session_lock = threading.Lock()
    
    def __init__(self):
        """
        Initialize TaskServiceClient
        
        """
        self.base_url = os.getenv('TASK_SERVICE_URL', 'http://tasks:8001')
        self.timeout = 30
        
        # Initialize shared session only once (thread-safe)
        if TaskServiceClient._session is None:
            with TaskServiceClient._session_lock:
                # Double-check locking pattern
                if TaskServiceClient._session is None:
                    TaskServiceClient._session = self._create_session()
                    logger.info(f"TaskServiceClient session pool initialized with URL: {self.base_url}")
        else:
            logger.info(f"TaskServiceClient initialized with URL: {self.base_url} (reusing existing session)")
    
    def _create_session(self) -> requests.Session:
        """Create a session with connection pooling and retry logic"""
        session = requests.Session()
        
        # Configure retry strategy for resilience
        retry_strategy = Retry(
            total=3,                          # Retry up to 3 times
            status_forcelist=[429, 500, 502, 503, 504],  # Retry on these HTTP codes
            allowed_methods=["HEAD", "GET", "OPTIONS"],  # Only retry safe methods
            backoff_factor=1,                 # Wait 1s, 2s, 4s between retries
            raise_on_status=False             # Don't raise exception on retry
        )
        
        # Create adapter with connection pooling
        adapter = HTTPAdapter(
            pool_connections=10,              # Cache up to 10 connection pools
            pool_maxsize=20,                  # Max 20 connections per pool
            max_retries=retry_strategy,
            pool_block=False                  # Don't block when pool is exhausted
        )
        
        # Mount adapter for HTTP and HTTPS
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set persistent headers
        session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Connection': 'keep-alive',       # Enable HTTP keep-alive
            'Accept-Encoding': 'gzip, deflate'
        })
        
        logger.info("TaskServiceClient connection pool created (pool_size=20, connections=10)")
        return session
    
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """
        Fetch all tasks from Tasks service
        
        """
        try:
            url = f"{self.base_url}/api/tasks"
            logger.info(f"Fetching all tasks from: {url}")
            
            # Use shared session instead of requests.get()
            response = TaskServiceClient._session.get(url, timeout=self.timeout)
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
        """
        Fetch a specific task by ID
        
        """
        try:
            url = f"{self.base_url}/api/tasks/{task_id}"
            logger.info(f"Fetching task {task_id} from: {url}")
            
            # Use shared session
            response = TaskServiceClient._session.get(url, timeout=self.timeout)
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
        """
        Check if Tasks service is healthy
        
        """
        try:
            url = f"{self.base_url}/api/tasks/health"
            response = TaskServiceClient._session.get(url, timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    @classmethod
    def close_session(cls):
        """
        Close the shared session (call on application shutdown)
        
        """
        if cls._session:
            cls._session.close()
            cls._session = None
            logger.info("TaskServiceClient session closed")
