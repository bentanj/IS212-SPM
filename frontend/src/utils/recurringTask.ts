import { APITaskParams, RecurrenceFrequency, Task } from "@/types";
import dayjs from "dayjs";
import { AlertColor } from "@mui/material";

const RecurrenceFreqOptionsMap: Record<RecurrenceFrequency, dayjs.ManipulateType | null> = {
    "One-Off": null,
    "Daily": "day",
    "Weekly": "week",
    "Monthly": "month",
    "Yearly": "year",
}

export default function replicateRecurringTaskData(task: APITaskParams) {
    if (task.recurrenceFrequency == "One-Off") return null;

    const newStartDate = recurringTaskDate(task);
    if (newStartDate == null) return null;

    const newTask = {
        ...task,
        taskId: 0,  // Passing value of 0 to database will auto-generate a new ID
        startDate: newStartDate.toISOString(),
        completedDate: null,
        status: "To Do",
        comments: [],
    };
    return newTask;
}

export function recurringTaskDate(task: Omit<APITaskParams, "taskId">): dayjs.Dayjs | null {
    const existingStartDate = dayjs(task.startDate.replace(" ", "T"));
    const dueDate = dayjs(task.dueDate.replace(" ", "T"));
    const freq = RecurrenceFreqOptionsMap[task.recurrenceFrequency];
    const interval = task.recurrenceInterval;

    // If there is no recurrence interval or no unit (One-Off), we can't compute a recurring date
    if (interval == null || freq == null) return null;

    const newStartDate = existingStartDate.add(interval, freq);

    // If the new start date is after the original due date, return null
    if (newStartDate.isAfter(dueDate)) return null;

    // Otherwise, return the original due date
    return newStartDate;
}

import { getSubtasks } from "@/utils/Tasks/getTask";
import createTask from "./Tasks/createTask";
export async function autoReplicateAllSubtasks(
    parentTask: APITaskParams,
    setSnackBarContent: (message: string, severity: AlertColor) => void
) {
    const subtasks = await getSubtasks(String(parentTask.taskId));
    let newSubtasksCreated = 0;
    let errorMessages = [];
    for (const subtask of subtasks) {
        const newSubtaskData = replicateRecurringSubtaskData(parentTask, subtask);
        if (typeof newSubtaskData !== "string") {
            try {
                const newSubtask = {
                    ...newSubtaskData,
                    assigned_users: newSubtaskData.assignedUsers.map(user => user.userId),
                }
                await createTask(newSubtask);
                newSubtasksCreated++;
            } catch (error) {
                const errorMessage = `Error creating recurring subtask ${newSubtaskData.title}: ${error instanceof Error ? error.message : String(error)}`;
                console.error(errorMessage);
                errorMessages.push(errorMessage);
            }
        }
        else {
            errorMessages.push(newSubtaskData);
        }
    }

    if (errorMessages.length === 0) {
        setSnackBarContent(`${newSubtasksCreated} recurring subtasks have been created.`, "success");
    }
    else {
        const combinedErrors = errorMessages.join(" | ");
        setSnackBarContent(
            `Only ${newSubtasksCreated} out of ${subtasks.length} recurring subtasks have been created. Errors: ${combinedErrors}`,
            "warning");
    }
}

export function replicateRecurringSubtaskData(
    parentTask: APITaskParams,
    subtask: Task,
) {
    const parentFreq = RecurrenceFreqOptionsMap[parentTask.recurrenceFrequency];
    const parentInterval = parentTask.recurrenceInterval;

    // If there is no recurrence interval or no unit (One-Off), we can't compute a recurring date
    const newSubtaskStartDate = dayjs(subtask.startDate.replace(" ", "T")).add(parentInterval!, parentFreq!);
    const newSubtaskDueDate = dayjs(subtask.dueDate.replace(" ", "T")).add(parentInterval!, parentFreq!);

    // If the new start date is after the original due date, return null
    if (newSubtaskStartDate.isAfter(dayjs(parentTask.dueDate.replace(" ", "T")))) {
        return `Subtask ${subtask.title} start date exceeds parent task due date`;
    }

    // If the new due date is after the original due date, return null
    if (newSubtaskDueDate.isAfter(dayjs(parentTask.dueDate.replace(" ", "T")))) {
        return `Subtask ${subtask.title} due date exceeds parent task due date`;
    }

    const newSubtask = {
        ...subtask,
        taskId: 0,  // Passing value of 0 to database will auto-generate a new ID
        startDate: newSubtaskStartDate.toISOString(),
        dueDate: newSubtaskDueDate.toISOString(),
        completedDate: null,
        status: "To Do",
        comments: [],
    };

    return newSubtask;
}