import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileUpload } from './FileUpload';

describe('FileUpload Component', () => {
  const mockSetFormData = jest.fn();
  const defaultProps = {
    isMobile: false,
    formData: { attachedFiles: [] },
    setFormData: mockSetFormData,
  };

  beforeEach(() => {
    mockSetFormData.mockClear();
  });

  test('renders upload button', () => {
    render(<FileUpload {...defaultProps} />);
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
  });

  test('has multiple attribute on file input', () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('multiple');
  });

  test('accepts PDF and Excel files', () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', '.pdf,.xls,.xlsx');
  });

  test('validates file size exceeding 50MB', async () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Create a mock file larger than 50MB
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    Object.defineProperty(input, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/exceeds the 50MB limit/i)).toBeInTheDocument();
    });

    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  test('validates invalid file type', async () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(
        screen.getByText(/Only PDF and Excel files are allowed/i)
      ).toBeInTheDocument();
    });

    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  test('displays selected files with names and sizes', () => {
    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    ];

    render(<FileUpload {...defaultProps} formData={{ attachedFiles: files }} />);

    expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    expect(screen.getByText('test2.xlsx')).toBeInTheDocument();
  });

  test('shows file size in KB', () => {
    const file = new File(['x'.repeat(2048)], 'test.pdf', {
      type: 'application/pdf',
    });

    render(<FileUpload {...defaultProps} formData={{ attachedFiles: [file] }} />);

    expect(screen.getByText(/2.0 KB/i)).toBeInTheDocument();
  });

  test('calls handleRemoveFile when delete button clicked', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    render(<FileUpload {...defaultProps} formData={{ attachedFiles: [file] }} />);

    const deleteButton = screen.getByRole('button', { name: '' }); // IconButton has no label
    fireEvent.click(deleteButton);

    expect(mockSetFormData).toHaveBeenCalled();
  });

  test('accepts multiple valid files', async () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const files = [
      new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'test2.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      new File(['content3'], 'test3.pdf', { type: 'application/pdf' }),
    ];

    Object.defineProperty(input, 'files', {
      value: files,
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockSetFormData).toHaveBeenCalled();
    });
  });

  test('shows multiple error messages when multiple files are invalid', async () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [largeFile, invalidFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(/exceeds the 50MB limit/i);
      expect(errorAlert).toHaveTextContent(/Only PDF and Excel files are allowed/i);
    });
  });

  test('clears error when dismiss button clicked', async () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('renders in mobile mode with full width button', () => {
    render(<FileUpload {...defaultProps} isMobile={true} />);
    const button = screen.getByText('Upload Files');
    // Button should have fullWidth prop applied via MUI (rendered as label due to component="label")
    expect(button).toBeInTheDocument();
  });

  test('does not call setFormData when no files selected', () => {
    render(<FileUpload {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [],
      writable: false,
    });

    fireEvent.change(input);

    expect(mockSetFormData).not.toHaveBeenCalled();
  });
});
