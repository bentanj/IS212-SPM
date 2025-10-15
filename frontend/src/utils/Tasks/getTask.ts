import { Task, User } from "@/types";
import { determineDepartmentScope } from "@/utils/Permissions";

const TASK_PORT = process.env.TASK_SERVICE_PORT || 8000;

export async function getAllTasks(): Promise<Task[]> {

    let targetURL = `http://localhost:${TASK_PORT}/api/tasks`;

    try {
        const response = await fetch(targetURL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}.\n${errorMessage.error}`);
        }

        return await response.json();
    }
    catch (error) {
        console.error("Error getting all task:", error);
        throw error;
    }
}

export async function getTaskById(taskId: string): Promise<Task> {

    let targetURL = `http://localhost:${TASK_PORT}/api/tasks/${taskId}`;

    try {
        const response = await fetch(targetURL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}.\n${errorMessage.error}`);
        }

        return await response.json();
    }
    catch (error) {
        console.error("Error getting task by ID:", error);
        throw error;
    }
}

export async function getUserTask(user: User): Promise<Task[]> {

    let taskArray: Task[] = [];
    let getDepartmentTasksURL = `http://localhost:${TASK_PORT}/api/tasks/filter`;

    // Get tasks assigned to user's department(s)
    const departmentScope = determineDepartmentScope(user);
    try {
        const response = await fetch(getDepartmentTasksURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "departments": departmentScope }),
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}.\n${errorMessage.error}`);
        }

        const departmentTasks = await response.json();
        taskArray.push(...departmentTasks);
    }
    catch (error) {
        console.error("Error getting User's Department Tasks:", error);
        throw error;
    }

    // Get tasks assigned directly to user
    let userTaskURL = `http://localhost:${TASK_PORT}/api/tasks/user/${user.userId}`;
    try {
        const response = await fetch(userTaskURL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}.\n${errorMessage.error}`);
        }

        const userTasks = await response.json();
        taskArray.push(...userTasks);
    }
    catch (error) {
        console.error("Error getting User's Assigned Tasks:", error);
        throw error;
    }

    // Remove duplicate tasks (if any) based on task ID
    const uniqueTasksMap = new Map<string, Task>();
    for (const task of taskArray) {
        uniqueTasksMap.set(String(task.taskId), task);
    }
    return Array.from(uniqueTasksMap.values());
}