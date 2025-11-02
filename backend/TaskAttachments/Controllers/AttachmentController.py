from flask import Blueprint, request, jsonify
import traceback

# Handle both relative and absolute imports
try:
    from ..Services.AttachmentService import AttachmentService
    from ..exceptions import (
        InvalidFileTypeError,
        FileSizeExceededError,
        StorageQuotaExceededError,
        AttachmentNotFoundError,
    )
except ImportError:
    from Services.AttachmentService import AttachmentService
    from exceptions import (
        InvalidFileTypeError,
        FileSizeExceededError,
        StorageQuotaExceededError,
        AttachmentNotFoundError,
    )

bp = Blueprint('attachments', __name__, url_prefix='/api/task-attachments')


@bp.route('/upload', methods=['POST'])
def upload_attachment():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'File is required'}), 400
        file = request.files['file']
        task_id = request.form.get('task_id')
        uploaded_by = request.form.get('uploaded_by') or request.headers.get('X-User-Id')

        if not task_id:
            return jsonify({'error': 'task_id is required'}), 400
        try:
            task_id = int(task_id)
        except ValueError:
            return jsonify({'error': 'task_id must be an integer'}), 400

        if not uploaded_by:
            return jsonify({'error': 'uploaded_by is required'}), 400
        try:
            uploaded_by_int = int(uploaded_by)
        except ValueError:
            return jsonify({'error': 'uploaded_by must be an integer'}), 400

        service = AttachmentService()
        created = service.upload_attachment(task_id, file, uploaded_by_int)
        return jsonify(created), 201
    except InvalidFileTypeError as e:
        return jsonify({'error': str(e)}), 400
    except FileSizeExceededError as e:
        return jsonify({'error': str(e)}), 400
    except StorageQuotaExceededError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        # Log full traceback to container logs for diagnosis
        print("[Upload Error]", str(e))
        print(traceback.format_exc())
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500


@bp.route('/task/<int:task_id>', methods=['GET'])
def list_attachments(task_id: int):
    try:
        service = AttachmentService()
        results = service.list_attachments_for_task(task_id)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<string:attachment_id>/download', methods=['GET'])
def get_download_url(attachment_id: str):
    try:
        service = AttachmentService()
        url = service.get_download_url(attachment_id)
        return jsonify({'url': url})
    except AttachmentNotFoundError as e:
        return jsonify({'error': 'Attachment not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<string:attachment_id>', methods=['GET'])
def get_attachment(attachment_id: str):
    try:
        service = AttachmentService()
        att = service.get_attachment(attachment_id)
        return jsonify(att)
    except AttachmentNotFoundError:
        return jsonify({'error': 'Attachment not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<string:attachment_id>', methods=['DELETE'])
def delete_attachment(attachment_id: str):
    try:
        service = AttachmentService()
        service.delete_attachment(attachment_id)
        return jsonify({'success': True})
    except AttachmentNotFoundError:
        return jsonify({'error': 'Attachment not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/copy/<int:source_task_id>/<int:target_task_id>', methods=['POST'])
def copy_attachments(source_task_id: int, target_task_id: int):
    """Copy all attachments from source task to target task (for recurring tasks)."""
    try:
        service = AttachmentService()
        copied = service.copy_attachments_to_task(source_task_id, target_task_id)
        return jsonify({'copied': copied, 'count': len(copied)}), 201
    except Exception as e:
        print("[Copy Attachments Error]", str(e))
        print(traceback.format_exc())
        return jsonify({'error': f'Copy failed: {str(e)}'}), 500


