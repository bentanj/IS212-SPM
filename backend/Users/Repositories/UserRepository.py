from typing import Iterable, Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from uuid import UUID
from Users.Models.User import User

class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def list(self) -> Iterable[User]:
        return self.session.query(User).all()

    def get(self, user_id: UUID) -> Optional[User]:
        return self.session.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.query(User).filter(User.email == email).first()

    def create(self, user_data: Dict[str, Any]) -> User:
        user = User(**user_data)
        self.session.add(user)
        self.session.flush()
        return user

    def update(self, user_id: UUID, user_data: Dict[str, Any]) -> Optional[User]:
        user = self.session.get(User, user_id)
        if user:
            for key, value in user_data.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            self.session.flush()
        return user

    def delete(self, user_id: UUID) -> bool:
        user = self.session.get(User, user_id)
        if user:
            self.session.delete(user)
            self.session.flush()
            return True
        return False

    def find_by_role(self, role: str) -> Iterable[User]:
        return self.session.query(User).filter(User.role == role).all()

    def find_active_users(self) -> Iterable[User]:
        return self.session.query(User).filter(User.is_active == True).all()

    def find_verified_users(self) -> Iterable[User]:
        return self.session.query(User).filter(User.is_verified == True).all()

    def find_by_criteria(self, filters: Dict[str, Any]) -> Iterable[User]:
        query = self.session.query(User)

        if 'role' in filters:
            query = query.filter(User.role == filters['role'])
        if 'is_active' in filters:
            query = query.filter(User.is_active == filters['is_active'])
        if 'is_verified' in filters:
            query = query.filter(User.is_verified == filters['is_verified'])
        if 'email_contains' in filters:
            query = query.filter(User.email.ilike(f"%{filters['email_contains']}%"))
        if 'name_contains' in filters:
            search_term = f"%{filters['name_contains']}%"
            query = query.filter(
                or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term)
                )
            )

        return query.all()

    def count_by_role(self) -> Dict[str, int]:
        results = self.session.query(User.role, User.id).all()
        role_counts = {}
        for role, _ in results:
            role_counts[role] = role_counts.get(role, 0) + 1
        return role_counts

    def email_exists(self, email: str) -> bool:
        return self.session.query(User).filter(User.email == email).first() is not None