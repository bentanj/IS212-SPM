from typing import Iterable, Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
import hashlib
import secrets
from Users.Repositories.UserRepository import UserRepository

from Users.Models.User import User
from Users.exceptions import UserNotFoundError, UserValidationError, UserAlreadyExistsError

class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def list_users(self) -> Iterable[User]:
        return self.repo.list()

    def get_user_by_id(self, user_id: UUID) -> User:
        user = self.repo.get(user_id)
        if not user:
            raise UserNotFoundError(f"User with id {user_id} not found")
        return user

    def get_user_by_email(self, email: str) -> User:
        user = self.repo.get_by_email(email)
        if not user:
            raise UserNotFoundError(f"User with email {email} not found")
        return user

    def create_user(self, user_data: Dict[str, Any]) -> User:
        self._validate_user_data(user_data)

        # Check if email already exists
        if self.repo.email_exists(user_data['email']):
            raise UserAlreadyExistsError(f"User with email {user_data['email']} already exists")

        # Hash password
        if 'password' in user_data:
            user_data['password_hash'] = self._hash_password(user_data['password'])
            del user_data['password']

        # Set defaults
        if 'role' not in user_data or user_data['role'] is None:
            user_data['role'] = 'user'

        if 'is_active' not in user_data:
            user_data['is_active'] = True

        if 'is_verified' not in user_data:
            user_data['is_verified'] = False

        return self.repo.create(user_data)

    def update_user(self, user_id: UUID, user_data: Dict[str, Any]) -> User:
        existing_user = self.repo.get(user_id)
        if not existing_user:
            raise UserNotFoundError(f"User with id {user_id} not found")

        self._validate_user_data(user_data, is_update=True)

        # Check email uniqueness if email is being updated
        if 'email' in user_data and user_data['email'] != existing_user.email:
            if self.repo.email_exists(user_data['email']):
                raise UserAlreadyExistsError(f"User with email {user_data['email']} already exists")

        # Hash password if provided
        if 'password' in user_data:
            user_data['password_hash'] = self._hash_password(user_data['password'])
            del user_data['password']

        updated_user = self.repo.update(user_id, user_data)
        if not updated_user:
            raise UserNotFoundError(f"User with id {user_id} not found")
        return updated_user

    def delete_user(self, user_id: UUID) -> bool:
        return self.repo.delete(user_id)

    def deactivate_user(self, user_id: UUID) -> User:
        return self.update_user(user_id, {'is_active': False})

    def activate_user(self, user_id: UUID) -> User:
        return self.update_user(user_id, {'is_active': True})

    def verify_user(self, user_id: UUID) -> User:
        return self.update_user(user_id, {'is_verified': True})

    def get_users_by_role(self, role: str) -> Iterable[User]:
        return self.repo.find_by_role(role)

    def get_active_users(self) -> Iterable[User]:
        return self.repo.find_active_users()

    def get_verified_users(self) -> Iterable[User]:
        return self.repo.find_verified_users()

    def search_users(self, filters: Dict[str, Any]) -> Iterable[User]:
        return self.repo.find_by_criteria(filters)

    def update_last_login(self, user_id: UUID) -> Optional[User]:
        return self.update_user(user_id, {'last_login': datetime.utcnow()})

    def change_password(self, user_id: UUID, new_password: str) -> User:
        if not new_password or len(new_password) < 8:
            raise UserValidationError("Password must be at least 8 characters long")

        return self.update_user(user_id, {'password': new_password})

    def get_user_statistics(self) -> Dict[str, Any]:
        all_users = list(self.repo.list())

        total_users = len(all_users)
        active_users = len([u for u in all_users if u.is_active])
        verified_users = len([u for u in all_users if u.is_verified])

        role_counts = self.repo.count_by_role()

        return {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'verified_users': verified_users,
            'unverified_users': total_users - verified_users,
            'role_breakdown': role_counts
        }

    def _validate_user_data(self, user_data: Dict[str, Any], is_update: bool = False) -> None:
        # Email validation
        if not is_update and ('email' not in user_data or not user_data['email']):
            raise UserValidationError("Email is required")

        if 'email' in user_data and user_data['email']:
            email = user_data['email']
            if '@' not in email or '.' not in email.split('@')[-1]:
                raise UserValidationError("Invalid email format")

        # Name validation
        if not is_update:
            if 'first_name' not in user_data or not user_data['first_name'].strip():
                raise UserValidationError("First name is required")
            if 'last_name' not in user_data or not user_data['last_name'].strip():
                raise UserValidationError("Last name is required")

        # Password validation (only for new users)
        if not is_update and ('password' not in user_data or len(user_data['password']) < 8):
            raise UserValidationError("Password must be at least 8 characters long")

        # Role validation
        if 'role' in user_data and user_data['role']:
            valid_roles = ['user', 'admin', 'moderator']
            if user_data['role'] not in valid_roles:
                raise UserValidationError(f"Role must be one of: {', '.join(valid_roles)}")

    def _hash_password(self, password: str) -> str:
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"{salt}:{password_hash.hex()}"

    def _verify_password(self, password: str, password_hash: str) -> bool:
        try:
            salt, stored_hash = password_hash.split(':')
            password_hash_check = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return stored_hash == password_hash_check.hex()
        except ValueError:
            return False