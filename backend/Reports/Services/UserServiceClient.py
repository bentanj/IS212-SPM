# services/reporting/clients/UserServiceClient.py

import requests
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class UserServiceClient:
    """Client for communicating with the User Service"""
    
    def __init__(self, user_service_url: str):
        """
        Initialize UserServiceClient
        
        Args:
            user_service_url: Base URL of the user service
        """
        self.user_service_url = user_service_url.rstrip('/')
        self.session = requests.Session()
    
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
            
            response = self.session.get(url, timeout=10)
            
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
            
            response = self.session.get(url, timeout=10)
            
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
