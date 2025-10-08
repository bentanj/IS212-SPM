import { CurrentUser, Task } from '@/mocks/staff/taskMockData';
import { ALL_DEPARTMENTS, ORGANISATION } from './Organisation';

const AllowEditTask = ['HR/Admin', "Manager"]

export function canEditTask(currentUser: CurrentUser, task: Task) {
    return AllowEditTask.includes(currentUser.systemRole) || task.assignedUsers.some(u => u.userId === currentUser.userId);
}

export function canEditTaskAssignees(currentUser: CurrentUser) {
    return AllowEditTask.includes(currentUser.systemRole);
}

export function determineDepartmentScope(currentUser: CurrentUser) {
    let VisibleDepartments = new Set<string>();

    function dfs(dep: string) {
        if (!VisibleDepartments.has(dep)) {
            VisibleDepartments.add(dep);
            const children = ORGANISATION[dep] || [];
            children.forEach(child => dfs(child));
        }
    }

    dfs(currentUser.department);
    return VisibleDepartments;
}