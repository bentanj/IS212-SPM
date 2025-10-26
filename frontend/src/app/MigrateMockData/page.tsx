"use client"

import { Button } from "@mui/material"
import { taskMockData } from "@/mocks/staff/taskMockData"
import createTask from "@/utils/Tasks/createTask"

const page = () => {

    const TaskArray = taskMockData.tasks

    const handleMigrate = async () => {
        for (let i = 0; i < TaskArray.length; i++) {
            const task = TaskArray[i];
            try {
                const response = await createTask(task);
                console.log(`Task ${i + 1} created successfully:`, response);
            } catch (error) {
                console.error(`Error creating task ${i + 1}:`, error);
            }
        }
    }

    return (
        <Button variant="contained" color="primary" onClick={handleMigrate}>Click to Migrate Mock Data</Button>
    )
}

export default page