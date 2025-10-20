from flask import Blueprint, jsonify, request
from Services.ReportService import ReportService
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "reports"}), 200

@bp.route('/task-completion/data', methods=['GET'])
def get_task_completion_report():
    """Get task completion report data"""
    try:
        service = ReportService()
        user = request.args.get('user', 'system')
        
        # Generate report
        report = service.generate_task_completion_report(user)
        
        # Convert to dict with proper field names
        response_data = report.to_dict()
        
        logger.info(f"Task completion report generated successfully")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error generating task completion report: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to generate report",
            "message": str(e)
        }), 500

@bp.route('/project-performance/data', methods=['GET'])
def get_project_performance_report():
    """Get project performance report"""
    try:
        service = ReportService()
        report = service.generate_project_performance_report()
        return jsonify(report.to_dict()), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@bp.route('/team-productivity/data', methods=['GET'])
def get_team_productivity_report():
    """Get team productivity report"""
    try:
        service = ReportService()
        report = service.generate_team_productivity_report()
        return jsonify(report.to_dict()), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@bp.route('/available', methods=['GET'])
def list_available_reports():
    """List all available report types"""
    try:
        service = ReportService()
        reports = service.list_available_reports()
        return jsonify({"reports": reports}), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@bp.route('/summary', methods=['GET'])
def get_reports_summary():
    """Get summary of all reports"""
    try:
        service = ReportService()
        summary = service.get_reports_summary()
        return jsonify(summary), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
