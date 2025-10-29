import { APITaskParams } from "@/types";

const TASK_PORT = process.env.TASK_SERVICE_PORT || 8000;

export default async function createTask(newTask: APITaskParams, files?: File[]) {

    try {
        // If files are provided, send as multipart/form-data
        if (files && files.length > 0) {
            const formData = new FormData();

            // Add task data as JSON string
            formData.append('task_data', JSON.stringify(newTask));

            // Append all files
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch(`http://localhost:${TASK_PORT}/api/tasks`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}.\n${errorMessage.error}`);
            }

            return await response.json();
        } else {
            // Send as JSON without files
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
    }
    catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
}