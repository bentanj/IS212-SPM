import { Task } from '@/mocks/staff/taskMockData';
import Priority from '@/types/TPriority';
import dayjs from 'dayjs';

export const getPriorityColor = (priority: Priority) => {
    if (typeof priority !== 'number') return '#9e9e9e';
    if (priority >= 7) return '#f44336';
    if (priority >= 4) return '#ff9800';
    if (priority >= 1) return '#2196f3';
    return '#9e9e9e';
};

export const getTaskTypeColor = (task: Task) => {
    if (isTaskOverdue(task)) return '#A31414';
    if (task.parentTaskId) return '#ffeb3b';
    return getPriorityColor(task.priority);
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'primary';
        case 'Blocked': return 'error';
        case 'To Do': return 'default';
        default: return 'default';
    }
};

export const isTaskOverdue = (task: Task): boolean => {
    // Don't mark completed tasks as overdue
    if (task.status === 'Completed') return false;
    
    if (!task.dueDate) return false;
    
    const today = dayjs().startOf('day');
    const due = dayjs(task.dueDate).startOf('day');
    
    return due.isBefore(today);
};
