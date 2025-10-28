import createTask from '@/utils/Tasks/createTask';
import { APITaskParams } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('createTask', () => {
  const mockTaskData: APITaskParams = {
    taskId: 0,
    title: 'Test Task',
    description: 'Test Description',
    startDate: '2025-01-01T00:00:00Z',
    dueDate: '2025-01-31T00:00:00Z',
    priority: 5,
    status: 'To Do',
    project_name: 'Test Project',
    assigned_users: [1],
    tags: ['test'],
    departments: ['IT'],
    uploaded_by: 1,
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when files are provided', () => {
    test('sends multipart/form-data request', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ taskId: 123, ...mockTaskData }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const files = [
        new File(['content'], 'test.pdf', { type: 'application/pdf' }),
      ];

      await createTask(mockTaskData, files);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      // Verify headers don't include Content-Type (browser sets it with boundary)
      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers).toBeUndefined();
    });

    test('appends multiple files correctly', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ taskId: 123, ...mockTaskData }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const files = [
        new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'test2.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        new File(['content3'], 'test3.pdf', { type: 'application/pdf' }),
      ];

      await createTask(mockTaskData, files);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const formData = callArgs.body as FormData;

      // Verify task_data is appended
      expect(formData.get('task_data')).toBeTruthy();

      // Verify all files are appended
      const appendedFiles = formData.getAll('files');
      expect(appendedFiles).toHaveLength(3);
    });

    test('includes task data as JSON string', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ taskId: 123, ...mockTaskData }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];

      await createTask(mockTaskData, files);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const formData = callArgs.body as FormData;
      const taskDataString = formData.get('task_data') as string;
      const parsedTaskData = JSON.parse(taskDataString);

      expect(parsedTaskData).toEqual(mockTaskData);
    });

    test('throws error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid task data' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];

      await expect(createTask(mockTaskData, files)).rejects.toThrow(
        'HTTP error! Status: 400'
      );
    });
  });

  describe('when no files are provided', () => {
    test('sends JSON request with Content-Type header', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ taskId: 123, ...mockTaskData }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await createTask(mockTaskData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockTaskData),
        })
      );
    });

    test('sends JSON when files array is empty', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ taskId: 123, ...mockTaskData }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await createTask(mockTaskData, []);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(callArgs.body).toBe(JSON.stringify(mockTaskData));
    });

    test('returns created task data', async () => {
      const createdTask = { taskId: 123, ...mockTaskData };
      const mockResponse = {
        ok: true,
        json: async () => createdTask,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createTask(mockTaskData);

      expect(result).toEqual(createdTask);
    });

    test('throws error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(createTask(mockTaskData)).rejects.toThrow('HTTP error! Status: 500');
    });
  });

  describe('error handling', () => {
    test('logs error and rethrows on network failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(createTask(mockTaskData)).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating task:',
        networkError
      );

      consoleErrorSpy.mockRestore();
    });
  });
});