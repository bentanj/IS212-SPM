import IFormData from "@/types/IFormData";

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