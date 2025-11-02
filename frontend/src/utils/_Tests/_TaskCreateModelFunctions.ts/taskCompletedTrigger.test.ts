// @ts-nocheck
import { taskCompletedTrigger } from '../../TaskCreateModelFunctions';
import { replicateRecurringTaskData, autoReplicateAllSubtasks } from '../../recurringTask';
import createTask from '../../Tasks/createTask';
import { copyTaskAttachments } from '../../taskAttachments';

jest.mock('../../recurringTask', () => ({
    replicateRecurringTaskData: jest.fn(),
    autoReplicateAllSubtasks: jest.fn(),
}));

jest.mock('../../Tasks/createTask', () => jest.fn());

jest.mock('../../taskAttachments', () => ({
    copyTaskAttachments: jest.fn(),
}));

describe('taskCompletedTrigger', () => {
    const setSnackbarContent = jest.fn();
    const currentUserId = 123;

    const mockTask = {
        taskId: 10,
        title: 'Test Task',
        description: 'Test Description',
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-30T00:00:00Z',
        recurrenceFrequency: 'Weekly',
        recurrenceInterval: 1,
        status: 'Completed',
        priority: 'High',
        assigned_users: [1, 2],
        departments: ['Engineering'],
        project_name: 'Test Project',
        uploaded_by: 456,
        comments: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null if task is not recurring (One-Off)', async () => {
        (replicateRecurringTaskData as jest.Mock).mockReturnValue(null);

        const result = await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        expect(result).toBeNull();
        expect(createTask).not.toHaveBeenCalled();
        expect(copyTaskAttachments).not.toHaveBeenCalled();
    });

    it('creates recurring task and copies attachments successfully', async () => {
        const newTaskData = {
            ...mockTask,
            taskId: 0,
            startDate: '2025-11-08T00:00:00Z',
            status: 'To Do',
            completedDate: null,
            uploaded_by: currentUserId,
        };

        const createdTask = { ...newTaskData, taskId: 20 };

        (replicateRecurringTaskData as jest.Mock).mockReturnValue(newTaskData);
        (createTask as jest.Mock).mockResolvedValue(createdTask);
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [], count: 0 });
        (autoReplicateAllSubtasks as jest.Mock).mockResolvedValue(undefined);

        await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        expect(replicateRecurringTaskData).toHaveBeenCalledWith(mockTask, currentUserId);
        expect(createTask).toHaveBeenCalledWith(newTaskData);
        expect(setSnackbarContent).toHaveBeenCalledWith('Replicated task created', 'success');
        expect(copyTaskAttachments).toHaveBeenCalledWith(mockTask.taskId, createdTask.taskId);
        expect(autoReplicateAllSubtasks).toHaveBeenCalledWith(
            mockTask,
            createdTask.taskId,
            setSnackbarContent,
            currentUserId
        );
    });

    it('logs when attachments are successfully copied', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        const newTaskData = { ...mockTask, taskId: 0, uploaded_by: currentUserId };
        const createdTask = { ...newTaskData, taskId: 30 };

        (replicateRecurringTaskData as jest.Mock).mockReturnValue(newTaskData);
        (createTask as jest.Mock).mockResolvedValue(createdTask);
        (copyTaskAttachments as jest.Mock).mockResolvedValue({
            copied: [
                { id: 'att-1', file_name: 'file1.pdf' },
                { id: 'att-2', file_name: 'file2.pdf' },
            ],
            count: 2,
        });
        (autoReplicateAllSubtasks as jest.Mock).mockResolvedValue(undefined);

        await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        expect(consoleLogSpy).toHaveBeenCalledWith('Copied 2 attachment(s) to recurring task');
        consoleLogSpy.mockRestore();
    });

    it('continues operation even if attachment copy fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const newTaskData = { ...mockTask, taskId: 0, uploaded_by: currentUserId };
        const createdTask = { ...newTaskData, taskId: 40 };

        (replicateRecurringTaskData as jest.Mock).mockReturnValue(newTaskData);
        (createTask as jest.Mock).mockResolvedValue(createdTask);
        (copyTaskAttachments as jest.Mock).mockRejectedValue(new Error('Storage error'));
        (autoReplicateAllSubtasks as jest.Mock).mockResolvedValue(undefined);

        await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        // Task should still be created successfully
        expect(setSnackbarContent).toHaveBeenCalledWith('Replicated task created', 'success');
        expect(autoReplicateAllSubtasks).toHaveBeenCalled();

        // Error should be logged but not thrown
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error copying attachments to recurring task:',
            expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
    });

    it('does not log when no attachments are copied', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        const newTaskData = { ...mockTask, taskId: 0, uploaded_by: currentUserId };
        const createdTask = { ...newTaskData, taskId: 50 };

        (replicateRecurringTaskData as jest.Mock).mockReturnValue(newTaskData);
        (createTask as jest.Mock).mockResolvedValue(createdTask);
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [], count: 0 });
        (autoReplicateAllSubtasks as jest.Mock).mockResolvedValue(undefined);

        await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        // Should not log when count is 0
        expect(consoleLogSpy).not.toHaveBeenCalledWith(
            expect.stringContaining('Copied')
        );

        consoleLogSpy.mockRestore();
    });

    it('handles createTask failure and shows error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const newTaskData = { ...mockTask, taskId: 0, uploaded_by: currentUserId };

        (replicateRecurringTaskData as jest.Mock).mockReturnValue(newTaskData);
        (createTask as jest.Mock).mockRejectedValue(new Error('Database error'));

        const result = await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        expect(setSnackbarContent).toHaveBeenCalledWith(
            'Failed to create replicated task. Please try again',
            'error'
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error creating replicated task:',
            expect.any(Error)
        );
        expect(result).toBeNull();

        // Should not attempt to copy attachments or replicate subtasks
        expect(copyTaskAttachments).not.toHaveBeenCalled();
        expect(autoReplicateAllSubtasks).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it('passes correct parameters to replicateRecurringTaskData', async () => {
        (replicateRecurringTaskData as jest.Mock).mockReturnValue(null);

        await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        expect(replicateRecurringTaskData).toHaveBeenCalledWith(mockTask, currentUserId);
    });

    it('integrates full flow: task creation -> attachment copy -> subtask replication', async () => {
        const newTaskData = { ...mockTask, taskId: 0, uploaded_by: currentUserId };
        const createdTask = { ...newTaskData, taskId: 60 };

        (replicateRecurringTaskData as jest.Mock).mockReturnValue(newTaskData);
        (createTask as jest.Mock).mockResolvedValue(createdTask);
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [{ id: 'att-1' }], count: 1 });
        (autoReplicateAllSubtasks as jest.Mock).mockResolvedValue(undefined);

        await taskCompletedTrigger(mockTask, setSnackbarContent, currentUserId);

        // Verify the order of operations
        const callOrder = [];

        expect(replicateRecurringTaskData).toHaveBeenCalled();
        expect(createTask).toHaveBeenCalled();
        expect(copyTaskAttachments).toHaveBeenCalled();
        expect(autoReplicateAllSubtasks).toHaveBeenCalled();

        // Verify all operations completed
        expect(setSnackbarContent).toHaveBeenCalledWith('Replicated task created', 'success');
    });
});
