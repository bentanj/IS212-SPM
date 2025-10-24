from flask import Blueprint, jsonify, request, g
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from Repositories.TaskRepository import TaskRepository
from Services.TaskService import TaskService
from exceptions import TaskNotFoundError, TaskValidationError, InvalidTaskStatusError

bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

def _task_service() -> TaskService:
    repo = TaskRepository(g.db_session)
    return TaskService(repo)

@bp.get("")
def list_tasks():
    try:
        filters = request.args.to_dict()

        if filters:
            tasks = _task_service().search_tasks(filters)
        else:
            tasks = _task_service().list_tasks()

        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/<int:task_id>")
def get_task(task_id: int):
    try:
        task = _task_service().get_task_by_id(task_id)
        return jsonify(task.to_dict(g.db_session))
    except TaskNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.post("")
def create_task():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        task_data = _parse_task_data(data)
        task = _task_service().create_task(task_data)
        g.db_session.commit()

        return jsonify(task.to_dict(g.db_session)), 201
    except TaskValidationError as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 400
    except SQLAlchemyError as e:
        g.db_session.rollback()
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.put("/<int:task_id>")
def update_task(task_id: int):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        task_data = _parse_task_data(data, is_update=True)
        task = _task_service().update_task(task_id, task_data)

        g.db_session.commit()
        return jsonify(task.to_dict(g.db_session))
    except TaskNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except (TaskValidationError, InvalidTaskStatusError) as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 400
    except SQLAlchemyError as e:
        g.db_session.rollback()
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.delete("/<int:task_id>")
def delete_task(task_id: int):
    try:
        success = _task_service().delete_task(task_id)
        if not success:
            return jsonify({"error": "Task not found"}), 404

        g.db_session.commit()
        return "", 204
    except Exception as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.get("/status/<string:status>")
def get_tasks_by_status(status: str):
    try:
        tasks = _task_service().get_tasks_by_status(status)
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/project/<string:project_name>")
def get_tasks_by_project(project_name: str):
    try:
        tasks = _task_service().get_tasks_by_project(project_name)
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/user/<int:user_id>")
def get_tasks_by_user(user_id: int):
    try:
        tasks = _task_service().get_tasks_by_user(user_id)
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/priority/<int:priority>")
def get_tasks_by_priority(priority: int):
    try:
        tasks = _task_service().get_tasks_by_priority(priority)
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/overdue")
def get_overdue_tasks():
    try:
        tasks = _task_service().get_overdue_tasks()
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/statistics")
def get_task_statistics():
    try:
        stats = _task_service().get_task_statistics()
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.patch("/<int:task_id>/complete")
def mark_task_completed(task_id: int):
    try:
        task = _task_service().mark_task_completed(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        g.db_session.commit()
        return jsonify(task.to_dict(g.db_session))
    except Exception as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.patch("/<int:task_id>/assign")
def assign_users_to_task(task_id: int):
    try:
        data = request.get_json()
        if not data or 'user_ids' not in data:
            return jsonify({"error": "user_ids required"}), 400

        user_ids = [int(uid) for uid in data['user_ids']]
        task = _task_service().assign_users_to_task(task_id, user_ids)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        g.db_session.commit()
        return jsonify(task.to_dict(g.db_session))
    except ValueError as e:
        g.db_session.rollback()
        return jsonify({"error": "Invalid user ID format"}), 400
    except Exception as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.patch("/<int:task_id>/add-user")
def add_user_to_task(task_id: int):
    try:
        data = request.get_json()
        if not data or 'user_id' not in data:
            return jsonify({"error": "user_id required"}), 400

        user_id = int(data['user_id'])
        task = _task_service().add_user_to_task(task_id, user_id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        g.db_session.commit()
        return jsonify(task.to_dict(g.db_session))
    except ValueError as e:
        g.db_session.rollback()
        return jsonify({"error": "Invalid user ID format"}), 400
    except Exception as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.patch("/<int:task_id>/remove-user")
def remove_user_from_task(task_id: int):
    try:
        data = request.get_json()
        if not data or 'user_id' not in data:
            return jsonify({"error": "user_id required"}), 400

        user_id = int(data['user_id'])
        task = _task_service().remove_user_from_task(task_id, user_id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        g.db_session.commit()
        return jsonify(task.to_dict(g.db_session))
    except ValueError as e:
        g.db_session.rollback()
        return jsonify({"error": "Invalid user ID format"}), 400
    except Exception as e:
        g.db_session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.get("/<int:parent_id>/subtasks")
def get_subtasks(parent_id: int):
    try:
        tasks = _task_service().get_subtasks(parent_id)
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except TaskNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/root")
def get_root_tasks():
    try:
        tasks = _task_service().get_root_tasks()
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.post("/filter")
def filter_tasks():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No filter data provided"}), 400

        filters = _parse_filter_data(data)
        tasks = _task_service().search_tasks(filters)
        return jsonify([task.to_dict(g.db_session) for task in tasks])
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def _parse_filter_data(data: dict):
    filters = {}

    # String filters - pass through directly
    for key in ['status', 'project_name', 'priority']:
        if key in data and data[key]:
            filters[key] = data[key]

    # Integer filters
    if 'parent_id' in data and data['parent_id'] is not None:
        filters['parent_id'] = int(data['parent_id'])

    # Array filter for departments
    if 'departments' in data and data['departments']:
        if isinstance(data['departments'], list):
            filters['departments'] = data['departments']
        else:
            raise ValueError("departments must be an array")

    # Date filters
    for date_field in ['due_before', 'due_after', 'start_date_after', 'start_date_before']:
        if date_field in data and data[date_field]:
            try:
                filters[date_field] = datetime.fromisoformat(data[date_field].replace('Z', '+00:00'))
            except ValueError:
                raise ValueError(f"Invalid {date_field} format. Use ISO format")

    return filters

def _parse_task_data(data: dict, is_update: bool = False):
    task_data = {}

    # Handle both snake_case (backend) and camelCase (frontend) field names
    field_mappings = {
        'title': 'title',
        'description': 'description',
        'priority': 'priority',
        'tags': 'tags',
        'status': 'status',
        'project_name': 'project_name',  # backend: frontend
        'parent_id': 'parentTaskId',
        'recurrence_frequency': 'recurrenceFrequency',
        'recurrence_interval': 'recurrenceInterval',
        'is_replicate_from_completed_subtask': 'IsReplicateFromCompletedSubtask',
    }

    for backend_key, frontend_key in field_mappings.items():
        # Try backend naming first, then frontend naming
        if backend_key in data:
            task_data[backend_key] = data[backend_key]
        elif frontend_key in data:
            task_data[backend_key] = data[frontend_key]

    # Handle departments (can come as 'departments' or 'department')
    departments_value = data.get('departments') or data.get('department')
    if departments_value:
        if isinstance(departments_value, list):
            task_data['departments'] = departments_value
        else:
            raise ValueError("departments must be an array")

    # Handle comments
    if 'comments' in data:
        if isinstance(data['comments'], list):
            task_data['comments'] = data['comments']
        else:
            raise ValueError("comments must be an array")

    # Handle date fields - support both naming conventions
    date_field_mappings = {
        'start_date': 'startDate',
        'completed_date': 'completedDate',
        'due_date': 'dueDate',
    }

    for backend_field, frontend_field in date_field_mappings.items():
        date_value = data.get(backend_field) or data.get(frontend_field)
        if date_value:
            try:
                task_data[backend_field] = datetime.fromisoformat(date_value.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError(f"Invalid {backend_field} format. Use ISO format")

    # Handle assigned_users - support both formats
    assigned_users_value = data.get('assigned_users') or data.get('assignedUsers')
    if assigned_users_value:
        try:
            # If it's a list of objects (frontend format), extract userId
            if isinstance(assigned_users_value, list) and len(assigned_users_value) > 0:
                if isinstance(assigned_users_value[0], dict):
                    # Frontend format: [{ userId: 1, name: "..." }, ...]
                    task_data['assigned_users'] = [int(user.get('userId')) for user in assigned_users_value]
                else:
                    # Backend format: [1, 2, 3]
                    task_data['assigned_users'] = [int(uid) for uid in assigned_users_value]
            else:
                task_data['assigned_users'] = []
        except (ValueError, KeyError) as e:
            raise ValueError("Invalid user ID format in assigned_users")

    return task_data