// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TaskAttachment {
  id: string;
  task_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: number;
  uploaded_at: string;
  download_url?: string;
}

/**
 * Upload a file attachment to a task
 */
export async function uploadTaskAttachment(
  taskId: number,
  file: File,
  uploadedBy: number
): Promise<TaskAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('task_id', taskId.toString());
  formData.append('uploaded_by', uploadedBy.toString());

  const response = await fetch(`${API_BASE_URL}/api/task-attachments/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload attachment');
  }

  return response.json();
}

/**
 * Get all attachments for a specific task
 */
export async function getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
  const response = await fetch(`${API_BASE_URL}/api/task-attachments/task/${taskId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch attachments');
  }

  return response.json();
}

/**
 * Download an attachment by its ID
 */
export async function downloadAttachment(attachmentId: string, fileName: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/task-attachments/${attachmentId}/download`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get download URL');
  }

  const data = await response.json();
  
  // Fetch the file from the signed URL
  const fileResponse = await fetch(data.url);
  if (!fileResponse.ok) {
    throw new Error('Failed to download file');
  }
  
  // Get the blob data
  const blob = await fileResponse.blob();
  
  // Create a download link and trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Delete an attachment by its ID
 */
export async function deleteTaskAttachment(attachmentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/task-attachments/${attachmentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete attachment');
  }
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
