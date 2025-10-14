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

export async function getTaskById(taskId = ""): Promise<Task[]> {

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

    let targetURL = `http://localhost:${TASK_PORT}/api/filter`;

    const departmentScope = determineDepartmentScope(user);
    console.log(departmentScope)

    try {
        const response = await fetch(targetURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "departments": departmentScope }),
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}.\n${errorMessage.error}`);
        }

        return await response.json();
    }
    catch (error) {
        console.error("Error getting User's tasks:", error);
        throw error;
    }
}