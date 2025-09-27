import unittest
from unittest.mock import Mock, MagicMock
from datetime import datetime
from uuid import uuid4

from Users.Services.UserService import UserService
from Users.Models.User import User
from Users.exceptions import UserNotFoundError, UserValidationError, UserAlreadyExistsError



class TestUserService(unittest.TestCase):

    def setUp(self):
        self.mock_repo = Mock()
        self.service = UserService(self.mock_repo)

    def test_list_users(self):
        """Test listing all users"""
        expected_users = [Mock(), Mock()]
        self.mock_repo.list.return_value = expected_users

        result = self.service.list_users()

        self.assertEqual(result, expected_users)
        self.mock_repo.list.assert_called_once()

    def test_get_user_by_id_success(self):
        """Test getting a user by ID when it exists"""
        user_id = uuid4()
        expected_user = Mock()
        self.mock_repo.get.return_value = expected_user

        result = self.service.get_user_by_id(user_id)

        self.assertEqual(result, expected_user)
        self.mock_repo.get.assert_called_once_with(user_id)

    def test_get_user_by_id_not_found(self):
        """Test getting a user by ID when it doesn't exist"""
        user_id = uuid4()
        self.mock_repo.get.return_value = None

        with self.assertRaises(UserNotFoundError) as cm:
            self.service.get_user_by_id(user_id)

        self.assertEqual(str(cm.exception), f"User with id {user_id} not found")

    def test_create_user_success(self):
        """Test creating a valid user"""
        user_data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'password123'
        }
        expected_user = Mock()
        self.mock_repo.email_exists.return_value = False
        self.mock_repo.create.return_value = expected_user

        result = self.service.create_user(user_data)

        self.assertEqual(result, expected_user)
        self.mock_repo.create.assert_called_once()
        call_args = self.mock_repo.create.call_args[0][0]
        self.assertEqual(call_args['email'], 'test@example.com')
        self.assertEqual(call_args['role'], 'user')
        self.assertIn('password_hash', call_args)
        self.assertNotIn('password', call_args)

    def test_create_user_email_exists(self):
        """Test creating a user with existing email"""
        user_data = {
            'email': 'existing@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'password123'
        }
        self.mock_repo.email_exists.return_value = True

        with self.assertRaises(UserAlreadyExistsError):
            self.service.create_user(user_data)

    def test_create_user_invalid_email(self):
        """Test creating a user with invalid email"""
        user_data = {
            'email': 'invalid-email',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'password123'
        }

        with self.assertRaises(UserValidationError):
            self.service.create_user(user_data)


if __name__ == '__main__':
    unittest.main()