import { FormData } from "@/types";

export const PriorityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ''];

export const StatusOptions = ["To Do", "In Progress", "Completed", "Blocked", ''];

export const RecurrenceFreqOptions = ["One-Off", "Daily", "Weekly", "Monthly", "Yearly"];

const DefaultFormData: Omit<FormData, "taskId"> = {
    title: '',
    description: '',
    project_name: '',
    startDate: null,
    dueDate: null,
    completedDate: null,
    departments: [],
    priority: '',
    status: '',
    recurrenceFrequency: 'One-Off',
    recurrenceInterval: null,
    assignedUsers: [],
    tags: [],
    comments: '',
    attachedFile: null,
    parentTaskId: null,
}

export default DefaultFormData;