import { CurrentUser, Task } from '@/mocks/staff/taskMockData';

const AllowEditTask = ['HR/Admin', "Manager"]

export function canEditTask(currentUser: CurrentUser, task: Task) {
    return AllowEditTask.includes(currentUser.systemRole) || task.assignedUsers.some(u => u.userId === currentUser.userId);
}

export function canEditTaskAssignees(currentUser: CurrentUser) {
    return AllowEditTask.includes(currentUser.systemRole);
}