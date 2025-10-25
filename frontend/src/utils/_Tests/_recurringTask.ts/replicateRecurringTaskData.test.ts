// @ts-nocheck
import { replicateRecurringTaskData } from '../../recurringTask';
import dayjs from 'dayjs';
import { APITaskParams } from '@/types';

describe('replicateRecurringTaskData', () => {
    const baseTask: APITaskParams = {
        taskId: 1,
        startDate: '2025-10-20 09:00:00',
        dueDate: '2025-10-30 17:00:00',
        recurrenceFrequency: 'Daily',
        recurrenceInterval: 2,
        completedDate: null,
        status: 'To Do',
        comments: [],
        // other required fields of APITaskParams can be mocked here...
    };

    it('returns null for One-Off frequency', () => {
        const task = { ...baseTask, recurrenceFrequency: 'One-Off' };
        expect(replicateRecurringTaskData(task)).toBeNull();
    });

    it('returns null if recurringTaskDate returns null (interval or freq invalid)', () => {
        const task = { ...baseTask, recurrenceFrequency: 'One-Off', recurrenceInterval: null };
        expect(replicateRecurringTaskData(task)).toBeNull();
    });

    it('returns new task with adjusted startDate and reset fields', () => {
        const newTask = replicateRecurringTaskData(baseTask);
        expect(newTask).not.toBeNull();
        expect(newTask?.taskId).toBe(0);
        expect(newTask?.status).toBe('To Do');
        expect(newTask?.completedDate).toBeNull();
        expect(newTask?.comments).toEqual([]);
        expect(newTask?.startDate).toBe(dayjs(baseTask.startDate.replace(" ", "T")).add(2, 'day').toISOString());
    });

    it('returns null if new startDate is after original dueDate', () => {
        const task = {
            ...baseTask,
            startDate: '2025-10-29 09:00:00',
            dueDate: '2025-10-30 08:00:00',
            recurrenceFrequency: 'Daily',
            recurrenceInterval: 2,
        };
        // The new start date will be 2025-10-31 which is after dueDate 2025-10-30, expect null
        expect(replicateRecurringTaskData(task)).toBeNull();
    });
});