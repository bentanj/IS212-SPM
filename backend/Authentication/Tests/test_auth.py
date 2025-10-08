import pytest
import requests
from unittest.mock import patch, MagicMock, Mock
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import time

from ..Services.AuthService import AuthService
from ..Services.JWTService import JWTService
from ..Repositories.UserRepository import UserRepository
from ..Models.User import User
from ..Controllers.AuthController import bp as auth_bp
from ..exceptions import ValidationError, AuthenticationError

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
        from ..Models.User import User
        assert User is not None
        print("User model import successful for read-only operations")


@pytest.mark.unit
class TestAuthController:
    """Test Authentication Controller functionality"""
    
    @pytest.fixture
    def mock_app(self):
        """Mock Flask app"""
        from flask import Flask, g
        from unittest.mock import Mock
        
        app = Flask(__name__)
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test-secret-key'
        
        # Mock database session
        @app.before_request
        def before_request():
            g.db_session = Mock()
            # Mock the query method for health endpoint
            mock_query = Mock()
            mock_query.count.return_value = 5
            g.db_session.query.return_value = mock_query
        
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        return app
    
    @pytest.fixture
    def client(self, mock_app):
        """Test client"""
        return mock_app.test_client()
    
    @patch('Authentication.Controllers.AuthController.AuthService')
    @patch('Authentication.Controllers.AuthController.UserRepository')
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
    
    @patch('Authentication.Controllers.AuthController.AuthService')
    @patch('Authentication.Controllers.AuthController.UserRepository')
    def test_callback_endpoint_success(self, mock_user_repo, mock_auth_service, client):
        """Test successful OAuth callback"""
        # Mock OAuth service
        mock_auth_instance = Mock()
        mock_auth_instance.generate_auth_url.return_value = (
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=test&scope=openid+email+profile&response_type=code&code_challenge=test&code_challenge_method=S256&state=test_state",
            "test_verifier"
        )
        mock_auth_instance.exchange_code_for_tokens.return_value = {
            'access_token': 'test_token'
        }
        mock_auth_instance.get_user_from_token.return_value = {
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
        mock_auth_instance.generate_jwt_tokens.return_value = (
            'jwt_access_token',
            'jwt_refresh_token'
        )
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
        
        # First, get the state from login endpoint (with mocked AuthService)
        login_response = client.get('/api/auth/login')
        login_data = login_response.get_json()
        state = login_data['state']
        
        # Test with session context
        with client.session_transaction() as sess:
            sess['oauth_state'] = state
            sess['code_verifier'] = 'test_verifier'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': state
            })
            
            assert response.status_code == 200
            data = response.get_json()
            assert 'user' in data
            assert 'access_token' in data
            assert 'refresh_token' in data
            assert 'token_type' in data
            assert 'expires_in' in data
            assert data['user']['email'] == 'test@example.com'
    
    @patch('Authentication.Controllers.AuthController.AuthService')
    @patch('Authentication.Controllers.AuthController.UserRepository')
    def test_callback_endpoint_invalid_state(self, mock_user_repo, mock_auth_service, client):
        """Test OAuth callback with invalid state"""
        # Test with session context
        with client.session_transaction() as sess:
            sess['oauth_state'] = 'different_state'
            sess['code_verifier'] = 'test_verifier'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': 'test_state'
            })
            
            assert response.status_code == 401
            data = response.get_json()
            assert 'error' in data
            assert 'Invalid state parameter' in data['error']
    
    @patch('Authentication.Controllers.AuthController.AuthService')
    @patch('Authentication.Controllers.AuthController.UserRepository')
    def test_callback_endpoint_user_not_found(self, mock_user_repo, mock_auth_service, client):
        """Test OAuth callback when user is not found in database"""
        # Mock OAuth service
        mock_auth_instance = Mock()
        mock_auth_instance.generate_auth_url.return_value = (
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=test&scope=openid+email+profile&response_type=code&code_challenge=test&code_challenge_method=S256&state=test_state",
            "test_verifier"
        )
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
        
        # First, get the state from login endpoint
        login_response = client.get('/api/auth/login')
        login_data = login_response.get_json()
        state = login_data['state']
        
        # Test with session context
        with client.session_transaction() as sess:
            sess['oauth_state'] = state
            sess['code_verifier'] = 'test_verifier'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': state
            })
            
            assert response.status_code == 401
            data = response.get_json()
            assert 'error' in data
            assert 'User not found in database' in data['error']
    
    @patch('Authentication.Controllers.AuthController.AuthService')
    def test_callback_endpoint_oauth_error(self, mock_auth_service, client):
        """Test OAuth callback with OAuth service error"""
        # Mock OAuth service to raise exception
        mock_auth_instance = Mock()
        mock_auth_instance.generate_auth_url.return_value = (
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=test&scope=openid+email+profile&response_type=code&code_challenge=test&code_challenge_method=S256&state=test_state",
            "test_verifier"
        )
        mock_auth_instance.exchange_code_for_tokens.side_effect = ValueError("OAuth error")
        mock_auth_service.return_value = mock_auth_instance
        
        # First, get the state from login endpoint
        login_response = client.get('/api/auth/login')
        login_data = login_response.get_json()
        state = login_data['state']
        
        # Test with session context
        with client.session_transaction() as sess:
            sess['oauth_state'] = state
            sess['code_verifier'] = 'test_verifier'
            
            response = client.post('/api/auth/callback', json={
                'code': 'test_code',
                'state': state
            })
            
            assert response.status_code == 500
            data = response.get_json()
            assert 'error' in data
    
    def test_logout_endpoint(self, client):
        """Test logout endpoint"""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Logged out successfully'
    
    def test_user_endpoint_authenticated(self, client):
        """Test user endpoint when authenticated"""
        mock_user = User(
            id=1,
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        
        with patch('Authentication.Controllers.AuthController.UserRepository') as mock_user_repo:
            mock_user_repo_instance = Mock()
            mock_user_repo_instance.get_user_by_id.return_value = mock_user
            mock_user_repo.return_value = mock_user_repo_instance
            
            # Set session and make request in the same context
            with client.session_transaction() as sess:
                sess['user_id'] = 1
            
            response = client.get('/api/auth/user')
            
            assert response.status_code == 200
            data = response.get_json()
            assert data['user']['email'] == 'test@example.com'
            assert data['user']['first_name'] == 'Test'
            assert data['user']['last_name'] == 'User'
    
    def test_user_endpoint_not_authenticated(self, client):
        """Test user endpoint when not authenticated"""
        # Don't set any session data - should result in not authenticated
        response = client.get('/api/auth/user')
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert 'Not authenticated' in data['error']
    
    def test_health_endpoint(self, client):
        """Test health endpoint"""
        # The test app already sets up g.db_session with mocked query in before_request
        response = client.get('/api/auth/db-health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert data['user_count'] == 5
        assert 'message' in data
    
    def test_db_health_endpoint(self, client):
        """Test database health endpoint"""
        # The test app already sets up g.db_session with mocked query in before_request
        response = client.get('/api/auth/db-health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert data['user_count'] == 5
        assert 'message' in data
    
    def test_validate_token_endpoint(self, client):
        """Test validate token endpoint"""
        with patch('Authentication.Controllers.AuthController.AuthService') as mock_auth_service:
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


@pytest.mark.unit
class TestSessionAndTokenStateChanges:
    """Test session and token state changes (before/after)"""
    
    @pytest.fixture
    def mock_app(self):
        """Mock Flask app"""
        from flask import Flask, g
        
        app = Flask(__name__)
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test-secret-key'
        
        @app.before_request
        def before_request():
            g.db_session = Mock()
        
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        return app
    
    @pytest.fixture
    def client(self, mock_app):
        """Test client"""
        return mock_app.test_client()
    
    @pytest.fixture
    def jwt_service(self):
        """JWT service with test secrets"""
        import os
        os.environ['JWT_SECRET'] = 'test-jwt-secret-key'
        os.environ['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-key'
        return JWTService()
    
    def test_login_changes_session_state(self, client):
        """Verify session state before and after login"""
        # BEFORE: Empty session
        with client.session_transaction() as sess:
            initial_user_id = sess.get('user_id')
            initial_oauth_state = sess.get('oauth_state')
            assert initial_user_id is None
            assert initial_oauth_state is None
        
        # Perform login (mock the full flow)
        with patch('Authentication.Controllers.AuthController.AuthService') as mock_auth_service:
            with patch('Authentication.Controllers.AuthController.UserRepository') as mock_user_repo:
                # Setup mocks
                mock_auth_instance = Mock()
                mock_auth_instance.generate_auth_url.return_value = (
                    "https://accounts.google.com/o/oauth2/v2/auth?state=test_state",
                    "test_verifier"
                )
                mock_auth_instance.exchange_code_for_tokens.return_value = {
                    'access_token': 'test_token'
                }
                mock_auth_instance.get_user_from_token.return_value = {
                    'email': 'test@example.com',
                    'first_name': 'Test',
                    'last_name': 'User'
                }
                mock_auth_instance.generate_jwt_tokens.return_value = (
                    'jwt_access_token',
                    'jwt_refresh_token'
                )
                mock_auth_service.return_value = mock_auth_instance
                
                mock_user = User(id=1, email='test@example.com', first_name='Test', last_name='User')
                mock_user_repo_instance = Mock()
                mock_user_repo_instance.get_user_by_email.return_value = mock_user
                mock_user_repo.return_value = mock_user_repo_instance
                
                # Get login state
                login_response = client.get('/api/auth/login')
                state = login_response.get_json()['state']
                
                # Complete callback
                with client.session_transaction() as sess:
                    sess['oauth_state'] = state
                    sess['code_verifier'] = 'test_verifier'
                
                response = client.post('/api/auth/callback', json={
                    'code': 'test_code',
                    'state': state
                })
        
        # AFTER: Session should contain user data
        with client.session_transaction() as sess:
            final_user_id = sess.get('user_id')
            assert final_user_id is not None
            assert final_user_id == 1
    
    def test_logout_clears_session_state(self, client):
        """Verify session cleared before and after logout"""
        # BEFORE: Set up authenticated session
        with client.session_transaction() as sess:
            sess['user_id'] = 1
            sess['oauth_state'] = 'test_state'
            sess['code_verifier'] = 'test_verifier'
            # Verify session is populated
            assert sess.get('user_id') == 1
            assert 'oauth_state' in sess
            assert 'code_verifier' in sess
        
        # Perform logout
        response = client.post('/api/auth/logout')
        assert response.status_code == 200
        
        # AFTER: Session should be cleared
        with client.session_transaction() as sess:
            assert sess.get('user_id') is None
            assert sess.get('oauth_state') is None
            assert sess.get('code_verifier') is None
    
    def test_refresh_creates_new_token(self, jwt_service):
        """Verify new token created during refresh"""
        user_data = {
            'id': 1,
            'email': 'test@example.com',
            'role': 'user',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        # BEFORE: Generate initial tokens
        old_access_token, refresh_token = jwt_service.generate_token_pair(user_data)
        old_payload = jwt_service.decode_access_token(old_access_token)
        old_exp = old_payload['exp']
        old_iat = old_payload['iat']
        
        # Wait to ensure different timestamps
        time.sleep(1)
        
        # Perform refresh with user data
        new_access_token = jwt_service.refresh_access_token(refresh_token, user_data)
        
        # AFTER: Verify new token is different
        new_payload = jwt_service.decode_access_token(new_access_token)
        new_exp = new_payload['exp']
        new_iat = new_payload['iat']
        
        # Tokens should be different
        assert new_access_token != old_access_token

        # New token should have later timestamps
        assert new_iat > old_iat
        assert new_exp > old_exp
        
        # User data should remain the same
        assert new_payload['user_id'] == old_payload['user_id']
        assert new_payload['email'] == old_payload['email']
        assert new_payload['role'] == old_payload['role']
    
    def test_token_validity_before_after_expiration(self, jwt_service):
        """Test token validity changes after expiration"""
        import jwt as pyjwt
        
        # Create token with short expiration (2 seconds for testing)
        payload = {
            'user_id': 1,
            'email': 'test@example.com',
            'role': 'user',
            'exp': datetime.now(timezone.utc) + timedelta(seconds=2),
            'iat': datetime.now(timezone.utc),
            'type': 'access'
        }
        
        token = pyjwt.encode(payload, jwt_service.jwt_secret, algorithm='HS256')
        
        # BEFORE expiration: Token should be valid
        decoded = jwt_service.decode_access_token(token)
        assert decoded['user_id'] == 1
        assert decoded['email'] == 'test@example.com'
        
        # Wait for expiration
        time.sleep(3)
        
        # AFTER expiration: Token should be invalid
        with pytest.raises(Exception):
            jwt_service.decode_access_token(token)
    
    def test_callback_populates_session_with_user_data(self, client):
        """Test that OAuth callback populates session with user data"""
        with patch('Authentication.Controllers.AuthController.AuthService') as mock_auth_service:
            with patch('Authentication.Controllers.AuthController.UserRepository') as mock_user_repo:
                # Setup mocks
                mock_auth_instance = Mock()
                mock_auth_instance.generate_auth_url.return_value = (
                    "https://accounts.google.com/o/oauth2/v2/auth?state=test_state",
                    "test_verifier"
                )
                mock_auth_instance.exchange_code_for_tokens.return_value = {
                    'access_token': 'test_token'
                }
                mock_auth_instance.get_user_from_token.return_value = {
                    'email': 'test@example.com',
                    'first_name': 'Test',
                    'last_name': 'User'
                }
                mock_auth_instance.generate_jwt_tokens.return_value = (
                    'jwt_access_token',
                    'jwt_refresh_token'
                )
                mock_auth_service.return_value = mock_auth_instance
                
                mock_user = User(id=1, email='test@example.com', first_name='Test', last_name='User')
                mock_user_repo_instance = Mock()
                mock_user_repo_instance.get_user_by_email.return_value = mock_user
                mock_user_repo.return_value = mock_user_repo_instance
                
                # Get login state
                login_response = client.get('/api/auth/login')
                state = login_response.get_json()['state']
                
                # BEFORE callback: Session has only oauth data
                with client.session_transaction() as sess:
                    sess['oauth_state'] = state
                    sess['code_verifier'] = 'test_verifier'
                    assert sess.get('user_id') is None
                
                # Perform callback
                response = client.post('/api/auth/callback', json={
                    'code': 'test_code',
                    'state': state
                })
                
                # AFTER callback: Session should have user_id
                with client.session_transaction() as sess:
                    assert sess.get('user_id') == 1
    
    def test_token_payload_contains_user_data(self, jwt_service):
        """Test that JWT token payload contains all required user data"""
        user_data = {
            'id': 1,
            'email': 'test@example.com',
            'role': 'admin',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        # Generate tokens
        access_token, refresh_token = jwt_service.generate_token_pair(user_data)
        
        # BEFORE decoding: Tokens are just encoded strings
        assert isinstance(access_token, str)
        assert isinstance(refresh_token, str)
        
        # AFTER decoding: Should contain user data
        access_payload = jwt_service.decode_access_token(access_token)
        refresh_payload = jwt_service.decode_refresh_token(refresh_token)
        
        # Verify access token contains full user data
        assert access_payload['user_id'] == 1
        assert access_payload['email'] == 'test@example.com'
        assert access_payload['role'] == 'admin'
        assert access_payload['type'] == 'access'
        assert 'exp' in access_payload
        assert 'iat' in access_payload
        
        # Verify refresh token contains minimal data
        assert refresh_payload['user_id'] == 1
        assert refresh_payload['type'] == 'refresh'
        assert 'exp' in refresh_payload
        assert 'iat' in refresh_payload
    
    def test_session_persists_across_requests(self, client):
        """Test that session data persists across multiple requests"""
        # Set up session
        with client.session_transaction() as sess:
            sess['user_id'] = 1
            initial_user_id = sess['user_id']
        
        # Make a request (simulating page refresh)
        with patch('Authentication.Controllers.AuthController.UserRepository') as mock_user_repo:
            mock_user = User(id=1, email='test@example.com', first_name='Test', last_name='User')
            mock_user_repo_instance = Mock()
            mock_user_repo_instance.get_user_by_id.return_value = mock_user
            mock_user_repo.return_value = mock_user_repo_instance
            
            response = client.get('/api/auth/user')
        
        # Verify session persisted
        with client.session_transaction() as sess:
            assert sess.get('user_id') == initial_user_id
            assert sess.get('user_id') == 1


if __name__ == "__main__":
    pytest.main([__file__])