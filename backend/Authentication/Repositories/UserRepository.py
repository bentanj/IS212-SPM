from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..Models.User import User
from ..exceptions import ValidationError
from datetime import datetime

class UserRepository:
    """Repository for User model operations"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
    
    def get_user_by_email(self, email: str) -> User:
        """Get user by email"""
        return self.db_session.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> User:
        """Get user by ID"""
        return self.db_session.query(User).filter(User.id == user_id).first()
    
    # Read-only service: write operations are not available
    # Users are managed externally and this service only provides read access
