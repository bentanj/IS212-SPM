import requests
import secrets
import hashlib
import base64
import urllib.parse
from typing import Dict, Optional, Tuple
# Handle both relative and absolute imports
try:
    from ..config import Config
    from .JWTService import JWTService
except ImportError:
    from config import Config
    from Services.JWTService import JWTService

class AuthService:
    """OAuth 2.0 service for handling Google OAuth flow with PKCE"""
    
    def __init__(self):
        self.client_id = Config.GOOGLE_CLIENT_ID
        self.client_secret = Config.GOOGLE_CLIENT_SECRET
        self.redirect_uri = Config.GOOGLE_REDIRECT_URI
        self.scope = "openid email profile"
        self.google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        self.google_token_url = "https://oauth2.googleapis.com/token"
        self.google_userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        self.jwt_service = JWTService()
        
        print(f"DEBUG: OAuth config - client_id: {self.client_id}")
        print(f"DEBUG: OAuth config - redirect_uri: {self.redirect_uri}")

    def generate_pkce_pair(self) -> Tuple[str, str]:
        """Generate PKCE code verifier and code challenge"""
        # Generate code verifier (43-128 characters, URL-safe)
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        
        # Generate code challenge (SHA256 hash of code verifier)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        
        return code_verifier, code_challenge

    def generate_auth_url(self, state: str) -> Tuple[str, str]:
        """Generate Google OAuth authorization URL with PKCE"""
        code_verifier, code_challenge = self.generate_pkce_pair()
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': self.scope,
            'response_type': 'code',
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state
        }
        
        auth_url = f"{self.google_auth_url}?{urllib.parse.urlencode(params)}"
        return auth_url, code_verifier

    def exchange_code_for_tokens(self, code: str, code_verifier: str) -> Dict:
        """Exchange authorization code for access token"""
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': self.redirect_uri,
            'code_verifier': code_verifier
        }
        
        try:
            print(f"DEBUG: Token exchange data: {data}")
            response = requests.post(self.google_token_url, data=data, timeout=10)
            print(f"DEBUG: Token exchange response status: {response.status_code}")
            print(f"DEBUG: Token exchange response: {response.text}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"DEBUG: Token exchange error: {str(e)}")
            raise ValueError(f"Failed to exchange code for tokens: {str(e)}")

    def get_user_info(self, access_token: str) -> Dict:
        """Get user information from Google using access token"""
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        try:
            response = requests.get(self.google_userinfo_url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Failed to get user info: {str(e)}")

    def validate_token(self, access_token: str) -> bool:
        """Validate access token with Google"""
        try:
            headers = {
                'Authorization': f'Bearer {access_token}'
            }
            response = requests.get(self.google_userinfo_url, headers=headers, timeout=10)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def get_user_from_token(self, access_token: str) -> Dict:
        """Get user information from access token"""
        user_info = self.get_user_info(access_token)
        
        # Validate email verification
        if not user_info.get('verified_email', False):
            raise ValueError("Email not verified by Google")
        
        # Validate email presence
        if not user_info.get('email'):
            raise ValueError("Email not found in user info")
        
        # Map Google user info to our user model
        return {
            'email': user_info.get('email'),
            'first_name': user_info.get('given_name'),
            'last_name': user_info.get('family_name'),
            'google_id': user_info.get('id'),
            'picture': user_info.get('picture')
        }
    
    def generate_jwt_tokens(self, user_data: Dict) -> Tuple[str, str]:
        """Generate JWT access and refresh tokens for authenticated user"""
        return self.jwt_service.generate_token_pair(user_data)
    
    def validate_jwt_token(self, token: str) -> Dict:
        """Validate JWT access token and return payload"""
        return self.jwt_service.decode_access_token(token)
    
    def refresh_jwt_token(self, refresh_token: str, user_data: Dict = None) -> str:
        """Generate new access token from refresh token"""
        return self.jwt_service.refresh_access_token(refresh_token, user_data)
