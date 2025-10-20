import pytest
import os
import sys
from datetime import datetime, timedelta, timezone

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Services.JWTService import JWTService, jwt_required, role_required
from config import Config
from flask import Flask, jsonify, g

@pytest.mark.integration
class TestJWTIntegration:
    """Test JWT integration with Flask routes"""
    
    def setup_method(self):
        """Set up test environment"""
        # Set test JWT secrets
        os.environ['JWT_SECRET'] = 'test-jwt-secret-key'
        os.environ['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-key'
        
        self.jwt_service = JWTService()
        self.test_user_data = {
            'id': 1,
            'email': 'test@example.com',
            'role': 'admin',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        # Create test Flask app
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    def test_jwt_required_decorator(self):
        """Test jwt_required decorator functionality"""
        
        @self.app.route('/protected')
        @jwt_required
        def protected_route():
            return jsonify({
                'user_id': g.current_user['id'],
                'email': g.current_user['email'],
                'role': g.current_user['role']
            })
        
        # Test without token
        response = self.client.get('/protected')
        assert response.status_code == 401
        assert 'Access token required' in response.get_json()['error']
        
        # Test with valid token
        access_token, _ = self.jwt_service.generate_token_pair(self.test_user_data)
        headers = {'Authorization': f'Bearer {access_token}'}
        
        response = self.client.get('/protected', headers=headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data['user_id'] == 1
        assert data['email'] == 'test@example.com'
        assert data['role'] == 'admin'
    
    def test_role_required_decorator(self):
        """Test role_required decorator functionality"""
        
        @self.app.route('/admin-only')
        @jwt_required
        @role_required('admin')
        def admin_route():
            return jsonify({'message': 'Admin access granted'})
        
        @self.app.route('/user-only')
        @jwt_required
        @role_required('user')
        def user_route():
            return jsonify({'message': 'User access granted'})
        
        # Generate tokens for admin user
        access_token, _ = self.jwt_service.generate_token_pair(self.test_user_data)
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Test admin access to admin route
        response = self.client.get('/admin-only', headers=headers)
        assert response.status_code == 200
        assert 'Admin access granted' in response.get_json()['message']
        
        # Test admin access to user route (should fail)
        response = self.client.get('/user-only', headers=headers)
        assert response.status_code == 403
        assert 'Insufficient permissions' in response.get_json()['error']
    
    def test_token_expiration_handling(self):
        """Test token expiration handling"""
        
        @self.app.route('/protected')
        @jwt_required
        def protected_route():
            return jsonify({'message': 'Access granted'})
        
        # Create expired token
        payload = {
            'user_id': self.test_user_data['id'],
            'email': self.test_user_data['email'],
            'role': self.test_user_data['role'],
            'exp': datetime.now(timezone.utc) - timedelta(seconds=1),  # Expired
            'iat': datetime.now(timezone.utc) - timedelta(seconds=3600),
            'type': 'access'
        }
        
        import jwt
        expired_token = jwt.encode(payload, self.jwt_service.jwt_secret, algorithm='HS256')
        headers = {'Authorization': f'Bearer {expired_token}'}
        
        response = self.client.get('/protected', headers=headers)
        assert response.status_code == 401
        assert 'Token has expired' in response.get_json()['error']
    
    def test_invalid_token_handling(self):
        """Test invalid token handling"""
        
        @self.app.route('/protected')
        @jwt_required
        def protected_route():
            return jsonify({'message': 'Access granted'})
        
        # Test with invalid token
        headers = {'Authorization': 'Bearer invalid-token'}
        response = self.client.get('/protected', headers=headers)
        assert response.status_code == 401
        assert 'Invalid token' in response.get_json()['error']
        
        # Test with malformed header
        headers = {'Authorization': 'InvalidFormat token'}
        response = self.client.get('/protected', headers=headers)
        assert response.status_code == 401
        assert 'Access token required' in response.get_json()['error']
    
    def test_cookie_based_authentication(self):
        """Test cookie-based authentication"""
        
        @self.app.route('/protected')
        @jwt_required
        def protected_route():
            return jsonify({
                'user_id': g.current_user['id'],
                'email': g.current_user['email']
            })
        
        # Generate token
        access_token, _ = self.jwt_service.generate_token_pair(self.test_user_data)
        
        # Test with cookie (using Flask test client cookie setting)
        self.client.set_cookie('access_token', access_token)
        response = self.client.get('/protected')
        assert response.status_code == 200
        data = response.get_json()
        assert data['user_id'] == 1
        assert data['email'] == 'test@example.com'

if __name__ == '__main__':
    pytest.main([__file__])
