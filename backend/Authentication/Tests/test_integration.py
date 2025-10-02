import pytest
import requests
import time
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch, Mock

from app import create_app
from db import Base, SessionLocal
from Models.User import User
from Repositories.UserRepository import UserRepository
from Services.AuthService import AuthService
from config import Config


@pytest.mark.integration
class TestAuthenticationIntegration:
    """Integration tests for Authentication service"""
    
    @pytest.fixture(scope="class")
    def test_app(self):
        """Create test Flask app with test database"""
        # Create in-memory SQLite database for testing
        test_db_url = "sqlite:///:memory:"
        engine = create_engine(
            test_db_url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Create test app
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = test_db_url
        
        # Override database session
        app.config['DATABASE_SESSION'] = TestingSessionLocal
        
        with app.app_context():
            yield app
        
        # Clean up
        Base.metadata.drop_all(bind=engine)
    
    @pytest.fixture
    def client(self, test_app):
        """Test client"""
        return test_app.test_client()
    
    @pytest.fixture
    def db_session(self, test_app):
        """Database session for testing"""
        with test_app.app_context():
            session = test_app.config['DATABASE_SESSION']()
            yield session
            session.close()
    
    @pytest.fixture
    def sample_user(self, db_session):
        """Create a sample user for testing"""
        user = User(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            is_active=True,
            is_verified=True,
            role="user",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user
    
    def test_health_endpoint(self, client):
        """Test health endpoint"""
        response = client.get('/api/auth/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert 'message' in data
    
    def test_db_health_endpoint(self, client, sample_user):
        """Test database health endpoint"""
        response = client.get('/api/auth/db-health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert data['user_count'] >= 1
        assert 'message' in data
    
    def test_login_endpoint(self, client):
        """Test login endpoint returns OAuth URL"""
        response = client.get('/api/auth/login')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'auth_url' in data
        assert 'state' in data
        assert 'https://accounts.google.com/o/oauth2/v2/auth' in data['auth_url']
        assert 'client_id=' in data['auth_url']
        assert 'redirect_uri=' in data['auth_url']
        assert 'scope=openid+email+profile' in data['auth_url']
        assert 'response_type=code' in data['auth_url']
        assert 'code_challenge=' in data['auth_url']
        assert 'code_challenge_method=S256' in data['auth_url']
    
    def test_logout_endpoint(self, client):
        """Test logout endpoint"""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Logged out successfully'
    
    def test_user_endpoint_not_authenticated(self, client):
        """Test user endpoint when not authenticated"""
        response = client.get('/api/auth/user')
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert 'Not authenticated' in data['error']
    
    def test_validate_token_endpoint_missing_token(self, client):
        """Test validate token endpoint with missing token"""
        response = client.post('/api/auth/validate-token', json={})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'Access token required' in data['error']
    
    def test_callback_endpoint_missing_data(self, client):
        """Test callback endpoint with missing data"""
        response = client.post('/api/auth/callback', json={})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_callback_endpoint_invalid_state(self, client):
        """Test callback endpoint with invalid state"""
        response = client.post('/api/auth/callback', json={
            'code': 'test_code',
            'state': 'invalid_state'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'Invalid state parameter' in data['error']
    
    @patch('Services.AuthService.AuthService.exchange_code_for_tokens')
    @patch('Services.AuthService.AuthService.get_user_from_token')
    def test_callback_endpoint_user_not_found(self, mock_get_user, mock_exchange, client):
        """Test callback endpoint when user is not found in database"""
        # Mock OAuth service responses
        mock_exchange.return_value = {'access_token': 'test_token'}
        mock_get_user.return_value = {
            'email': 'nonexistent@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        # Mock session state
        with client.session_transaction() as sess:
            sess['oauth_state'] = 'test_state'
            sess['code_verifier'] = 'test_verifier'
        
        response = client.post('/api/auth/callback', json={
            'code': 'test_code',
            'state': 'test_state'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert 'User not found in database' in data['error']
    
    @patch('Services.AuthService.AuthService.exchange_code_for_tokens')
    @patch('Services.AuthService.AuthService.get_user_from_token')
    def test_callback_endpoint_success(self, mock_get_user, mock_exchange, client, sample_user):
        """Test successful OAuth callback"""
        # Mock OAuth service responses
        mock_exchange.return_value = {'access_token': 'test_token'}
        mock_get_user.return_value = {
            'email': sample_user.email,
            'first_name': sample_user.first_name,
            'last_name': sample_user.last_name
        }
        
        # Mock session state
        with client.session_transaction() as sess:
            sess['oauth_state'] = 'test_state'
            sess['code_verifier'] = 'test_verifier'
        
        response = client.post('/api/auth/callback', json={
            'code': 'test_code',
            'state': 'test_state'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Authentication successful'
        assert 'user' in data
        assert data['user']['email'] == sample_user.email
        assert data['user']['first_name'] == sample_user.first_name
        assert data['user']['last_name'] == sample_user.last_name
    
    @patch('Services.AuthService.AuthService.exchange_code_for_tokens')
    @patch('Services.AuthService.AuthService.get_user_from_token')
    def test_callback_endpoint_oauth_error(self, mock_get_user, mock_exchange, client):
        """Test callback endpoint with OAuth service error"""
        # Mock OAuth service to raise exception
        mock_exchange.side_effect = ValueError("OAuth error")
        
        # Mock session state
        with client.session_transaction() as sess:
            sess['oauth_state'] = 'test_state'
            sess['code_verifier'] = 'test_verifier'
        
        response = client.post('/api/auth/callback', json={
            'code': 'test_code',
            'state': 'test_state'
        })
        
        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data
    
    def test_user_repository_integration(self, db_session):
        """Test UserRepository with real database"""
        user_repo = UserRepository(db_session)
        
        # Test creating a user
        user = user_repo.create_user(
            email="integration@example.com",
            first_name="Integration",
            last_name="Test"
        )
        
        assert user.email == "integration@example.com"
        assert user.first_name == "Integration"
        assert user.last_name == "Test"
        assert user.is_active is True
        assert user.is_verified is True
        assert user.role == "user"
        assert user.id is not None
        assert user.created_at is not None
        assert user.updated_at is not None
        
        # Test getting user by email
        found_user = user_repo.get_user_by_email("integration@example.com")
        assert found_user is not None
        assert found_user.id == user.id
        assert found_user.email == user.email
        
        # Test getting user by ID
        found_user_by_id = user_repo.get_user_by_id(user.id)
        assert found_user_by_id is not None
        assert found_user_by_id.email == user.email
        
        # Test updating user login
        updated_user = user_repo.update_user_login(user.id)
        assert updated_user.last_login is not None
        assert updated_user.updated_at > user.updated_at
        
        # Test updating user info
        updated_user = user_repo.update_user_info(
            user_id=user.id,
            first_name="Updated",
            last_name="Name"
        )
        assert updated_user.first_name == "Updated"
        assert updated_user.last_name == "Name"
        assert updated_user.updated_at > user.updated_at
    
    def test_user_repository_duplicate_email(self, db_session):
        """Test UserRepository with duplicate email"""
        user_repo = UserRepository(db_session)
        
        # Create first user
        user1 = user_repo.create_user(
            email="duplicate@example.com",
            first_name="First",
            last_name="User"
        )
        
        # Try to create second user with same email
        with pytest.raises(Exception):  # Should raise ValidationError
            user_repo.create_user(
                email="duplicate@example.com",
                first_name="Second",
                last_name="User"
            )
    
    def test_user_repository_get_or_create(self, db_session):
        """Test UserRepository get_or_create functionality"""
        user_repo = UserRepository(db_session)
        
        # Test getting existing user
        user1 = user_repo.create_user(
            email="getorcreate@example.com",
            first_name="Test",
            last_name="User"
        )
        
        # Test get_or_create with existing user
        user2 = user_repo.get_or_create_user(
            email="getorcreate@example.com",
            first_name="Test",
            last_name="User"
        )
        
        assert user1.id == user2.id
        assert user1.email == user2.email
        
        # Test get_or_create with new user
        user3 = user_repo.get_or_create_user(
            email="newuser@example.com",
            first_name="New",
            last_name="User"
        )
        
        assert user3.email == "newuser@example.com"
        assert user3.first_name == "New"
        assert user3.last_name == "User"
        assert user3.id != user1.id
    
    def test_auth_service_pkce_generation(self):
        """Test OAuth service PKCE generation"""
        auth_service = AuthService()
        
        # Test PKCE pair generation
        code_verifier, code_challenge = auth_service.generate_pkce_pair()
        
        assert isinstance(code_verifier, str)
        assert len(code_verifier) >= 43
        assert len(code_verifier) <= 128
        
        assert isinstance(code_challenge, str)
        assert len(code_challenge) == 43  # SHA256 base64url encoded
        
        # Test auth URL generation
        auth_url, verifier = auth_service.generate_auth_url("test_state")
        
        assert "https://accounts.google.com/o/oauth2/v2/auth" in auth_url
        assert "client_id=" in auth_url
        assert "redirect_uri=" in auth_url
        assert "scope=openid+email+profile" in auth_url
        assert "response_type=code" in auth_url
        assert "code_challenge=" in auth_url
        assert "code_challenge_method=S256" in auth_url
        assert "state=test_state" in auth_url
        assert isinstance(verifier, str)
    
    @patch('requests.post')
    def test_auth_service_token_exchange(self, mock_post):
        """Test OAuth service token exchange"""
        # Mock successful response
        mock_response = Mock()
        mock_response.json.return_value = {
            'access_token': 'test_access_token',
            'token_type': 'Bearer',
            'expires_in': 3600,
            'refresh_token': 'test_refresh_token'
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        auth_service = AuthService()
        result = auth_service.exchange_code_for_tokens("test_code", "test_verifier")
        
        assert result['access_token'] == 'test_access_token'
        assert result['token_type'] == 'Bearer'
        assert result['expires_in'] == 3600
        assert result['refresh_token'] == 'test_refresh_token'
    
    @patch('requests.get')
    def test_auth_service_user_info(self, mock_get):
        """Test OAuth service user info retrieval"""
        # Mock successful response
        mock_response = Mock()
        mock_response.json.return_value = {
            'id': '123456789',
            'email': 'test@example.com',
            'verified_email': True,
            'name': 'Test User',
            'given_name': 'Test',
            'family_name': 'User',
            'picture': 'https://example.com/picture.jpg'
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        auth_service = AuthService()
        result = auth_service.get_user_info("test_access_token")
        
        assert result['email'] == 'test@example.com'
        assert result['verified_email'] is True
        assert result['given_name'] == 'Test'
        assert result['family_name'] == 'User'
        assert result['picture'] == 'https://example.com/picture.jpg'
    
    def test_auth_service_user_from_token(self):
        """Test OAuth service user extraction from token"""
        auth_service = AuthService()
        
        with patch.object(auth_service, 'get_user_info') as mock_get_user_info:
            mock_get_user_info.return_value = {
                'id': '123456789',
                'email': 'test@example.com',
                'verified_email': True,
                'given_name': 'Test',
                'family_name': 'User',
                'picture': 'https://example.com/picture.jpg'
            }
            
            result = auth_service.get_user_from_token("test_access_token")
            
            assert result['email'] == 'test@example.com'
            assert result['first_name'] == 'Test'
            assert result['last_name'] == 'User'
            assert result['google_id'] == '123456789'
            assert result['picture'] == 'https://example.com/picture.jpg'
    
    def test_auth_service_unverified_email(self):
        """Test OAuth service with unverified email"""
        auth_service = AuthService()
        
        with patch.object(auth_service, 'get_user_info') as mock_get_user_info:
            mock_get_user_info.return_value = {
                'id': '123456789',
                'email': 'test@example.com',
                'verified_email': False,
                'given_name': 'Test',
                'family_name': 'User'
            }
            
            with pytest.raises(ValueError, match="Email not verified by Google"):
                auth_service.get_user_from_token("test_access_token")
    
    def test_auth_service_missing_email(self):
        """Test OAuth service with missing email"""
        auth_service = AuthService()
        
        with patch.object(auth_service, 'get_user_info') as mock_get_user_info:
            mock_get_user_info.return_value = {
                'id': '123456789',
                'verified_email': True,
                'given_name': 'Test',
                'family_name': 'User'
            }
            
            with pytest.raises(ValueError, match="Email not found in user info"):
                auth_service.get_user_from_token("test_access_token")
    
    def test_full_authentication_flow(self, client, db_session):
        """Test complete authentication flow"""
        # Create a user in the database
        user_repo = UserRepository(db_session)
        user = user_repo.create_user(
            email="flowtest@example.com",
            first_name="Flow",
            last_name="Test"
        )
        
        # Mock OAuth service responses
        with patch('Services.AuthService.AuthService.exchange_code_for_tokens') as mock_exchange, \
             patch('Services.AuthService.AuthService.get_user_from_token') as mock_get_user:
            
            mock_exchange.return_value = {'access_token': 'test_token'}
            mock_get_user.return_value = {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
            
            # Mock session state
            with client.session_transaction() as sess:
                sess['oauth_state'] = 'test_state'
                sess['code_verifier'] = 'test_verifier'
            
            # Test callback
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': 'test_state'
            })
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['message'] == 'Authentication successful'
            assert data['user']['email'] == user.email
            
            # Test user endpoint (should be authenticated now)
            with client.session_transaction() as sess:
                sess['user_id'] = user.id
            
            response = client.get('/api/auth/user')
            assert response.status_code == 200
            data = response.get_json()
            assert data['email'] == user.email
            
            # Test logout
            response = client.post('/api/auth/logout')
            assert response.status_code == 200
            
            # Test user endpoint after logout (should not be authenticated)
            response = client.get('/api/auth/user')
            assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__])
