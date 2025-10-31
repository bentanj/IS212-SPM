'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  InsertDriveFile,
  PictureAsPdf,
  Description,
} from '@mui/icons-material';
import {
  uploadTaskAttachment,
  getTaskAttachments,
  downloadAttachment,
  formatFileSize,
  TaskAttachment,
} from '@/utils/taskAttachments';
import { AlertColor } from '@mui/material';

interface TaskAttachmentsSectionProps {
  taskId: number;
  uploadedBy: number;
  setSnackbarContent: (message: string, severity: AlertColor) => void;
}

export const TaskAttachmentsSection: React.FC<TaskAttachmentsSectionProps> = ({
  taskId,
  uploadedBy,
  setSnackbarContent,
}) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load attachments when component mounts or taskId changes
  useEffect(() => {
    loadAttachments();
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await getTaskAttachments(taskId);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
      setSnackbarContent(
        error instanceof Error ? error.message : 'Failed to load attachments',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setSnackbarContent(`File size (${fileSizeMB}MB) exceeds the 50MB limit`, 'error');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(file.type)) {
      setSnackbarContent('Only PDF and Excel files are allowed', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadedAttachment = await uploadTaskAttachment(taskId, file, uploadedBy);
      setAttachments([...attachments, uploadedAttachment]);
      setSnackbarContent('File uploaded successfully', 'success');
    } catch (error) {
      console.error('Failed to upload file:', error);
      setSnackbarContent(
        error instanceof Error ? error.message : 'Failed to upload file',
        'error'
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      await downloadAttachment(attachmentId, fileName);
      setSnackbarContent(`Downloading ${fileName}`, 'info');
    } catch (error) {
      console.error('Failed to download file:', error);
      setSnackbarContent(
        error instanceof Error ? error.message : 'Failed to download file',
        'error'
      );
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PictureAsPdf color="error" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <Description color="success" />;
    return <InsertDriveFile color="action" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Attachments
        </Typography>

        {/* Upload Button */}
        <Box sx={{ mb: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xls,.xlsx"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <Button
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="small"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
            PDF and Excel files only (max 50MB)
          </Typography>
        </Box>

        {/* Attachments List */}
        {attachments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No attachments yet
          </Typography>
        ) : (
          <List sx={{ p: 0, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {attachments.map((attachment) => (
              <ListItem
                key={attachment.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                {getFileIcon(attachment.file_type)}
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        textDecoration: 'underline',
                        '&:hover': {
                          color: 'primary.dark',
                        },
                      }}
                      onClick={() => handleDownload(attachment.id, attachment.file_name)}
                    >
                      {attachment.file_name}
                    </Typography>
                  }
                  secondary={`${formatFileSize(attachment.file_size)} • ${new Date(attachment.uploaded_at).toLocaleDateString()}`}
                  sx={{ ml: 1 }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDownload(attachment.id, attachment.file_name)}
                    size="small"
                    title="Download"
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};
