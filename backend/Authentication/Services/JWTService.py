import jwt
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
from functools import wraps
from flask import request, jsonify, g

# Handle both relative and absolute imports
try:
    from ..config import Config
    from ..exceptions import AuthenticationError
except ImportError:
    from config import Config
    from exceptions import AuthenticationError

class JWTService:
    """JWT token service for authentication and authorization"""
    
    def __init__(self):
        self.jwt_secret = Config.JWT_SECRET
        self.jwt_refresh_secret = Config.JWT_REFRESH_SECRET
        self.access_token_expires = Config.JWT_ACCESS_TOKEN_EXPIRES
        self.refresh_token_expires = Config.JWT_REFRESH_TOKEN_EXPIRES
    
    def generate_access_token(self, user_data: Dict) -> str:
        """Generate JWT access token with user data"""
        payload = {
            'user_id': user_data['id'],
            'email': user_data['email'],
            'role': user_data['role'],
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'exp': datetime.now(timezone.utc) + timedelta(seconds=self.access_token_expires),
            'iat': datetime.now(timezone.utc),
            'type': 'access'
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    def generate_refresh_token(self, user_id: int) -> str:
        """Generate JWT refresh token"""
        payload = {
            'user_id': user_id,
            'exp': datetime.now(timezone.utc) + timedelta(seconds=self.refresh_token_expires),
            'iat': datetime.now(timezone.utc),
            'type': 'refresh'
        }
        
        return jwt.encode(payload, self.jwt_refresh_secret, algorithm='HS256')
    
    def generate_token_pair(self, user_data: Dict) -> Tuple[str, str]:
        """Generate both access and refresh tokens"""
        access_token = self.generate_access_token(user_data)
        refresh_token = self.generate_refresh_token(user_data['id'])
        
        return access_token, refresh_token
    
    def decode_access_token(self, token: str) -> Dict:
        """Decode and validate access token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            
            # Validate token type
            if payload.get('type') != 'access':
                raise AuthenticationError("Invalid token type")
            
            # Check expiration
            if payload.get('exp', 0) < time.time():
                raise AuthenticationError("Token has expired")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")
    
    def decode_refresh_token(self, token: str) -> Dict:
        """Decode and validate refresh token"""
        try:
            payload = jwt.decode(token, self.jwt_refresh_secret, algorithms=['HS256'])
            
            # Validate token type
            if payload.get('type') != 'refresh':
                raise AuthenticationError("Invalid token type")
            
            # Check expiration
            if payload.get('exp', 0) < time.time():
                raise AuthenticationError("Refresh token has expired")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Refresh token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid refresh token")
    
    def refresh_access_token(self, refresh_token: str, user_data: Dict = None) -> str:
        """Generate new access token from refresh token"""
        payload = self.decode_refresh_token(refresh_token)
        user_id = payload.get('user_id')
        
        if not user_id:
            raise AuthenticationError("Invalid refresh token payload")
        
        # If user_data is provided, use it; otherwise create minimal data
        if user_data:
            # Ensure the user_id matches
            user_data['id'] = user_id
        else:
            # Create minimal user data for token generation
            user_data = {
                'id': user_id,
                'email': '',  # Will be populated from database
                'role': '',   # Will be populated from database
                'first_name': '',
                'last_name': ''
            }
        
        return self.generate_access_token(user_data)
    
    def get_token_from_request(self) -> Optional[str]:
        """Extract JWT token from request headers or cookies"""
        # Check Authorization header first
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        
        # Check cookies
        return request.cookies.get('access_token')
    
    def get_refresh_token_from_request(self) -> Optional[str]:
        """Extract refresh token from request cookies"""
        return request.cookies.get('refresh_token')

def jwt_required(f):
    """Decorator to require JWT authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        jwt_service = JWTService()
        
        # Get token from request
        token = jwt_service.get_token_from_request()
        
        if not token:
            return jsonify({'error': 'Access token required'}), 401
        
        try:
            # Decode and validate token
            payload = jwt_service.decode_access_token(token)
            
            # Store user info in Flask's g object for use in route handlers
            g.current_user = {
                'id': payload['user_id'],
                'email': payload['email'],
                'role': payload['role'],
                'first_name': payload.get('first_name'),
                'last_name': payload.get('last_name')
            }
            
            return f(*args, **kwargs)
            
        except AuthenticationError as e:
            return jsonify({'error': str(e)}), 401
        except Exception as e:
            return jsonify({'error': 'Token validation failed'}), 401
    
    return decorated_function

def role_required(required_role: str):
    """Decorator to require specific role for routes"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # First check if user is authenticated
            if not hasattr(g, 'current_user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            # Check if user has required role
            user_role = g.current_user.get('role')
            if user_role != required_role:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator
