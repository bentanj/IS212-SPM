from flask import Blueprint, jsonify, request, g, send_file
from sqlalchemy.exc import SQLAlchemyError
from Repositories.ReportRepository import ReportRepository
from Services.ReportService import ReportService
from exceptions import ReportValidationError
import io

bp = Blueprint("reports", __name__, url_prefix="/api/reports")

def _report_service() -> ReportService:
    """Create report service instance with repository"""
    repo = ReportRepository(g.db_session)
    return ReportService(repo)

@bp.get("")
def list_available_reports():
    """
    List all available report types
    GET /api/reports
    """
    try:
        reports = _report_service().list_available_reports()
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.post("/generate")
def generate_report():
    """
    Generate a report based on type
    POST /api/reports/generate
    Body: {
        "report_type": "task_completion_status",
        "user": "admin@example.com"
    }
    """
    try:
        data = request.get_json()
        report_type = data.get("report_type")
        user = data.get("user")
        
        if not report_type:
            return jsonify({"error": "report_type is required"}), 400
        
        service = _report_service()
        
        # Route to appropriate report generator
        if report_type == "task_completion_status":
            report = service.generate_task_completion_report(user)
        elif report_type == "project_performance":
            report = service.generate_project_performance_report(user)
        elif report_type == "team_productivity":
            report = service.generate_team_productivity_report(user)
        else:
            return jsonify({"error": f"Unknown report type: {report_type}"}), 400
        
        return jsonify(report.to_dict()), 200
        
    except ReportValidationError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/task-completion")
def get_task_completion_report():
    """
    Get task completion report
    GET /api/reports/task-completion?user=admin@example.com
    """
    try:
        user = request.args.get("user")
        report = _report_service().generate_task_completion_report(user)
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/project-performance")
def get_project_performance_report():
    """
    Get project performance report
    GET /api/reports/project-performance?user=admin@example.com
    """
    try:
        user = request.args.get("user")
        report = _report_service().generate_project_performance_report(user)
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.get("/team-productivity")
def get_team_productivity_report():
    """
    Get team productivity report
    GET /api/reports/team-productivity?user=admin@example.com
    """
    try:
        user = request.args.get("user")
        report = _report_service().generate_team_productivity_report(user)
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
