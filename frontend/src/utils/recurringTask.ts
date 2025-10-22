import { APITaskParams, RecurrenceFrequency } from "@/types";
import dayjs from "dayjs";

const RecurrenceFreqOptionsMap: Record<RecurrenceFrequency, dayjs.ManipulateType | null> = {
    "One-Off": null,
    "Daily": "day",
    "Weekly": "week",
    "Monthly": "month",
    "Yearly": "year",
}

export default function ReplicateRecurringTaskData(task: APITaskParams) {
    if (task.recurrenceFrequency === "One-Off") return null;

    const newStartDate = recurringTaskDate(task);
    if (newStartDate === null) return null;

    const newTask = {
        ...task,
        taskId: 0,  // Passing value of 0 to database will auto-generate a new ID
        startDate: newStartDate.toISOString(),
        completedDate: null,
    };
    return newTask;
}

function recurringTaskDate(task: Omit<APITaskParams, "taskId">): dayjs.Dayjs | null {
    const existingStartDate = dayjs(task.startDate);
    const dueDate = dayjs(task.dueDate);
    const freq = RecurrenceFreqOptionsMap[task.recurrenceFrequency];
    const interval = task.recurrenceInterval;

    // If there is no recurrence interval or no unit (One-Off), we can't compute a recurring date
    if (interval == null || freq == null) return null;

    const newStartDate = existingStartDate.add(interval, freq);

    // If the new start date is after the original due date, return null
    if (newStartDate.isAfter(dueDate)) return null;

    // Otherwise, return the original due date
    return dueDate;
}