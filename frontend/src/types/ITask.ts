import { Departments, Priority, Status, RecurrenceFrequency, User, Comment } from "@/types";

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
    recurrenceFrequency: RecurrenceFrequency;
    recurrenceInterval: number | null;
    completedDate: string | null;
    assignedUsers: User[];
    tags: string[];
    comments: Comment[];
    parentTaskId?: number | null;
    IsReplicateFromCompletedSubtask: boolean;
}

export interface APITaskParams extends Omit<Task, 'assignedUsers'> {
    assigned_users: number[]; // Only require array of user IDs for API, not full User objects
}