import pytest
import requests
from unittest.mock import patch, MagicMock, Mock
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from Services.AuthService import AuthService
from Repositories.UserRepository import UserRepository
from Models.User import User
from Controllers.AuthController import bp as auth_bp
from exceptions import ValidationError, AuthenticationError

@pytest.mark.unit
class TestAuthService:
    """Test OAuth service functionality"""
    
    def test_generate_pkce_pair(self):
        """Test PKCE code verifier and challenge generation"""
        auth_service = AuthService()
        code_verifier, code_challenge = auth_service.generate_pkce_pair()
        
        # Verify code verifier is URL-safe base64
        assert isinstance(code_verifier, str)
        assert len(code_verifier) >= 43
        assert len(code_verifier) <= 128
        
        # Verify code challenge is URL-safe base64
        assert isinstance(code_challenge, str)
        assert len(code_challenge) == 43  # SHA256 base64url encoded
        
    def test_generate_auth_url(self):
        """Test OAuth authorization URL generation"""
        auth_service = AuthService()
        auth_url, code_verifier = auth_service.generate_auth_url("test_state")
        
        assert "https://accounts.google.com/o/oauth2/v2/auth" in auth_url
        assert "client_id=" in auth_url
        assert "redirect_uri=" in auth_url
        assert "scope=openid+email+profile" in auth_url
        assert "response_type=code" in auth_url
        assert "code_challenge=" in auth_url
        assert "code_challenge_method=S256" in auth_url
        assert "state=test_state" in auth_url
        assert isinstance(code_verifier, str)
        
    @patch('requests.post')
    def test_exchange_code_for_tokens_success(self, mock_post):
        """Test successful token exchange"""
        # Mock successful response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'access_token': 'test_access_token',
            'token_type': 'Bearer',
            'expires_in': 3600
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        auth_service = AuthService()
        result = auth_service.exchange_code_for_tokens("test_code", "test_verifier")
        
        assert result['access_token'] == 'test_access_token'
        assert result['token_type'] == 'Bearer'
        assert result['expires_in'] == 3600
        
    @patch('requests.post')
    def test_exchange_code_for_tokens_failure(self, mock_post):
        """Test token exchange failure"""
        # Mock failed response
        mock_post.side_effect = requests.exceptions.RequestException("Network error")
        
        auth_service = AuthService()
        
        with pytest.raises(ValueError, match="Failed to exchange code for tokens"):
            auth_service.exchange_code_for_tokens("test_code", "test_verifier")
            
    @patch('requests.get')
    def test_get_user_info_success(self, mock_get):
        """Test successful user info retrieval"""
        # Mock successful response
        mock_response = MagicMock()
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
        
    @patch('requests.get')
    def test_get_user_info_failure(self, mock_get):
        """Test user info retrieval failure"""
        # Mock failed response
        mock_get.side_effect = requests.exceptions.RequestException("Network error")
        
        auth_service = AuthService()
        
        with pytest.raises(ValueError, match="Failed to get user info"):
            auth_service.get_user_info("test_access_token")
            
    def test_get_user_from_token_success(self):
        """Test successful user extraction from token"""
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
            
    def test_get_user_from_token_unverified_email(self):
        """Test user extraction with unverified email"""
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
                
    def test_get_user_from_token_missing_email(self):
        """Test user extraction with missing email"""
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


@pytest.mark.unit
class TestUserRepository:
    """Test User repository functionality"""
    
    @pytest.fixture
    def mock_session(self):
        """Mock database session"""
        return Mock(spec=Session)
    
    @pytest.fixture
    def user_repo(self, mock_session):
        """User repository with mocked session"""
        return UserRepository(mock_session)
    
    def test_get_user_by_email(self, user_repo, mock_session):
        """Test getting user by email"""
        # Mock user object
        mock_user = User(
            id=1,
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        
        # Mock query result
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_user
        mock_session.query.return_value = mock_query
        
        result = user_repo.get_user_by_email("test@example.com")
        
        assert result == mock_user
        mock_session.query.assert_called_once_with(User)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()
    
    def test_get_user_by_email_not_found(self, user_repo, mock_session):
        """Test getting user by email when user doesn't exist"""
        # Mock query result returning None
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_session.query.return_value = mock_query
        
        result = user_repo.get_user_by_email("nonexistent@example.com")
        
        assert result is None
    
    def test_get_user_by_id(self, user_repo, mock_session):
        """Test getting user by ID"""
        mock_user = User(
            id=1,
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_user
        mock_session.query.return_value = mock_query
        
        result = user_repo.get_user_by_id(1)
        
        assert result == mock_user
        mock_session.query.assert_called_once_with(User)
    
    def test_create_user_not_implemented(self, user_repo, mock_session):
        """Test that user creation is not implemented (read-only service)"""
        # User creation should not be available in read-only mode
        with pytest.raises(AttributeError):
            user_repo.create_user(
                email="test@example.com",
                first_name="Test",
                last_name="User"
            )
    
    def test_create_user_duplicate_email_not_implemented(self, user_repo, mock_session):
        """Test that user creation with duplicate email is not implemented (read-only service)"""
        # User creation should not be available in read-only mode
        with pytest.raises(AttributeError):
            user_repo.create_user(email="duplicate@example.com")
    
    def test_get_or_create_user_not_implemented(self, user_repo, mock_session):
        """Test that get_or_create_user is not implemented (read-only service)"""
        # get_or_create_user should not be available in read-only mode
        with pytest.raises(AttributeError):
            user_repo.get_or_create_user(
                email="test@example.com",
                first_name="Test",
                last_name="User"
            )
    
    def test_get_or_create_user_new_not_implemented(self, user_repo, mock_session):
        """Test that get_or_create_user with new user is not implemented (read-only service)"""
        # get_or_create_user should not be available in read-only mode
        with pytest.raises(AttributeError):
            user_repo.get_or_create_user(
                email="new@example.com",
                first_name="New",
                last_name="User"
            )
    
    def test_update_user_login_not_implemented(self, user_repo, mock_session):
        """Test that update_user_login is not implemented (read-only service)"""
        # update_user_login should not be available in read-only mode
        with pytest.raises(AttributeError):
            user_repo.update_user_login(1)
    
    def test_update_user_login_not_found_not_implemented(self, user_repo, mock_session):
        """Test that update_user_login for non-existent user is not implemented (read-only service)"""
        # update_user_login should not be available in read-only mode
        with pytest.raises(AttributeError):
            user_repo.update_user_login(999)
    
    def test_update_user_info_not_implemented(self, user_repo, mock_session):
        """Test that update_user_info is not implemented (read-only service)"""
        # update_user_info should not be available in read-only mode
        with pytest.raises(AttributeError):
            user_repo.update_user_info(
                user_id=1,
                first_name="New",
                last_name="Name"
            )


@pytest.mark.unit
class TestUserModel:
    """Test User model functionality (read-only service)"""
    
    def test_user_model_import(self):
        """Test that User model can be imported (read-only service)"""
        # In a read-only service, we only need to verify the model can be imported
        # for database queries, not for creating new instances
        from Models.User import User
        assert User is not None
        print("✓ User model import successful for read-only operations")


@pytest.mark.unit
class TestAuthController:
    """Test Authentication Controller functionality"""
    
    @pytest.fixture
    def mock_app(self):
        """Mock Flask app"""
        from flask import Flask
        app = Flask(__name__)
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.config['TESTING'] = True
        return app
    
    @pytest.fixture
    def client(self, mock_app):
        """Test client"""
        return mock_app.test_client()
    
    @patch('Controllers.AuthController.AuthService')
    @patch('Controllers.AuthController.UserRepository')
    def test_login_endpoint(self, mock_user_repo, mock_auth_service, client):
        """Test login endpoint"""
        # Mock OAuth service
        mock_auth_instance = Mock()
        mock_auth_instance.generate_auth_url.return_value = (
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=test&scope=openid+email+profile&response_type=code&code_challenge=test&code_challenge_method=S256&state=test_state",
            "test_verifier"
        )
        mock_auth_service.return_value = mock_auth_instance
        
        # Mock user repository
        mock_user_repo_instance = Mock()
        mock_user_repo.return_value = mock_user_repo_instance
        
        response = client.get('/api/auth/login')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'auth_url' in data
        assert 'state' in data
        assert 'https://accounts.google.com/o/oauth2/v2/auth' in data['auth_url']
    
    @patch('Controllers.AuthController.AuthService')
    @patch('Controllers.AuthController.UserRepository')
    def test_callback_endpoint_success(self, mock_user_repo, mock_auth_service, client):
        """Test successful OAuth callback"""
        # Mock OAuth service
        mock_auth_instance = Mock()
        mock_auth_instance.exchange_code_for_tokens.return_value = {
            'access_token': 'test_token'
        }
        mock_auth_instance.get_user_from_token.return_value = {
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
        mock_auth_service.return_value = mock_auth_instance
        
        # Mock user repository
        mock_user_repo_instance = Mock()
        mock_user = User(
            id=1,
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        mock_user_repo_instance.get_user_by_email.return_value = mock_user
        mock_user_repo.return_value = mock_user_repo_instance
        
        # Mock session
        with patch('Controllers.AuthController.session') as mock_session:
            mock_session.get.return_value = 'test_state'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': 'test_state'
            })
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['message'] == 'Authentication successful'
            assert 'user' in data
    
    @patch('Controllers.AuthController.AuthService')
    @patch('Controllers.AuthController.UserRepository')
    def test_callback_endpoint_invalid_state(self, mock_user_repo, mock_auth_service, client):
        """Test OAuth callback with invalid state"""
        # Mock session
        with patch('Controllers.AuthController.session') as mock_session:
            mock_session.get.return_value = 'different_state'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': 'test_state'
            })
            
            assert response.status_code == 400
            data = response.get_json()
            assert 'error' in data
            assert 'Invalid state parameter' in data['error']
    
    @patch('Controllers.AuthController.AuthService')
    @patch('Controllers.AuthController.UserRepository')
    def test_callback_endpoint_user_not_found(self, mock_user_repo, mock_auth_service, client):
        """Test OAuth callback when user is not found in database"""
        # Mock OAuth service
        mock_auth_instance = Mock()
        mock_auth_instance.exchange_code_for_tokens.return_value = {
            'access_token': 'test_token'
        }
        mock_auth_instance.get_user_from_token.return_value = {
            'email': 'nonexistent@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
        mock_auth_service.return_value = mock_auth_instance
        
        # Mock user repository
        mock_user_repo_instance = Mock()
        mock_user_repo_instance.get_user_by_email.return_value = None
        mock_user_repo.return_value = mock_user_repo_instance
        
        # Mock session
        with patch('Controllers.AuthController.session') as mock_session:
            mock_session.get.return_value = 'test_state'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': 'test_state'
            })
            
            assert response.status_code == 401
            data = response.get_json()
            assert 'error' in data
            assert 'User not found in database' in data['error']
    
    @patch('Controllers.AuthController.AuthService')
    def test_callback_endpoint_oauth_error(self, mock_auth_service, client):
        """Test OAuth callback with OAuth service error"""
        # Mock OAuth service to raise exception
        mock_auth_instance = Mock()
        mock_auth_instance.exchange_code_for_tokens.side_effect = ValueError("OAuth error")
        mock_auth_service.return_value = mock_auth_instance
        
        # Mock session
        with patch('Controllers.AuthController.session') as mock_session:
            mock_session.get.return_value = 'test_state'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': 'test_state'
            })
            
            assert response.status_code == 500
            data = response.get_json()
            assert 'error' in data
    
    def test_logout_endpoint(self, client):
        """Test logout endpoint"""
        with patch('Controllers.AuthController.session') as mock_session:
            response = client.post('/api/auth/logout')
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['message'] == 'Logged out successfully'
            mock_session.clear.assert_called_once()
    
    def test_user_endpoint_authenticated(self, client):
        """Test user endpoint when authenticated"""
        mock_user = User(
            id=1,
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        
        with patch('Controllers.AuthController.session') as mock_session:
            mock_session.get.return_value = 1  # user_id
            
            with patch('Controllers.AuthController.UserRepository') as mock_user_repo:
                mock_user_repo_instance = Mock()
                mock_user_repo_instance.get_user_by_id.return_value = mock_user
                mock_user_repo.return_value = mock_user_repo_instance
                
                response = client.get('/api/auth/user')
                
                assert response.status_code == 200
                data = response.get_json()
                assert data['email'] == 'test@example.com'
                assert data['first_name'] == 'Test'
                assert data['last_name'] == 'User'
    
    def test_user_endpoint_not_authenticated(self, client):
        """Test user endpoint when not authenticated"""
        with patch('Controllers.AuthController.session') as mock_session:
            mock_session.get.return_value = None
            
            response = client.get('/api/auth/user')
            
            assert response.status_code == 401
            data = response.get_json()
            assert 'error' in data
            assert 'Not authenticated' in data['error']
    
    def test_health_endpoint(self, client):
        """Test health endpoint"""
        response = client.get('/api/auth/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert 'message' in data
    
    @patch('Controllers.AuthController.User')
    def test_db_health_endpoint(self, mock_user, client):
        """Test database health endpoint"""
        # Mock database query
        mock_query = Mock()
        mock_query.count.return_value = 5
        mock_user.query.count.return_value = 5
        
        with patch('Controllers.AuthController.User', mock_user):
            response = client.get('/api/auth/db-health')
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'healthy'
            assert data['user_count'] == 5
            assert 'message' in data
    
    def test_validate_token_endpoint(self, client):
        """Test validate token endpoint"""
        with patch('Controllers.AuthController.AuthService') as mock_auth_service:
            mock_auth_instance = Mock()
            mock_auth_instance.validate_token.return_value = True
            mock_auth_service.return_value = mock_auth_instance
            
            response = client.post('/api/auth/validate-token', json={
                'access_token': 'test_token'
            })
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['valid'] is True
    
    def test_validate_token_endpoint_missing_token(self, client):
        """Test validate token endpoint with missing token"""
        response = client.post('/api/auth/validate-token', json={})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'Access token required' in data['error']


if __name__ == "__main__":
    pytest.main([__file__])
