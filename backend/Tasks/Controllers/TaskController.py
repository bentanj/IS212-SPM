from flask import Blueprint, jsonify, g
from ..Repositories.TaskRepository import TaskRepository
from ..Services.TaskService import TaskService

bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

def _taskService() -> TaskService:
    repo = TaskRepository(g.db)
    return TaskService(repo)

@bp.get("")
def get_tasks():
    pass