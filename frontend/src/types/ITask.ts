import { Departments, Priority, Status, User, Comment } from "@/types";

export interface Task {
    taskId: number;
    title: string;
    description: string;
    project_name: string;
    departments: Departments[];
    priority: Priority;
    status: Status;
    startDate: string;
    dueDate: string;
    completedDate: string | null;
    assignedUsers: User[];
    tags: string[];
    comments: Comment[];
    parentTaskId?: number | null;
}