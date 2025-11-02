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

export function replicateRecurringTaskData(task: APITaskParams, currentUserId: number) {
    if (task.recurrenceFrequency == "One-Off") return null;

    const newStartDate = recurringTaskDate(task);
    if (newStartDate == null) return null;

    let IsReplicateFromCompletedSubtask = {}
    if (task.parentTaskId) IsReplicateFromCompletedSubtask = { IsReplicateFromCompletedSubtask: true }

    const newTask = {
        ...task,
        taskId: 0,  // Passing value of 0 to database will auto-generate a new ID
        startDate: newStartDate.toISOString(),
        completedDate: null,
        status: "To Do",
        comments: [],
        uploaded_by: currentUserId,
        ...IsReplicateFromCompletedSubtask,
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
import { copyTaskAttachments } from "./taskAttachments";

export async function autoReplicateAllSubtasks(
    parentTask: APITaskParams,
    newParentTaskId: number,
    setSnackBarContent: (message: string, severity: AlertColor) => void,
    currentUserId: number
) {
    const subtasks = await getSubtasks(String(parentTask.taskId));
    // If no subtasks, return
    if (subtasks.length === 0) return;

    // Only consider original subtasks, not those replicated because the subtask has its own recurrence
    const originalSubtasks = subtasks.filter(subtask => !subtask.IsReplicateFromCompletedSubtask);

    let newSubtasksCreated = 0;
    let errorMessages = [];
    for (const subtask of originalSubtasks) {
        const newSubtaskData = replicateRecurringSubtaskData(parentTask, newParentTaskId, subtask);
        if (typeof newSubtaskData !== "string") {
            try {
                const newSubtask = {
                    ...newSubtaskData,
                    assigned_users: newSubtaskData.assignedUsers.map(user => user.userId),
                    uploaded_by: currentUserId,
                }
                const response = await createTask(newSubtask);

                // Copy attachments from original subtask to new subtask
                try {
                    const copyResult = await copyTaskAttachments(subtask.taskId, response.taskId);
                    if (copyResult.count > 0) {
                        console.log(`Copied ${copyResult.count} attachment(s) to recurring subtask ${response.taskId}`);
                    }
                } catch (error) {
                    console.error(`Error copying attachments for subtask ${subtask.title}:`, error);
                    // Don't fail the whole operation if attachment copy fails
                }

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
            `Only ${newSubtasksCreated} out of ${originalSubtasks.length} recurring subtasks have been created. Errors: ${combinedErrors}`,
            "warning");
    }
}

export function replicateRecurringSubtaskData(
    parentTask: APITaskParams,
    newParentTaskId: number,
    subtask: Task,
) {
    const parentFreq = RecurrenceFreqOptionsMap[parentTask.recurrenceFrequency];
    const parentInterval = parentTask.recurrenceInterval;

    // If there is no recurrence interval or no unit (One-Off), we can't compute a recurring date
    const newSubtaskStartDate = dayjs(subtask.startDate.replace(" ", "T")).add(parentInterval!, parentFreq!);
    const newSubtaskDueDate = dayjs(subtask.dueDate.replace(" ", "T")).add(parentInterval!, parentFreq!);

    // If the new start date is after the original parent due date, return error
    if (newSubtaskStartDate.isAfter(dayjs(parentTask.dueDate.replace(" ", "T")))) {
        return `Subtask ${subtask.title} start date exceeds parent task due date`;
    }

    // If the new due date is after the original parent due date, return error
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
        parentTaskId: newParentTaskId,
    };

    return newSubtask;
}