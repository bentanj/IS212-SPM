// @ts-nocheck
import { copyTaskAttachments } from '../../taskAttachments';

global.fetch = jest.fn();

describe('copyTaskAttachments', () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully copies attachments from source to target task', async () => {
        const mockResponse = {
            copied: [
                {
                    id: 'att-1',
                    task_id: 200,
                    file_name: 'document.pdf',
                    file_path: '100/1234567890-document.pdf',
                    file_size: 1024,
                    file_type: 'application/pdf',
                    uploaded_by: 5,
                    uploaded_at: '2025-11-01T10:00:00Z',
                    original_task_id: 100,
                    is_inherited: true,
                },
                {
                    id: 'att-2',
                    task_id: 200,
                    file_name: 'image.png',
                    file_path: '100/1234567891-image.png',
                    file_size: 2048,
                    file_type: 'image/png',
                    uploaded_by: 5,
                    uploaded_at: '2025-11-01T10:05:00Z',
                    original_task_id: 100,
                    is_inherited: true,
                },
            ],
            count: 2,
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await copyTaskAttachments(100, 200);

        expect(global.fetch).toHaveBeenCalledWith(
            `${API_BASE_URL}/api/task-attachments/copy/100/200`,
            { method: 'POST' }
        );
        expect(result).toEqual(mockResponse);
        expect(result.count).toBe(2);
        expect(result.copied).toHaveLength(2);
    });

    it('preserves original uploader when copying attachments', async () => {
        const mockResponse = {
            copied: [
                {
                    id: 'att-1',
                    task_id: 300,
                    file_name: 'report.docx',
                    file_path: '200/1234567892-report.docx',
                    file_size: 3072,
                    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    uploaded_by: 42, // Original uploader preserved
                    uploaded_at: '2025-10-15T14:30:00Z',
                    original_task_id: 200,
                    is_inherited: true,
                },
            ],
            count: 1,
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await copyTaskAttachments(200, 300);

        expect(result.copied[0].uploaded_by).toBe(42);
        expect(result.copied[0].is_inherited).toBe(true);
        expect(result.copied[0].original_task_id).toBe(200);
    });

    it('tracks inheritance chain through multiple copies', async () => {
        // Simulating copying from task 300 (which already has inherited attachments from task 100)
        // to task 400. The original_task_id should still point to task 100.
        const mockResponse = {
            copied: [
                {
                    id: 'att-new',
                    task_id: 400,
                    file_name: 'data.csv',
                    file_path: '100/1234567893-data.csv',
                    file_size: 512,
                    file_type: 'text/csv',
                    uploaded_by: 10,
                    uploaded_at: '2025-09-20T08:00:00Z',
                    original_task_id: 100, // Still tracks back to original task
                    is_inherited: true,
                },
            ],
            count: 1,
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await copyTaskAttachments(300, 400);

        expect(result.copied[0].original_task_id).toBe(100);
        expect(result.copied[0].is_inherited).toBe(true);
    });

    it('returns empty result when source task has no attachments', async () => {
        const mockResponse = {
            copied: [],
            count: 0,
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await copyTaskAttachments(150, 250);

        expect(result.count).toBe(0);
        expect(result.copied).toEqual([]);
    });

    it('throws error when copy operation fails', async () => {
        const mockError = { error: 'Source task not found' };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => mockError,
        });

        await expect(copyTaskAttachments(999, 200)).rejects.toThrow('Source task not found');
    });

    it('throws generic error when response is not ok and no error message provided', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({}),
        });

        await expect(copyTaskAttachments(100, 200)).rejects.toThrow('Failed to copy attachments');
    });

    it('handles network errors gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        await expect(copyTaskAttachments(100, 200)).rejects.toThrow('Network error');
    });

    it('uses correct API endpoint format', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ copied: [], count: 0 }),
        });

        await copyTaskAttachments(123, 456);

        expect(global.fetch).toHaveBeenCalledWith(
            `${API_BASE_URL}/api/task-attachments/copy/123/456`,
            { method: 'POST' }
        );
    });
});
