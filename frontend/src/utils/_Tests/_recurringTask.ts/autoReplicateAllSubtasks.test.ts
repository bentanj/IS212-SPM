// @ts-nocheck
import { getSubtasks } from '@/utils/Tasks/getTask';
import createTask from '@/utils/Tasks/createTask';
import { autoReplicateAllSubtasks } from '../../recurringTask';
import * as recurringTaskModule from '../../recurringTask';
import { copyTaskAttachments } from '../../taskAttachments';

// Top-level module mock
jest.mock('../../recurringTask', () => {
    const originalModule = jest.requireActual('../../recurringTask');
    return {
        __esModule: true,
        ...originalModule,
        replicateRecurringSubtaskData: jest.fn(),
    };
});

jest.mock('@/utils/Tasks/getTask', () => ({
    getSubtasks: jest.fn(),
}));

jest.mock('@/utils/Tasks/createTask', () => jest.fn());

jest.mock('../../taskAttachments', () => ({
    copyTaskAttachments: jest.fn(),
}));

describe('autoReplicateAllSubtasks', () => {
    const parentTask = {
        taskId: 1,
        recurrenceFrequency: 'Weekly',
        recurrenceInterval: 1,
        dueDate: '2025-11-01 00:00:00',
        uploaded_by: 123,
    };

    const setSnackBarContent = jest.fn();
    const currentUserId = 456;

    beforeEach(() => {
        jest.clearAllMocks();
        recurringTaskModule.replicateRecurringSubtaskData.mockReset();
    });

    it('creates all subtasks successfully and shows success snackbar', async () => {
        const subtasks = [
            { taskId: 10, assignedUsers: [{ userId: 'u1' }], title: 'Subtask 1', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
            { taskId: 11, assignedUsers: [{ userId: 'u2' }], title: 'Subtask 2', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock).mockResolvedValue({ taskId: 100 });
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [], count: 0 });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(getSubtasks).toHaveBeenCalledWith('1');
        expect(createTask).toHaveBeenCalledTimes(subtasks.length);
        expect(setSnackBarContent).toHaveBeenCalledWith(
            `${subtasks.length} recurring subtasks have been created.`,
            'success'
        );
    });

    it('handles createTask errors gracefully', async () => {
        const subtasks = [
            { taskId: 10, assignedUsers: [{ userId: 'u1' }], title: 'Subtask 1', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock).mockRejectedValue(new Error('Database error'));
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [], count: 0 });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(setSnackBarContent).toHaveBeenCalledWith(
            expect.stringContaining('Only 0 out of 1 recurring subtasks have been created.'),
            'warning'
        );
    });

    it('handles mixed success and failure scenarios', async () => {
        const subtasks = [
            { taskId: 10, assignedUsers: [{ userId: 'u1' }], title: 'Subtask 1', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
            { taskId: 11, assignedUsers: [{ userId: 'u2' }], title: 'Subtask 2', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock)
            .mockResolvedValueOnce({ taskId: 100 })
            .mockRejectedValueOnce(new Error('Second task failed'));
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [], count: 0 });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(setSnackBarContent).toHaveBeenCalledWith(
            expect.stringContaining('Only 1 out of 2 recurring subtasks have been created.'),
            'warning'
        );
    });

    it('copies attachments from original subtask to new subtask', async () => {
        const subtasks = [
            { taskId: 10, assignedUsers: [{ userId: 'u1' }], title: 'Subtask 1', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock).mockResolvedValue({ taskId: 200 });
        (copyTaskAttachments as jest.Mock).mockResolvedValue({
            copied: [{ id: 'att-1', file_name: 'doc.pdf' }],
            count: 1
        });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(copyTaskAttachments).toHaveBeenCalledWith(10, 200);
        expect(setSnackBarContent).toHaveBeenCalledWith(
            '1 recurring subtasks have been created.',
            'success'
        );
    });

    it('logs when attachments are copied to subtasks', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        const subtasks = [
            { taskId: 20, assignedUsers: [{ userId: 'u1' }], title: 'Subtask A', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock).mockResolvedValue({ taskId: 300 });
        (copyTaskAttachments as jest.Mock).mockResolvedValue({
            copied: [
                { id: 'att-1', file_name: 'report.pdf' },
                { id: 'att-2', file_name: 'data.xlsx' },
            ],
            count: 2
        });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(consoleLogSpy).toHaveBeenCalledWith('Copied 2 attachment(s) to recurring subtask 300');
        consoleLogSpy.mockRestore();
    });

    it('continues operation even if attachment copy fails for a subtask', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const subtasks = [
            { taskId: 30, assignedUsers: [{ userId: 'u1' }], title: 'Subtask B', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock).mockResolvedValue({ taskId: 400 });
        (copyTaskAttachments as jest.Mock).mockRejectedValue(new Error('Storage error'));
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        // Subtask should still be created successfully
        expect(setSnackBarContent).toHaveBeenCalledWith(
            '1 recurring subtasks have been created.',
            'success'
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error copying attachments for subtask Subtask B:',
            expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
    });

    it('does not log when no attachments are copied to subtasks', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        const subtasks = [
            { taskId: 40, assignedUsers: [{ userId: 'u1' }], title: 'Subtask C', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock).mockResolvedValue({ taskId: 500 });
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [], count: 0 });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(consoleLogSpy).not.toHaveBeenCalledWith(
            expect.stringContaining('Copied')
        );

        consoleLogSpy.mockRestore();
    });

    it('copies attachments for multiple subtasks correctly', async () => {
        const subtasks = [
            { taskId: 50, assignedUsers: [{ userId: 'u1' }], title: 'Subtask D', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
            { taskId: 51, assignedUsers: [{ userId: 'u2' }], title: 'Subtask E', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock)
            .mockResolvedValueOnce({ taskId: 600 })
            .mockResolvedValueOnce({ taskId: 601 });
        (copyTaskAttachments as jest.Mock)
            .mockResolvedValueOnce({ copied: [{ id: 'att-1' }], count: 1 })
            .mockResolvedValueOnce({ copied: [{ id: 'att-2' }, { id: 'att-3' }], count: 2 });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(copyTaskAttachments).toHaveBeenCalledWith(50, 600);
        expect(copyTaskAttachments).toHaveBeenCalledWith(51, 601);
        expect(copyTaskAttachments).toHaveBeenCalledTimes(2);
    });

    it('filters out replicated subtasks and only processes original subtasks', async () => {
        const subtasks = [
            { taskId: 60, assignedUsers: [{ userId: 'u1' }], title: 'Original Subtask', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-08 00:00:00' },
            { taskId: 61, assignedUsers: [{ userId: 'u2' }], title: 'Replicated Subtask', startDate: '2025-10-08 00:00:00', dueDate: '2025-10-15 00:00:00', IsReplicateFromCompletedSubtask: true },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        (createTask as jest.Mock).mockResolvedValue({ taskId: 700 });
        (copyTaskAttachments as jest.Mock).mockResolvedValue({ copied: [], count: 0 });
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, newParentId, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        // Should only create one subtask (the original one)
        expect(createTask).toHaveBeenCalledTimes(1);
        expect(copyTaskAttachments).toHaveBeenCalledTimes(1);
        expect(setSnackBarContent).toHaveBeenCalledWith(
            '1 recurring subtasks have been created.',
            'success'
        );
    });

    it('returns early if parent task has no subtasks', async () => {
        (getSubtasks as jest.Mock).mockResolvedValue([]);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(createTask).not.toHaveBeenCalled();
        expect(copyTaskAttachments).not.toHaveBeenCalled();
        expect(setSnackBarContent).not.toHaveBeenCalled();
    });

    // it('handles createTask rejection when taskData object is incomplete', async () => {
    //     const subtasks = [
    //         { taskId: 12, assignedUsers: [{ userId: 'u3' }], title: 'Subtask 3', startDate: '', dueDate: '' },
    //     ];

    //     (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
    //     recurringTaskModule.replicateRecurringSubtaskData.mockReturnValueOnce(subtasks[0]);
    //     (createTask as jest.Mock).mockRejectedValue(new Error('Creation failed'));

    //     await autoReplicateAllSubtasks(parentTask, setSnackBarContent);

    //     expect(setSnackBarContent).toHaveBeenCalledWith(
    //         expect.stringContaining(
    //             'Only 0 out of 1 recurring subtasks have been created. Errors: Error creating recurring subtask Subtask 3: RangeError: Invalid time value at Date.toISOString'
    //         ),
    //         'warning'
    //     );

    //     expect(consoleErrorSpy).toHaveBeenCalledWith(
    //         'Error creating recurring subtask Subtask 3: RangeError: Invalid time value at Date.toISOString'
    //     );

    //     consoleErrorSpy.mockRestore();
    // });
});