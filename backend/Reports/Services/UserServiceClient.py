# Services/UserServiceClient.py
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import List, Dict, Optional
import logging
import threading

logger = logging.getLogger(__name__)


class UserServiceClient:
    """Client for communicating with the User Service with connection pooling"""
    
    # Class-level shared session (singleton pattern)
    _session = None
    _session_lock = threading.Lock()
    
    def __init__(self, user_service_url: str):
        """
        Initialize UserServiceClient
        
        Args:
            user_service_url: Base URL of the user service
        
        """
        self.user_service_url = user_service_url.rstrip('/')
        self.timeout = 10
        
        # Initialize shared session only once (thread-safe)
        if UserServiceClient._session is None:
            with UserServiceClient._session_lock:
                # Double-check locking pattern
                if UserServiceClient._session is None:
                    UserServiceClient._session = self._create_session()
                    logger.info(f"UserServiceClient session pool initialized")
        
        # Keep self.session for backward compatibility
        self.session = UserServiceClient._session
        logger.info(f"UserServiceClient initialized with URL: {self.user_service_url}")
    
    def _create_session(self) -> requests.Session:
        """Create a session with connection pooling and retry logic"""
        session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=3,                          # Retry up to 3 times
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "POST", "OPTIONS"],
            backoff_factor=0.5,               # Wait 0.5s, 1s, 2s between retries
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
        
        logger.info("UserServiceClient connection pool created (pool_size=10, connections=5)")
        return session
    
    def get_user(self, staff_id: int) -> Optional[Dict]:
        """
        Get user details by staff_id
        
        Args:
            staff_id: The staff ID
        
        Returns:
            User data dictionary or None if not found
        
        """
        try:
            url = f"{self.user_service_url}/api/users/{staff_id}"
            logger.info(f"Fetching user details for staff_id: {staff_id}")
            
            # Uses shared session (self.session points to _session)
            response = self.session.get(url, timeout=self.timeout)
            
            if response.status_code == 200:
                user_data = response.json()
                logger.info(f"Successfully fetched user: {user_data.get('staff_fname')} {user_data.get('staff_lname')}")
                return user_data
            elif response.status_code == 404:
                logger.warning(f"User not found: staff_id={staff_id}")
                return None
            else:
                logger.error(f"Error fetching user {staff_id}: {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            logger.error(f"Timeout fetching user {staff_id} from user service")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error communicating with user service for staff_id {staff_id}: {str(e)}")
            return None
    
    def get_users_batch(self, staff_ids: List[int]) -> Dict[int, Dict]:
        """
        Get multiple users by staff_ids (batch operation)
        
        Args:
            staff_ids: List of staff IDs
        
        Returns:
            Dictionary mapping staff_id to user data

        """
        users = {}
        for staff_id in staff_ids:
            user_data = self.get_user(staff_id)
            if user_data:
                users[staff_id] = user_data
        return users
    
    def get_all_users(self) -> List[Dict]:
        """
        Get all users from user service
        
        Returns:
            List of user dictionaries
        
        """
        try:
            url = f"{self.user_service_url}/api/users"
            logger.info("Fetching all users from user service")
            
            response = self.session.get(url, timeout=self.timeout)
            
            if response.status_code == 200:
                users = response.json()
                logger.info(f"Successfully fetched {len(users)} users")
                return users
            else:
                logger.error(f"Error fetching all users: {response.status_code}")
                return []
                
        except requests.exceptions.Timeout:
            logger.error("Timeout fetching all users from user service")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Error communicating with user service: {str(e)}")
            return []
    
    def post_users_filter(self, user_ids: List[int]) -> List[Dict]:
        """
        Get multiple users by IDs using POST filter endpoint
        
        Args:
            user_ids: List of user IDs to fetch
        
        Returns:
            List of user data dictionaries
        
        """
        try:
            url = f"{self.user_service_url}/api/users/filter"
            logger.info(f"Fetching {len(user_ids)} users via filter endpoint")
            
            response = self.session.post(
                url,
                json={"userIds": user_ids},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                users_data = response.json()
                logger.info(f"Successfully retrieved {len(users_data)} users")
                return users_data
            else:
                logger.error(f"Error from filter endpoint: {response.status_code}")
                return []
                
        except requests.exceptions.Timeout:
            logger.error("Timeout on users filter endpoint")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling filter endpoint: {str(e)}")
            return []
    
    def health_check(self) -> bool:
        """
        Check if User service is healthy
        
        Returns:
            True if service is healthy, False otherwise

        """
        try:
            url = f"{self.user_service_url}/api/users/health"
            response = self.session.get(url, timeout=5)
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
            logger.info("UserServiceClient session closed")
