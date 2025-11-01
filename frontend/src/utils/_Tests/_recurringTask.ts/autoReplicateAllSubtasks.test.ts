// @ts-nocheck
import { getSubtasks } from '@/utils/Tasks/getTask';
import createTask from '@/utils/Tasks/createTask';
import { autoReplicateAllSubtasks } from '../../recurringTask';
import * as recurringTaskModule from '../../recurringTask';

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
        (createTask as jest.Mock).mockResolvedValue({});
        recurringTaskModule.replicateRecurringSubtaskData.mockImplementation((parent, subtask) => subtask);

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(getSubtasks).toHaveBeenCalledWith('1');
        expect(createTask).toHaveBeenCalledTimes(subtasks.length);
        expect(setSnackBarContent).toHaveBeenCalledWith(
            `${subtasks.length} recurring subtasks have been created.`,
            'success'
        );
    });

    it('handles string error returns from replicateRecurringSubtaskData when new startDate more than parentTask dueDate', async () => {
        const subtasks = [
            { taskId: 10, assignedUsers: [{ userId: 'u1' }], title: 'Subtask 1', startDate: '2025-10-30 00:00:00', dueDate: '2025-10-31 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        recurringTaskModule.replicateRecurringSubtaskData.mockReturnValueOnce('Error replicating subtask');

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(setSnackBarContent).toHaveBeenCalledWith(
            expect.stringContaining('Only 0 out of 1 recurring subtasks have been created.'),
            'warning'
        );
    });

    it('handles string error returns from replicateRecurringSubtaskData when new dueDate more than parentTask dueDate', async () => {
        const subtasks = [
            { taskId: 10, assignedUsers: [{ userId: 'u1' }], title: 'Subtask 1', startDate: '2025-10-01 00:00:00', dueDate: '2025-10-31 00:00:00' },
        ];

        (getSubtasks as jest.Mock).mockResolvedValue(subtasks);
        recurringTaskModule.replicateRecurringSubtaskData.mockReturnValueOnce('Error replicating subtask');

        await autoReplicateAllSubtasks(parentTask, 2, setSnackBarContent, currentUserId);

        expect(setSnackBarContent).toHaveBeenCalledWith(
            expect.stringContaining('Only 0 out of 1 recurring subtasks have been created.'),
            'warning'
        );
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