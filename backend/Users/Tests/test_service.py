from datetime import datetime
from typing import Iterable, Optional, Dict, Any, List
from uuid import UUID, uuid4

from Services.UserService import UserService
from Models.User import User


class InMemoryUserRepo:
    def __init__(self):
        self._store: Dict[UUID, User] = {}

    def list(self) -> Iterable[User]:
        return list(self._store.values())

    def get(self, user_id: UUID) -> Optional[User]:
        return self._store.get(user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        for user in self._store.values():
            if user.email == email:
                return user
        return None

    def create(self, user_data: Dict[str, Any]) -> User:
        user = User(**user_data)
        if not user.id:
            user.id = uuid4()
        self._store[user.id] = user
        return user

    def update(self, user_id: UUID, user_data: Dict[str, Any]) -> Optional[User]:
        user = self._store.get(user_id)
        if not user:
            return None
        for k, v in user_data.items():
            if hasattr(user, k):
                setattr(user, k, v)
        self._store[user_id] = user
        return user

    def delete(self, user_id: UUID) -> bool:
        return self._store.pop(user_id, None) is not None

    def find_by_role(self, role: str) -> Iterable[User]:
        return [u for u in self._store.values() if u.role == role]

    def find_active_users(self) -> Iterable[User]:
        return [u for u in self._store.values() if u.is_active]

    def find_verified_users(self) -> Iterable[User]:
        return [u for u in self._store.values() if u.is_verified]

    def find_by_criteria(self, filters: Dict[str, Any]) -> Iterable[User]:
        results = list(self._store.values())
        if 'role' in filters:
            results = [u for u in results if u.role == filters['role']]
        if 'is_active' in filters:
            results = [u for u in results if u.is_active == filters['is_active']]
        if 'is_verified' in filters:
            results = [u for u in results if u.is_verified == filters['is_verified']]
        return results

    def count_by_role(self) -> Dict[str, int]:
        role_counts = {}
        for user in self._store.values():
            role_counts[user.role] = role_counts.get(user.role, 0) + 1
        return role_counts

    def email_exists(self, email: str) -> bool:
        return self.get_by_email(email) is not None


def test_create_user_defaults():
    service = UserService(InMemoryUserRepo())
    user = service.create_user({
        'email': 'test@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'password123'
    })

    assert user.email == 'test@example.com'
    assert user.first_name == 'John'
    assert user.last_name == 'Doe'
    assert user.role == 'user'
    assert user.is_active == True
    assert user.is_verified == False
    assert user.password_hash is not None


def test_verify_user():
    service = UserService(InMemoryUserRepo())
    user = service.create_user({
        'email': 'test@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'password123'
    })

    verified_user = service.verify_user(user.id)
    assert verified_user.is_verified == True


def test_deactivate_user():
    service = UserService(InMemoryUserRepo())
    user = service.create_user({
        'email': 'test@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'password': 'password123'
    })

    deactivated_user = service.deactivate_user(user.id)
    assert deactivated_user.is_active == False