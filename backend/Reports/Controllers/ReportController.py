# Controllers/ReportController.py
from flask import Blueprint, jsonify, request
from Services.ReportService import ReportService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok", 
        "service": "reports",
        "port": 8003
    }), 200

@bp.route('/project-performance/data', methods=['GET'])
def get_project_performance_report():
    """
    Get project performance report (Per Project)
    Query Parameters:
        - start_date: Start date for filtering (YYYY-MM-DD)
        - end_date: End date for filtering (YYYY-MM-DD)
    """
    try:
        service = ReportService()
        
        # Get date range parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Validate required parameters
        if not start_date or not end_date:
            return jsonify({
                "error": "Missing required parameters",
                "message": "Both start_date and end_date are required"
            }), 400
        
        # Validate date format
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            
            if start_dt > end_dt:
                return jsonify({
                    "error": "Invalid date range",
                    "message": "start_date must be before or equal to end_date"
                }), 400
                
        except ValueError:
            return jsonify({
                "error": "Invalid date format",
                "message": "Dates must be in YYYY-MM-DD format"
            }), 400
        
        # Generate report with date filtering
        report = service.generate_project_performance_report(start_date, end_date)
        
        logger.info(f"Project performance report generated for {start_date} to {end_date}")
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error generating project performance report: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to generate report",
            "message": str(e)
        }), 500

@bp.route('/user-productivity/data', methods=['GET'])
def get_user_productivity_report():
    """
    Get user productivity report (Per User)
    Query Parameters:
        - start_date: Start date for filtering (YYYY-MM-DD)
        - end_date: End date for filtering (YYYY-MM-DD)
    """
    try:
        service = ReportService()
        
        # Get date range parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Validate required parameters
        if not start_date or not end_date:
            return jsonify({
                "error": "Missing required parameters",
                "message": "Both start_date and end_date are required"
            }), 400
        
        # Validate date format
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            
            if start_dt > end_dt:
                return jsonify({
                    "error": "Invalid date range",
                    "message": "start_date must be before or equal to end_date"
                }), 400
                
        except ValueError:
            return jsonify({
                "error": "Invalid date format",
                "message": "Dates must be in YYYY-MM-DD format"
            }), 400
        
        # Generate report with date filtering
        report = service.generate_user_productivity_report(start_date, end_date)
        
        logger.info(f"User productivity report generated for {start_date} to {end_date}")
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error generating user productivity report: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to generate report",
            "message": str(e)
        }), 500

@bp.route('/department-activity', methods=['GET'])
def get_department_task_activity():
    """
    Get department task activity report
    Query Parameters:
    - department: Department name (required)
    - aggregation: 'weekly' or 'monthly' (required)
    - start_date: Start date for filtering (YYYY-MM-DD) (required)
    - end_date: End date for filtering (YYYY-MM-DD) (required)
    """
    try:
        service = ReportService()
        
        # Get parameters
        department = request.args.get('department')
        aggregation = request.args.get('aggregation')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Validate required parameters
        if not all([department, aggregation, start_date, end_date]):
            return jsonify({
                "error": "Missing required parameters",
                "message": "department, aggregation, start_date, and end_date are required"
            }), 400
        
        # Validate aggregation type
        if aggregation not in ['weekly', 'monthly']:
            return jsonify({
                "error": "Invalid aggregation type",
                "message": "aggregation must be 'weekly' or 'monthly'"
            }), 400
        
        # Validate date format
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            
            if start_dt > end_dt:
                return jsonify({
                    "error": "Invalid date range",
                    "message": "start_date must be before or equal to end_date"
                }), 400
        except ValueError:
            return jsonify({
                "error": "Invalid date format",
                "message": "Dates must be in YYYY-MM-DD format"
            }), 400
        
        # Generate report
        report = service.generate_department_activity_report(
            department=department,
            aggregation=aggregation,
            start_date=start_date,
            end_date=end_date
        )
        
        logger.info(f"Department activity report generated for {department} ({aggregation})")
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error generating department activity report: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to generate report",
            "message": str(e)
        }), 500

@bp.route('/summary', methods=['GET'])
def get_reports_summary():
    """Get summary of all reports"""
    try:
        service = ReportService()
        summary = service.get_reports_summary()
        return jsonify(summary), 200
    except Exception as e:
        logger.error(f"Error generating reports summary: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to get summary",
            "message": str(e)
        }), 500

@bp.route('/available', methods=['GET'])
def list_available_reports():
    """List available report types"""
    try:
        reports = [
            {
                "id": "task-completion",
                "title": "Task Completion Report",
                "description": "Comprehensive task completion analytics with per-user and per-project views",
                "category": "Task Analytics",
                "subtypes": [
                    {"id": "per-user", "name": "Per User Report"},
                    {"id": "per-project", "name": "Per Project Report"}
                ]
            }
        ]
        return jsonify({"reports": reports}), 200
    except Exception as e:
        logger.error(f"Error listing reports: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to list reports",
            "message": str(e)
        }), 500
    
@bp.route('/departments', methods=['GET'])
def get_departments():
    """Get list of all unique departments from tasks"""
    try:
        service = ReportService()
        departments = service.get_unique_departments()
        
        return jsonify({
            "departments": departments
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching departments: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to fetch departments",
            "message": str(e)
        }), 500

    
@bp.route('/department-activity/data', methods=['GET'])
def get_department_activity_report():
    """
    Get department task activity report
    Query Parameters:
    - start_date: Start date for filtering (YYYY-MM-DD)
    - end_date: End date for filtering (YYYY-MM-DD)
    - department: Target department name
    - aggregation: 'week' or 'month'
    """
    try:
        service = ReportService()
        
        # Get parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        department = request.args.get('department')
        aggregation = request.args.get('aggregation', 'week')
        
        # Validate required parameters
        if not start_date or not end_date or not department:
            return jsonify({
                "error": "Missing required parameters",
                "message": "start_date, end_date, and department are required"
            }), 400
        
        # Validate aggregation type
        if aggregation not in ['week', 'month']:
            return jsonify({
                "error": "Invalid aggregation type",
                "message": "aggregation must be 'week' or 'month'"
            }), 400
        
        # Generate report
        report = service.generate_department_activity_report(
            start_date, end_date, department, aggregation
        )
        
        logger.info(f"Department activity report generated for {department} ({aggregation})")
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Error generating department activity report: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500
