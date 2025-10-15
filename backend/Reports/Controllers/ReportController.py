from flask import Blueprint, jsonify, request, g
from sqlalchemy.exc import SQLAlchemyError
from Repositories.ReportRepository import ReportRepository
from Services.ReportService import ReportService
from exceptions import ReportValidationError

bp = Blueprint("reports", __name__, url_prefix="/api/reports")


def _report_service() -> ReportService:
    """Create report service instance with repository"""
    repo = ReportRepository(g.db_session)
    return ReportService(repo)


@bp.get("/health")
def health_check():
    """
    Health check endpoint
    GET /api/reports/health
    """
    return jsonify({"status": "ok", "service": "reports"}), 200


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


@bp.get("/task-completion/data")
def get_task_completion_data():
    """
    Get task completion report data (for frontend PDF generation)
    GET /api/reports/task-completion/data
    """
    try:
        report = _report_service().generate_task_completion_report()
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.get("/project-performance/data")
def get_project_performance_data():
    """
    Get project performance report data (for frontend PDF generation)
    GET /api/reports/project-performance/data
    """
    try:
        report = _report_service().generate_project_performance_report()
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.get("/team-productivity/data")
def get_team_productivity_data():
    """
    Get team productivity report data (for frontend PDF generation)
    GET /api/reports/team-productivity/data
    """
    try:
        report = _report_service().generate_team_productivity_report()
        return jsonify(report.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.get("/summary")
def get_reports_summary():
    """
    Get high-level summary for all reports
    GET /api/reports/summary
    """
    try:
        summary = _report_service().get_reports_summary()
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
