from flask import Blueprint, request, jsonify, session, g
from Services.AuthService import AuthService
from Repositories.UserRepository import UserRepository
from exceptions import ValidationError, AuthenticationError
import secrets
import json
import time
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['GET'])
def login():
    """Initiate OAuth login flow"""
    try:
        auth_service = AuthService()
        
        # Generate state parameter for CSRF protection
        state = secrets.token_urlsafe(32)
        session['oauth_state'] = state
        
        # Generate authorization URL
        auth_url, code_verifier = auth_service.generate_auth_url(state)
        
        # Store code verifier in session
        session['code_verifier'] = code_verifier
        
        return jsonify({
            'auth_url': auth_url,
            'state': state
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/callback', methods=['POST'])
def callback():
    """Handle OAuth callback"""
    try:
        data = request.get_json()
        code = data.get('code')
        state = data.get('state')
        
        # Validate state parameter
        if not state or state != session.get('oauth_state'):
            raise AuthenticationError("Invalid state parameter")
        
        # Get code verifier from session
        code_verifier = session.get('code_verifier')
        if not code_verifier:
            raise AuthenticationError("Code verifier not found in session")
        
        auth_service = AuthService()
        user_repo = UserRepository(g.db_session)
        
        # Exchange code for tokens
        token_data = auth_service.exchange_code_for_tokens(code, code_verifier)
        access_token = token_data.get('access_token')
        
        if not access_token:
            raise AuthenticationError("No access token received")
        
        # Get user info from Google
        user_info = auth_service.get_user_from_token(access_token)
        
        # Check if user exists in database with retry logic
        max_retries = 3
        user = None
        
        for attempt in range(max_retries):
            try:
                user = user_repo.get_user_by_email(user_info['email'])
                break
            except Exception as e:
                print(f"Database query attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise AuthenticationError("Database connection error. Please try again.")
                # Wait before retry
                time.sleep(1)
        
        if not user:
            # User doesn't exist, return error
            raise AuthenticationError("User not found in database. Please contact administrator.")
        
        # Update user's last login and info with retry logic
        for attempt in range(max_retries):
            try:
                user.last_login = datetime.utcnow()
                user.updated_at = datetime.utcnow()
                if user_info['first_name'] and user.first_name != user_info['first_name']:
                    user.first_name = user_info['first_name']
                if user_info['last_name'] and user.last_name != user_info['last_name']:
                    user.last_name = user_info['last_name']
                g.db_session.commit()
                g.db_session.refresh(user)
                break
            except Exception as e:
                print(f"Database update attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise AuthenticationError("Failed to update user information. Please try again.")
                # Wait before retry
                time.sleep(1)
        
        # Store user info in session
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['access_token'] = access_token
        
        # Clean up OAuth session data
        session.pop('oauth_state', None)
        session.pop('code_verifier', None)
        
        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token
        })
        
    except AuthenticationError as e:
        return jsonify({'error': str(e)}), 401
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/user', methods=['GET'])
def get_current_user():
    """Get current authenticated user"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user_repo = UserRepository(g.db_session)
        user = user_repo.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/logout', methods=['POST'])
def logout():
    """Logout current user"""
    try:
        # Clear session
        session.clear()
        
        return jsonify({'message': 'Logged out successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/validate-token', methods=['POST'])
def validate_token():
    """Validate access token"""
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        
        if not access_token:
            return jsonify({'error': 'Access token required'}), 400
        
        auth_service = AuthService()
        is_valid = auth_service.validate_token(access_token)
        
        return jsonify({'valid': is_valid})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/db-health', methods=['GET'])
def db_health():
    """Check database connection health"""
    try:
        # Test database connection
        from Models.User import User
        user_count = g.db_session.query(User).count()
        
        return jsonify({
            'status': 'healthy',
            'user_count': user_count,
            'message': 'Database connection successful'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'message': 'Database connection failed'
        }), 500
