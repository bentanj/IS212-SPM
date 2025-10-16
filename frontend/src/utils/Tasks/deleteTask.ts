import { Task } from "@/types";

const TASK_PORT = process.env.TASK_SERVICE_PORT || 8000;

export default async function deleteTask(updatedTask: Task) {
    const taskId = updatedTask.taskId;

    try {
        const response = await fetch(`http://localhost:${TASK_PORT}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
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