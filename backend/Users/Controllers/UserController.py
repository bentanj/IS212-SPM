from flask import Blueprint, request, jsonify, g

# Handle both relative and absolute imports
try:
    from ..Repositories.UserRepository import UserRepository
except ImportError:
    from Repositories.UserRepository import UserRepository

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/<int:user_id>', methods=['GET'])
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

@bp.route('/email/<string:email>', methods=['GET'])
def get_user_by_email(email: str):
    """Get user by email"""
    try:
        user_repo = UserRepository(g.db_session)
        user = user_repo.get_user_by_email(email)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user.to_dict())

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['GET'])
def get_all_users():
    """Get all users"""
    try:
        user_repo = UserRepository(g.db_session)
        users = user_repo.get_all_users()

        return jsonify([user.to_dict() for user in users])

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/filter', methods=['POST'])
def filter_users():
    """Filter users by IDs and/or emails

    Request body:
    {
        "userIds": [1, 2, 3],  # optional
        "emails": ["user1@example.com", "user2@example.com"]  # optional
    }

    Returns users that match ANY of the provided IDs or emails (OR condition)
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Request body is required'}), 400

        user_ids = data.get('userIds', [])
        emails = data.get('emails', [])

        # Validate that at least one filter is provided
        if not user_ids and not emails:
            return jsonify({'error': 'At least one of userIds or emails must be provided'}), 400

        # Validate types
        if user_ids and not isinstance(user_ids, list):
            return jsonify({'error': 'userIds must be an array'}), 400

        if emails and not isinstance(emails, list):
            return jsonify({'error': 'emails must be an array'}), 400

        user_repo = UserRepository(g.db_session)
        users = user_repo.get_users_by_filter(user_ids=user_ids, emails=emails)

        return jsonify([user.to_dict() for user in users])

    except Exception as e:
        return jsonify({'error': str(e)}), 500
