import pytest
import os
import sys
from datetime import datetime, timedelta, timezone

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Services.JWTService import JWTService
from config import Config

class TestJWTService:
    """Test JWT service functionality"""
    
    def setup_method(self):
        """Set up test environment"""
        # Set test JWT secrets
        os.environ['JWT_SECRET'] = 'test-jwt-secret-key'
        os.environ['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-key'
        
        self.jwt_service = JWTService()
        self.test_user_data = {
            'id': 1,
            'email': 'test@example.com',
            'role': 'user',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_generate_access_token(self):
        """Test access token generation"""
        token = self.jwt_service.generate_access_token(self.test_user_data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_generate_refresh_token(self):
        """Test refresh token generation"""
        token = self.jwt_service.generate_refresh_token(self.test_user_data['id'])
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_generate_token_pair(self):
        """Test token pair generation"""
        access_token, refresh_token = self.jwt_service.generate_token_pair(self.test_user_data)
        
        assert access_token is not None
        assert refresh_token is not None
        assert access_token != refresh_token
    
    def test_decode_access_token(self):
        """Test access token decoding"""
        token = self.jwt_service.generate_access_token(self.test_user_data)
        payload = self.jwt_service.decode_access_token(token)
        
        assert payload['user_id'] == self.test_user_data['id']
        assert payload['email'] == self.test_user_data['email']
        assert payload['role'] == self.test_user_data['role']
        assert payload['type'] == 'access'
    
    def test_decode_refresh_token(self):
        """Test refresh token decoding"""
        token = self.jwt_service.generate_refresh_token(self.test_user_data['id'])
        payload = self.jwt_service.decode_refresh_token(token)
        
        assert payload['user_id'] == self.test_user_data['id']
        assert payload['type'] == 'refresh'
    
    def test_refresh_access_token(self):
        """Test access token refresh"""
        refresh_token = self.jwt_service.generate_refresh_token(self.test_user_data['id'])
        new_access_token = self.jwt_service.refresh_access_token(refresh_token)
        
        assert new_access_token is not None
        assert isinstance(new_access_token, str)
        
        # Decode the new access token
        payload = self.jwt_service.decode_access_token(new_access_token)
        assert payload['user_id'] == self.test_user_data['id']
        assert payload['type'] == 'access'
    
    def test_invalid_token(self):
        """Test invalid token handling"""
        with pytest.raises(Exception):  # Should raise AuthenticationError
            self.jwt_service.decode_access_token('invalid-token')
    
    def test_expired_token(self):
        """Test expired token handling"""
        # Create a token with past expiration
        payload = {
            'user_id': self.test_user_data['id'],
            'email': self.test_user_data['email'],
            'role': self.test_user_data['role'],
            'exp': datetime.now(timezone.utc) - timedelta(seconds=1),  # Expired 1 second ago
            'iat': datetime.now(timezone.utc) - timedelta(seconds=3600),  # Issued 1 hour ago
            'type': 'access'
        }
        
        import jwt
        expired_token = jwt.encode(payload, self.jwt_service.jwt_secret, algorithm='HS256')
        
        with pytest.raises(Exception):  # Should raise AuthenticationError
            self.jwt_service.decode_access_token(expired_token)

if __name__ == '__main__':
    pytest.main([__file__])
