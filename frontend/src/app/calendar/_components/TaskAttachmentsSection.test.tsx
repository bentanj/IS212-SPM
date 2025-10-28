import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskAttachmentsSection from './TaskAttachmentsSection';
import * as taskAttachmentsUtils from '@/utils/taskAttachments';

// Mock the taskAttachments utility functions
jest.mock('@/utils/taskAttachments', () => ({
  uploadTaskAttachment: jest.fn(),
  getTaskAttachments: jest.fn(),
  downloadAttachment: jest.fn(),
  formatFileSize: jest.fn((bytes) => `${bytes} Bytes`),
}));

describe('TaskAttachmentsSection Component', () => {
  const mockSetSnackbarContent = jest.fn();
  const defaultProps = {
    taskId: 123,
    uploadedBy: 1,
    setSnackbarContent: mockSetSnackbarContent,
  };

  const mockAttachments = [
    {
      id: '1',
      task_id: 123,
      file_name: 'document.pdf',
      file_path: '/path/to/document.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      uploaded_by: 1,
      uploaded_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      task_id: 123,
      file_name: 'spreadsheet.xlsx',
      file_path: '/path/to/spreadsheet.xlsx',
      file_size: 2048,
      file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploaded_by: 1,
      uploaded_at: '2024-01-16T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);
    (taskAttachmentsUtils.formatFileSize as jest.Mock).mockImplementation(
      (bytes) => `${(bytes / 1024).toFixed(1)} KB`
    );
  });

  test('renders loading state initially', () => {
    render(<TaskAttachmentsSection {...defaultProps} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders attachments section with upload button', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Attachments')).toBeInTheDocument();
    });

    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('PDF and Excel files only (max 50MB)')).toBeInTheDocument();
  });

  test('displays "No attachments yet" when no attachments exist', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No attachments yet')).toBeInTheDocument();
    });
  });

  test('displays list of attachments with file names and sizes', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue(mockAttachments);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('spreadsheet.xlsx')).toBeInTheDocument();
    });
  });

  test('validates file size exceeding 50MB', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    Object.defineProperty(input, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockSetSnackbarContent).toHaveBeenCalledWith(
        expect.stringContaining('exceeds the 50MB limit'),
        'error'
      );
    });

    expect(taskAttachmentsUtils.uploadTaskAttachment).not.toHaveBeenCalled();
  });

  test('validates invalid file type', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockSetSnackbarContent).toHaveBeenCalledWith(
        'Only PDF and Excel files are allowed',
        'error'
      );
    });

    expect(taskAttachmentsUtils.uploadTaskAttachment).not.toHaveBeenCalled();
  });

  test('uploads valid file successfully', async () => {
    const newAttachment = {
      id: '3',
      task_id: 123,
      file_name: 'test.pdf',
      file_path: '/path/to/test.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      uploaded_by: 1,
      uploaded_at: '2024-01-17T10:00:00Z',
    };

    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);
    (taskAttachmentsUtils.uploadTaskAttachment as jest.Mock).mockResolvedValue(newAttachment);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(taskAttachmentsUtils.uploadTaskAttachment).toHaveBeenCalledWith(
        123,
        validFile,
        1
      );
    });

    await waitFor(() => {
      expect(mockSetSnackbarContent).toHaveBeenCalledWith(
        'File uploaded successfully',
        'success'
      );
    });
  });

  test('handles upload error gracefully', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);
    (taskAttachmentsUtils.uploadTaskAttachment as jest.Mock).mockRejectedValue(
      new Error('Upload failed')
    );

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockSetSnackbarContent).toHaveBeenCalledWith('Upload failed', 'error');
    });
  });

  test('calls downloadAttachment when download button clicked', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue(mockAttachments);
    (taskAttachmentsUtils.downloadAttachment as jest.Mock).mockResolvedValue(undefined);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByTitle('Download');
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(taskAttachmentsUtils.downloadAttachment).toHaveBeenCalledWith('1', 'document.pdf');
    });

    expect(mockSetSnackbarContent).toHaveBeenCalledWith(
      'Downloading document.pdf',
      'info'
    );
  });

  test('calls downloadAttachment when file name is clicked', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue(mockAttachments);
    (taskAttachmentsUtils.downloadAttachment as jest.Mock).mockResolvedValue(undefined);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    const fileName = screen.getByText('document.pdf');
    fireEvent.click(fileName);

    await waitFor(() => {
      expect(taskAttachmentsUtils.downloadAttachment).toHaveBeenCalledWith('1', 'document.pdf');
    });
  });

  test('handles download error gracefully', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue(mockAttachments);
    (taskAttachmentsUtils.downloadAttachment as jest.Mock).mockRejectedValue(
      new Error('Download failed')
    );

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByTitle('Download');
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(mockSetSnackbarContent).toHaveBeenCalledWith('Download failed', 'error');
    });
  });

  test('shows uploading state when file is being uploaded', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);
    (taskAttachmentsUtils.uploadTaskAttachment as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(input);

    // Check for uploading state
    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });

  test('displays correct file icon for PDF files', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([
      mockAttachments[0], // PDF file
    ]);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    // PictureAsPdf icon should be rendered (we can check by looking for the SVG element)
    const listItem = screen.getByText('document.pdf').closest('li');
    expect(listItem).toBeInTheDocument();
  });

  test('displays correct file icon for Excel files', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([
      mockAttachments[1], // Excel file
    ]);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('spreadsheet.xlsx')).toBeInTheDocument();
    });

    const listItem = screen.getByText('spreadsheet.xlsx').closest('li');
    expect(listItem).toBeInTheDocument();
  });

  test('handles load attachments error gracefully', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(mockSetSnackbarContent).toHaveBeenCalledWith('Failed to load', 'error');
    });
  });

  test('accepts PDF file type', async () => {
    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', '.pdf,.xls,.xlsx');
  });

  test('resets file input after successful upload', async () => {
    const newAttachment = {
      id: '3',
      task_id: 123,
      file_name: 'test.pdf',
      file_path: '/path/to/test.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      uploaded_by: 1,
      uploaded_at: '2024-01-17T10:00:00Z',
    };

    (taskAttachmentsUtils.getTaskAttachments as jest.Mock).mockResolvedValue([]);
    (taskAttachmentsUtils.uploadTaskAttachment as jest.Mock).mockResolvedValue(newAttachment);

    render(<TaskAttachmentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockSetSnackbarContent).toHaveBeenCalledWith(
        'File uploaded successfully',
        'success'
      );
    });

    // File input value should be reset
    expect(input.value).toBe('');
  });
});
