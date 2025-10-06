import { Dayjs } from 'dayjs';
import { User } from '@/mocks/staff/taskMockData';
import Priority from './TPriority';
import Status from './TStatus';

interface FormData {
    title: string;
    description: string;
    startDate: Dayjs | null;
    completedDate: Dayjs | null;
    dueDate: Dayjs | null;
    priority: Priority;
    assignedUsers: User[];
    tags: string[];
    status: Status;
    comments: string;
    projectName: string;
    attachedFile: File | null;
    parentTaskId?: number | null; // New
}

export default FormData;