//@ts-nocheck
import dayjs from 'dayjs';
import { replicateRecurringSubtaskData } from '../../recurringTask';
import { APITaskParams, Task } from '@/types';

describe('replicateRecurringSubtaskData', () => {
    const parentTask: APITaskParams = {
        taskId: 1,
        recurrenceFrequency: 'Weekly',
        recurrenceInterval: 1,
        dueDate: '2025-11-01',
    } as any;

    it('returns correctly adjusted subtask with new dates and reset fields', () => {
        const subtask: Task = {
            taskId: 10,
            title: 'Subtask 1',
            startDate: '2025-10-20 00:00:00',
            dueDate: '2025-10-25 00:00:00',
            completedDate: '2025-10-22',
            status: 'In Progress',
        } as any;

        const result = replicateRecurringSubtaskData(parentTask, subtask);

        expect(typeof result).toBe('object');
        expect(result.taskId).toBe(0);
        expect(result.startDate).toBe(dayjs(subtask.startDate.replace(" ", "T")).add(1, 'week').toISOString());
        expect(result.dueDate).toBe(dayjs(subtask.dueDate.replace(" ", "T")).add(1, 'week').toISOString());
        expect(result.completedDate).toBeNull();
        expect(result.status).toBe('To Do');
    });

    it('returns error string if new start date exceeds parent task due date', () => {
        const badParent = { ...parentTask, dueDate: '2025-10-22' }; // before subtask new start date
        const subtask: Task = {
            startDate: '2025-10-20 09:00:00',
            dueDate: '2025-10-25 18:00:00',
            title: 'Bad Subtask',
        } as any;

        const result = replicateRecurringSubtaskData(badParent, subtask);

        expect(typeof result).toBe('string');
        expect(result).toContain('start date exceeds parent task due date');
    });

    it('returns error string if new due date exceeds parent task due date', () => {
        const badParent = { ...parentTask, dueDate: '2025-10-26' }; // before subtask new due date
        const subtask: Task = {
            startDate: '2025-10-10 09:00:00',
            dueDate: '2025-10-20 18:00:00',
            title: 'Bad DueDate Subtask',
        } as any;

        const result = replicateRecurringSubtaskData(badParent, subtask);

        expect(typeof result).toBe('string');
        expect(result).toContain('due date exceeds parent task due date');
    });
});