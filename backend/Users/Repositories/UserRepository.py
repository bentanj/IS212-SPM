from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Handle both relative and absolute imports
try:
    from ..Models.User import User
except ImportError:
    from Models.User import User
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

    def get_all_users(self):
        """Get all users"""
        return self.db_session.query(User).all()

    def get_users_by_filter(self, user_ids: list = None, emails: list = None):
        """Get users by filtering on IDs and/or emails"""
        query = self.db_session.query(User)

        filters = []

        if user_ids:
            filters.append(User.id.in_(user_ids))

        if emails:
            filters.append(User.email.in_(emails))

        if filters:
            # Use OR condition if both filters are provided
            from sqlalchemy import or_
            query = query.filter(or_(*filters))

        return query.all()
