import { APITaskParams } from "@/types";

const TASK_PORT = process.env.TASK_SERVICE_PORT || 8000;

export default async function createTask(newTask: APITaskParams) {

    try {
        const response = await fetch(`http://localhost:${TASK_PORT}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}.\n${errorMessage.error}`);
        }

        return await response.json();
    }
    catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
}