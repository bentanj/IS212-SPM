import { CurrentUser, Task } from '@/mocks/staff/taskMockData';
import { ORGANISATION } from './Organisation';

const AllowEditTask = ['HR/Admin', "Manager"]

export function canEditTask(currentUser: CurrentUser, task: Task) {
    return AllowEditTask.includes(currentUser.systemRole) || task.assignedUsers.some(u => u.userId === currentUser.userId);
}

export function canEditTaskAssignees(currentUser: CurrentUser) {
    return AllowEditTask.includes(currentUser.systemRole);
}

export function determineDepartmentScope(currentUser: CurrentUser) {
    let VisibleDepartments = [];

    VisibleDepartments.push(currentUser.department);
    if (ORGANISATION[currentUser.department].length != 0) {
        VisibleDepartments = VisibleDepartments.concat(ORGANISATION[currentUser.department]);
    }

    return VisibleDepartments;
}