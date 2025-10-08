import { Dayjs } from 'dayjs';
import { User } from '@/mocks/staff/taskMockData';
import Priority from './TPriority';
import Status from './TStatus';
import { Departments } from './TOrganisation';

interface FormData {
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

export default FormData;