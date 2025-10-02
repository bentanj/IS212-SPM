from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from Models.User import User
from exceptions import ValidationError
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
    
    def create_user(self, email: str, first_name: str = None, last_name: str = None, role: str = 'user') -> User:
        """Create a new user"""
        try:
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=role,
                is_active=True,
                is_verified=True,  # OAuth users are considered verified
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            self.db_session.add(user)
            self.db_session.commit()
            self.db_session.refresh(user)
            return user
        except IntegrityError:
            self.db_session.rollback()
            raise ValidationError("User with this email already exists")
    
    def update_user_login(self, user_id: int) -> User:
        """Update user's last login timestamp"""
        user = self.get_user_by_id(user_id)
        if user:
            user.last_login = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            self.db_session.commit()
            self.db_session.refresh(user)
        return user
    
    def update_user_info(self, user_id: int, first_name: str = None, last_name: str = None) -> User:
        """Update user's basic information"""
        user = self.get_user_by_id(user_id)
        if user:
            if first_name is not None:
                user.first_name = first_name
            if last_name is not None:
                user.last_name = last_name
            user.updated_at = datetime.utcnow()
            self.db_session.commit()
            self.db_session.refresh(user)
        return user
    
    def get_or_create_user(self, email: str, first_name: str = None, last_name: str = None, role: str = 'user') -> User:
        """Get existing user or create new one"""
        user = self.get_user_by_email(email)
        if user:
            # Update last login and potentially user info
            user.last_login = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            if first_name and user.first_name != first_name:
                user.first_name = first_name
            if last_name and user.last_name != last_name:
                user.last_name = last_name
            self.db_session.commit()
            self.db_session.refresh(user)
            return user
        else:
            try:
                return self.create_user(email, first_name, last_name, role)
            except ValidationError:
                # User was created by another process, get the existing user
                self.db_session.rollback()
                user = self.get_user_by_email(email)
                if user:
                    # Update last login
                    user.last_login = datetime.utcnow()
                    user.updated_at = datetime.utcnow()
                    self.db_session.commit()
                    self.db_session.refresh(user)
                    return user
                else:
                    # This shouldn't happen, but just in case
                    raise ValidationError("Failed to create or retrieve user")
