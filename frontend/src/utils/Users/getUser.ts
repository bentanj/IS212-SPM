import { User } from "@/types";

const TASK_PORT = process.env.TASK_SERVICE_PORT || 8000;

export async function getUserById(userId: string): Promise<User> {

    let targetURL = `http://localhost:${TASK_PORT}/api/users/${userId}`;

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