import { Departments } from "./TOrganisation";
import Priority from "./TPriority";
import Status from "./TStatus";
import User from "./IUser";
import Comment from "./IComment";

export default interface Task {
    taskId: number;
    title: string;
    description: string;
    projectName: string;
    department: Departments[];
    priority: Priority;
    status: Status;
    startDate: string;
    dueDate: string;
    completedDate: string | null;
    assignedUsers: User[];
    tags: string[];
    comments: Comment[];
    parentTaskId?: number;
}