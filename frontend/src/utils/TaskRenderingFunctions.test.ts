// @ts-nocheck
import {
    getPriorityColor,
    getTaskTypeColor,
    getStatusColor,
    isTaskOverdue,
} from './TaskRenderingFunctions';
import dayjs from 'dayjs';

describe('getPriorityColor', () => {
    it('returns default color for non-number priority', () => {
        expect(getPriorityColor('high' as any)).toBe('#9e9e9e');
        expect(getPriorityColor(null as any)).toBe('#9e9e9e');
    });

    it('returns red (#f44336) for priority >= 7', () => {
        expect(getPriorityColor(7)).toBe('#f44336');
        expect(getPriorityColor(10)).toBe('#f44336');
    });

    it('returns orange (#ff9800) for priority between 4 and 6', () => {
        expect(getPriorityColor(4)).toBe('#ff9800');
        expect(getPriorityColor(6)).toBe('#ff9800');
    });

    it('returns blue (#2196f3) for priority between 1 and 3', () => {
        expect(getPriorityColor(1)).toBe('#2196f3');
        expect(getPriorityColor(3)).toBe('#2196f3');
    });

    it('returns default color for priority less than 1', () => {
        expect(getPriorityColor(0)).toBe('#9e9e9e');
        expect(getPriorityColor(-1)).toBe('#9e9e9e');
    });
});

describe('isTaskOverdue', () => {
    const today = dayjs().startOf('day').toISOString();

    it('returns false if task is Completed', () => {
        expect(isTaskOverdue({ status: 'Completed' } as any)).toBe(false);
    });

    it('returns false if task has no dueDate', () => {
        expect(isTaskOverdue({ status: 'In Progress' } as any)).toBe(false);
    });

    it('returns true if dueDate is before today', () => {
        const overdueDate = dayjs().subtract(1, 'day').toISOString();
        expect(
            isTaskOverdue({ status: 'In Progress', dueDate: overdueDate } as any)
        ).toBe(true);
    });

    it('returns false if dueDate is today or future', () => {
        expect(
            isTaskOverdue({ status: 'In Progress', dueDate: today } as any)
        ).toBe(false);

        const futureDate = dayjs().add(1, 'day').toISOString();
        expect(
            isTaskOverdue({ status: 'In Progress', dueDate: futureDate } as any)
        ).toBe(false);
    });
});

describe('getTaskTypeColor', () => {
    it('returns overdue color (#A31414) if task overdue', () => {
        const task = {
            status: 'In Progress',
            dueDate: dayjs().subtract(1, 'day').toISOString(),
            priority: 3,
            parentTaskId: undefined,
        };
        expect(getTaskTypeColor(task as any)).toBe('#A31414');
    });

    it('returns yellow (#ffeb3b) if task is subtask (has parentTaskId)', () => {
        const task = {
            status: 'In Progress',
            dueDate: dayjs().add(1, 'day').toISOString(),
            priority: 3,
            parentTaskId: 'parent-1',
        };
        expect(getTaskTypeColor(task as any)).toBe('#ffeb3b');
    });

    it('returns priority color otherwise', () => {
        const task = {
            status: 'In Progress',
            dueDate: dayjs().add(1, 'day').toISOString(),
            priority: 5,
            parentTaskId: undefined,
        };
        expect(getTaskTypeColor(task as any)).toBe(getPriorityColor(5));
    });
});

describe('getStatusColor', () => {
    it('returns correct colors for known statuses', () => {
        expect(getStatusColor('Completed')).toBe('success');
        expect(getStatusColor('In Progress')).toBe('primary');
        expect(getStatusColor('Blocked')).toBe('error');
        expect(getStatusColor('To Do')).toBe('default');
    });

    it('returns default for unknown status', () => {
        expect(getStatusColor('UnknownStatus')).toBe('default');
        expect(getStatusColor('')).toBe('default');
    });
});
