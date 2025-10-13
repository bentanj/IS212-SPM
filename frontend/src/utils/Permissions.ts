import { User, Task } from '@/types';
import { ORGANISATION } from '@/constants/Organisation';

const AllowEditTask = ['HR/Admin', "Manager"]

export function canEditTask(currentUser: User, task: Task) {
    return AllowEditTask.includes(currentUser.role) || task.assignedUsers.some(u => u.userId === currentUser.userId);
}

export function canEditTaskAssignees(currentUser: User) {
    return AllowEditTask.includes(currentUser.role);
}

export function determineDepartmentScope(currentUser: User) {
    let VisibleDepartments = [];

    VisibleDepartments.push(currentUser.department);
    if (ORGANISATION[currentUser.department].length != 0) {
        VisibleDepartments = VisibleDepartments.concat(ORGANISATION[currentUser.department]);
    }

    return VisibleDepartments;
}