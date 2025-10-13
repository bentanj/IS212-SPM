import { Dayjs } from 'dayjs';
import { User, Priority, Status, Departments } from '@/types';

export interface FormData {
    title: string;
    description: string;
    projectName: string;
    department: Departments;
    priority: Priority;
    status: Status;
    startDate: Dayjs | null;
    dueDate: Dayjs | null;
    completedDate: Dayjs | null;
    assignedUsers: User[];
    tags: string[];
    comments: string;
    attachedFile: File | null;
    parentTaskId?: number | null; // New
}