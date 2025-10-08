import IFormData from "@/types/IFormData";

export const PriorityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ''];

export const StatusOptions = ["To Do", "In Progress", "Completed", "Blocked", ''];

const DefaultFormData: IFormData = {
    title: '',
    description: '',
    projectName: '',
    startDate: null,
    dueDate: null,
    completedDate: null,
    department: '',
    priority: '',
    status: '',
    assignedUsers: [],
    tags: [],
    comments: '',
    attachedFile: null,
}

export default DefaultFormData;