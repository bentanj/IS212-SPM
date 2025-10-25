from flask import Blueprint, request, jsonify, session, g, make_response

# Handle both relative and absolute imports
try:
    from ..Services.AuthService import AuthService
    from ..Services.JWTService import jwt_required, role_required
    from ..Repositories.UserRepository import UserRepository
    from ..exceptions import ValidationError, AuthenticationError
except ImportError:
    from Services.AuthService import AuthService
    from Services.JWTService import jwt_required, role_required
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
        
        # Read-only service: no user updates allowed
        # User information is managed externally
        
        # Generate JWT tokens
        user_data = user.to_dict()
        access_token, refresh_token = auth_service.generate_jwt_tokens(user_data)
        
        # Store user info in session (for backward compatibility)
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['access_token'] = access_token
        
        # Clean up OAuth session data
        session.pop('oauth_state', None)
        session.pop('code_verifier', None)
        
        # Create response with JWT tokens
        response_data = {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': 900  # 15 minutes in seconds
        }
        
        response = make_response(jsonify(response_data))
        
        # Set HTTP-only cookies for security
        response.set_cookie(
            'access_token',
            access_token,
            max_age=900,  # 15 minutes
            httponly=True,
            secure=True,  # Only over HTTPS in production
            samesite='Lax'
        )
        
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=604800,  # 7 days
            httponly=True,
            secure=True,  # Only over HTTPS in production
            samesite='Lax'
        )
        
        return response
        
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
        
        # Create response
        response = make_response(jsonify({'message': 'Logged out successfully'}))
        
        # Clear JWT cookies
        response.set_cookie('access_token', '', expires=0)
        response.set_cookie('refresh_token', '', expires=0)
        
        return response
        
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

@bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        auth_service = AuthService()
        
        # Get refresh token from request
        refresh_token = request.cookies.get('refresh_token')
        if not refresh_token:
            # Try to get from request body as fallback
            data = request.get_json()
            refresh_token = data.get('refresh_token') if data else None
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token required'}), 400
        
        # Get user data from refresh token
        refresh_payload = auth_service.jwt_service.decode_refresh_token(refresh_token)
        user_id = refresh_payload.get('user_id')
        
        # Fetch user data from database
        user_repo = UserRepository(g.db_session)
        user = user_repo.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate new access token with user data
        user_data = user.to_dict()
        new_access_token = auth_service.refresh_jwt_token(refresh_token, user_data)
        
        # Create response
        response_data = {
            'access_token': new_access_token,
            'token_type': 'Bearer',
            'expires_in': 900  # 15 minutes in seconds
        }
        
        response = make_response(jsonify(response_data))
        
        # Set new access token cookie
        response.set_cookie(
            'access_token',
            new_access_token,
            max_age=900,  # 15 minutes
            httponly=True,
            secure=True,  # Only over HTTPS in production
            samesite='Lax'
        )
        
        return response
        
    except AuthenticationError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        return jsonify({'error': 'Token refresh failed'}), 500

@bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user_jwt():
    """Get current authenticated user from JWT token"""
    try:
        # User info is already available in g.current_user from jwt_required decorator
        return jsonify({
            'user': g.current_user
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/db-health', methods=['GET'])
def db_health():
    """Check database connection health"""
    try:
        # Test database connection
        try:
            from ..Models.User import User
        except ImportError:
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

# Create users blueprint for user-related endpoints
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id: int):
    """Get user by ID"""
    try:
        user_repo = UserRepository(g.db_session)
        user = user_repo.get_user_by_id(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user.to_dict())

    except Exception as e:
        return jsonify({'error': str(e)}), 500
