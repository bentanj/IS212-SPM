// @ts-nocheck
import { validateCanCompleteTask } from '../../TaskCreateModelFunctions';
import { APITaskParams } from '@/types';
import { AlertColor } from '@mui/material';

// Mock getSubtasks to control subtasks returned
jest.mock('@/utils/Tasks/getTask', () => ({
    getSubtasks: jest.fn(),
}));

import { getSubtasks } from '@/utils/Tasks/getTask';

describe('validateCanCompleteTask', () => {
    const mockSetSnackbarContent = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns true immediately if task is a subtask (has parentTaskId)', async () => {
        const subtask: APITaskParams = {
            taskId: 2,
            parentTaskId: '1',
            // other properties as needed...
        } as any;

        const result = await validateCanCompleteTask(subtask, mockSetSnackbarContent);
        expect(result).toBe(true);
        expect(mockSetSnackbarContent).not.toHaveBeenCalled();
    });

    it('returns false and sets error snackbar if there are incomplete subtasks', async () => {
        const mainTask: APITaskParams = {
            taskId: 1,
            parentTaskId: null,
        } as any;

        (getSubtasks as jest.Mock).mockResolvedValue([
            { taskId: 'subtask-1', status: 'Completed' },
            { taskId: 'subtask-2', status: 'In Progress' },
        ]);

        const result = await validateCanCompleteTask(mainTask, mockSetSnackbarContent);
        expect(getSubtasks).toHaveBeenCalledWith('1');
        expect(mockSetSnackbarContent).toHaveBeenCalledWith(
            'Complete all subtasks before completing the main task.',
            'error'
        );
        expect(result).toBe(false);
    });

    it('returns true if all subtasks are completed', async () => {
        const mainTask: APITaskParams = {
            taskId: 1,
            parentTaskId: null,
        } as any;

        (getSubtasks as jest.Mock).mockResolvedValue([
            { taskId: 'subtask-1', status: 'Completed' },
            { taskId: 'subtask-2', status: 'Completed' },
        ]);

        const result = await validateCanCompleteTask(mainTask, mockSetSnackbarContent);
        expect(getSubtasks).toHaveBeenCalledWith('1');
        expect(mockSetSnackbarContent).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });
});
