import os
from typing import Optional, List
import pytest
from datetime import datetime

# Ensure test mode
os.environ["FLASK_ENV"] = "test"
os.environ["ENV"] = "test"

from Models.User import User
from Repositories.UserRepository import UserRepository
from app import create_app


class InMemoryUserRepo:
    """Mock repository for testing"""
    def __init__(self):
        self._store = {}
        self._next_id = 1
        # Pre-populate with test users
        self._populate_test_data()

    def _populate_test_data(self):
        """Add some test users"""
        users = [
            {"email": "john@example.com", "first_name": "John", "last_name": "Doe", "role": "user", "department": "Engineering"},
            {"email": "jane@example.com", "first_name": "Jane", "last_name": "Smith", "role": "admin", "department": "HR"},
            {"email": "bob@example.com", "first_name": "Bob", "last_name": None, "role": "user", "department": "Sales"},
            {"email": "alice@example.com", "first_name": None, "last_name": "Johnson", "role": "user", "department": "Marketing"},
            {"email": "noname@example.com", "first_name": None, "last_name": None, "role": "user", "department": "IT"},
        ]
        for user_data in users:
            user = User(
                id=self._next_id,
                email=user_data["email"],
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name"),
                role=user_data["role"],
                department=user_data["department"],
                is_active=True,
                is_verified=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            self._store[self._next_id] = user
            self._next_id += 1

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self._store.get(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        for user in self._store.values():
            if user.email == email:
                return user
        return None

    def get_all_users(self) -> List[User]:
        return list(self._store.values())

    def get_users_by_filter(self, user_ids: list = None, emails: list = None) -> List[User]:
        results = []
        if user_ids:
            for user_id in user_ids:
                user = self._store.get(user_id)
                if user and user not in results:
                    results.append(user)
        if emails:
            for email in emails:
                user = self.get_user_by_email(email)
                if user and user not in results:
                    results.append(user)
        return results


# ============ Repository Tests ============

@pytest.mark.unit
def test_get_user_by_id_success():
    repo = InMemoryUserRepo()
    user = repo.get_user_by_id(1)
    assert user is not None
    assert user.email == "john@example.com"
    assert user.first_name == "John"
    assert user.last_name == "Doe"


@pytest.mark.unit
def test_get_user_by_id_not_found():
    repo = InMemoryUserRepo()
    user = repo.get_user_by_id(999)
    assert user is None


@pytest.mark.unit
def test_get_user_by_email_success():
    repo = InMemoryUserRepo()
    user = repo.get_user_by_email("jane@example.com")
    assert user is not None
    assert user.id == 2
    assert user.first_name == "Jane"


@pytest.mark.unit
def test_get_user_by_email_not_found():
    repo = InMemoryUserRepo()
    user = repo.get_user_by_email("nonexistent@example.com")
    assert user is None


@pytest.mark.unit
def test_get_all_users():
    repo = InMemoryUserRepo()
    users = repo.get_all_users()
    assert len(users) == 5
    emails = [u.email for u in users]
    assert "john@example.com" in emails
    assert "jane@example.com" in emails


@pytest.mark.unit
def test_get_all_users_empty():
    repo = InMemoryUserRepo()
    # Clear the store
    repo._store = {}
    users = repo.get_all_users()
    assert len(users) == 0


# ============ Filter Endpoint Tests ============

@pytest.mark.unit
def test_filter_users_by_ids_only():
    repo = InMemoryUserRepo()
    users = repo.get_users_by_filter(user_ids=[1, 3])
    assert len(users) == 2
    ids = [u.id for u in users]
    assert 1 in ids
    assert 3 in ids


@pytest.mark.unit
def test_filter_users_by_emails_only():
    repo = InMemoryUserRepo()
    users = repo.get_users_by_filter(emails=["jane@example.com", "bob@example.com"])
    assert len(users) == 2
    emails = [u.email for u in users]
    assert "jane@example.com" in emails
    assert "bob@example.com" in emails


@pytest.mark.unit
def test_filter_users_by_both_ids_and_emails():
    """Test OR condition - should return users matching EITHER IDs OR emails"""
    repo = InMemoryUserRepo()
    # ID 1 = john@example.com, alice@example.com = ID 4
    users = repo.get_users_by_filter(user_ids=[1], emails=["alice@example.com"])
    assert len(users) == 2
    ids = [u.id for u in users]
    assert 1 in ids
    assert 4 in ids


@pytest.mark.unit
def test_filter_users_no_matches():
    repo = InMemoryUserRepo()
    users = repo.get_users_by_filter(user_ids=[999, 1000])
    assert len(users) == 0


@pytest.mark.unit
def test_filter_users_partial_matches():
    """Some IDs exist, some don't"""
    repo = InMemoryUserRepo()
    users = repo.get_users_by_filter(user_ids=[1, 999, 2, 1000])
    assert len(users) == 2
    ids = [u.id for u in users]
    assert 1 in ids
    assert 2 in ids


@pytest.mark.unit
def test_filter_users_duplicate_ids():
    """Handles duplicate IDs gracefully - should not return duplicates"""
    repo = InMemoryUserRepo()
    users = repo.get_users_by_filter(user_ids=[1, 1, 1])
    assert len(users) == 1
    assert users[0].id == 1


@pytest.mark.unit
def test_filter_users_empty_arrays():
    """Empty arrays should return empty results"""
    repo = InMemoryUserRepo()
    users = repo.get_users_by_filter(user_ids=[], emails=[])
    assert len(users) == 0


# ============ User Model Tests ============

@pytest.mark.unit
def test_user_to_dict():
    user = User(
        id=1,
        email="test@example.com",
        first_name="Test",
        last_name="User",
        role="user",
        department="Engineering",
        is_active=True,
        is_verified=True,
        created_at=datetime(2024, 1, 1, 0, 0, 0),
        updated_at=datetime(2024, 1, 1, 0, 0, 0)
    )
    data = user.to_dict()
    assert data["userId"] == 1
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["role"] == "user"
    assert data["department"] == "Engineering"
    assert data["isActive"] is True
    assert data["isVerified"] is True


@pytest.mark.unit
def test_user_to_dict_with_full_name():
    user = User(
        id=1,
        email="test@example.com",
        first_name="John",
        last_name="Doe",
        role="user",
        department="Engineering",
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    data = user.to_dict()
    assert data["name"] == "John Doe"


@pytest.mark.unit
def test_user_to_dict_with_only_first_name():
    user = User(
        id=1,
        email="test@example.com",
        first_name="Bob",
        last_name=None,
        role="user",
        department="Sales",
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    data = user.to_dict()
    assert data["name"] == "Bob"


@pytest.mark.unit
def test_user_to_dict_with_only_last_name():
    user = User(
        id=1,
        email="test@example.com",
        first_name=None,
        last_name="Johnson",
        role="user",
        department="Marketing",
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    data = user.to_dict()
    assert data["name"] == "Johnson"


@pytest.mark.unit
def test_user_to_dict_with_no_name():
    user = User(
        id=1,
        email="test@example.com",
        first_name=None,
        last_name=None,
        role="user",
        department="IT",
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    data = user.to_dict()
    assert data["name"] is None


# ============ Controller/Endpoint Tests ============

@pytest.mark.unit
def test_get_user_by_id_endpoint_success():
    """Test GET /api/users/<id> endpoint"""
    # Note: This requires actual database or further mocking
    # For now, we'll skip this as it requires more complex setup
    pytest.skip("Endpoint test requires database setup")


@pytest.mark.unit
def test_get_user_by_email_endpoint_success():
    """Test GET /api/users/email/<email> endpoint"""
    pytest.skip("Endpoint test requires database setup")


@pytest.mark.unit
def test_get_all_users_endpoint():
    """Test GET /api/users/ endpoint"""
    pytest.skip("Endpoint test requires database setup")


@pytest.mark.unit
def test_filter_users_endpoint():
    """Test POST /api/users/filter endpoint"""
    pytest.skip("Endpoint test requires database setup")


@pytest.mark.unit
def test_filter_endpoint_validation_missing_body():
    """Test POST /api/users/filter with no body returns 400"""
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        resp = client.post("/api/users/filter")
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data
        assert "Request body is required" in data["error"]


@pytest.mark.unit
def test_filter_endpoint_validation_empty_filters():
    """Test POST /api/users/filter with empty object (no userIds or emails) returns 400"""
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        resp = client.post("/api/users/filter", json={})
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data
        assert "At least one of userIds or emails must be provided" in data["error"]


@pytest.mark.unit
def test_filter_endpoint_validation_invalid_type_userIds():
    """Test POST /api/users/filter with non-array userIds returns 400"""
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        resp = client.post("/api/users/filter", json={"userIds": "not-an-array"})
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data
        assert "must be an array" in data["error"]


@pytest.mark.unit
def test_filter_endpoint_validation_invalid_type_emails():
    """Test POST /api/users/filter with non-array emails returns 400"""
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        resp = client.post("/api/users/filter", json={"emails": "not-an-array"})
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data
        assert "must be an array" in data["error"]
