import IFormData from "@/types/IFormData";

export const PriorityOptions = ['Low', 'Medium', 'High', ''];

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