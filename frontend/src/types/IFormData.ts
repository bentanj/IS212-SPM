import { Dayjs } from 'dayjs';
import { Task } from '@/types';

export interface FormData extends
    Omit<Task, "startDate" | "dueDate" | "completedDate" | "comments"> {
    startDate: Dayjs | null;
    dueDate: Dayjs | null;
    completedDate: Dayjs | null;
    recurrenceFrequency?: string | null;
    recurrenceInterval?: number | null;
    recurrenceEndDate?: Dayjs | null;
    comments?: string | null;
    attachedFile?: File | null;
}