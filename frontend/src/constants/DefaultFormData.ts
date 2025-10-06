import IFormData from "@/types/IFormData";

export const PriorityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ''];

export const StatusOptions = ["To Do", "In Progress", "Completed", "Blocked", ''];

const DefaultFormData: IFormData = {
    title: '',
    description: '',
    startDate: null,
    completedDate: null,
    dueDate: null,
    priority: '',
    assignedUsers: [],
    tags: [],
    status: '',
    comments: '',
    projectName: '',
    attachedFile: null,
}

export default DefaultFormData;