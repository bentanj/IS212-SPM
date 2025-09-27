from flask import Blueprint, jsonify, request, g
from datetime import datetime
from uuid import UUID
from sqlalchemy.exc import SQLAlchemyError
from Users.Repositories.UserRepository import UserRepository
from Users.Services.UserService import UserService
from Users.exceptions import UserNotFoundError, UserValidationError, UserAlreadyExistsError

bp = Blueprint("users", __name__, url_prefix="/api/users")

def _user_service() -> UserService:
    repo = UserRepository(g.db_session)
    return UserService(repo)

@bp.get("/health")
def health():
    return {"status": "ok", "service": "users"}

# Endpoints will be implemented later as per user's request