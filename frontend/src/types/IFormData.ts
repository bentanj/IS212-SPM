import { Dayjs } from 'dayjs';
import { User } from '@/mocks/staff/taskMockData';

interface FormData {
    title: string;
    description: string;
    startDate: Dayjs | null;
    completedDate: Dayjs | null;
    dueDate: Dayjs | null;
    priority: 'Low' | 'Medium' | 'High' | '';
    assignedUsers: User[];
    tags: string[];
    status: 'To Do' | 'In Progress' | 'Completed' | 'Blocked' | '';
    comments: string;
    projectName: string;
    attachedFile: File | null;
}

export default FormData;