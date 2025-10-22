// @ts-nocheck
import { recurringTaskDate } from '../../recurringTask';
import dayjs from 'dayjs';

describe('recurringTaskDate utility', () => {
    // Import the function via require or re-export if needed, example assumes you export it directly for testing
    // Otherwise you can test it indirectly via replicateRecurringTaskData tests above

    it('should return correct new start date for valid inputs', () => {
        const task = {
            startDate: '2025-10-20 09:00:00',
            dueDate: '2025-10-30 17:00:00',
            recurrenceFrequency: 'Weekly',
            recurrenceInterval: 1,
        };
        const result = recurringTaskDate(task);
        expect(result?.isSame(dayjs(task.startDate.replace(" ", "T")).add(1, 'week'))).toBe(true);
    });

    it('should return null for One-Off frequency', () => {
        const task = {
            startDate: '2025-10-20 09:00:00',
            dueDate: '2025-10-30 17:00:00',
            recurrenceFrequency: 'One-Off',
            recurrenceInterval: 1,
        };
        expect(recurringTaskDate(task)).toBeNull();
    });

    it('should return null if interval is null', () => {
        const task = {
            startDate: '2025-10-20 09:00:00',
            dueDate: '2025-10-30 17:00:00',
            recurrenceFrequency: 'Weekly',
            recurrenceInterval: null,
        };
        expect(recurringTaskDate(task)).toBeNull();
    });

    it('should return null if new start date is after due date', () => {
        const task = {
            startDate: '2025-10-29 09:00:00',
            dueDate: '2025-10-30 08:00:00',
            recurrenceFrequency: 'Daily',
            recurrenceInterval: 2,
        };
        expect(recurringTaskDate(task)).toBeNull();
    });
});
