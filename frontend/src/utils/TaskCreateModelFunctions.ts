import dayjs from 'dayjs';
import { User, Task, Comment, FormData, APITaskParams } from '@/types'
import { AlertColor } from '@mui/material';
import DefaultFormData from '@/constants/DefaultFormData';
import { getSubtasks } from './Tasks/getTask';
import updateTask from '@/utils/Tasks/updateTask';
import createTask from '@/utils/Tasks/createTask';


// Filter out already assigned users from available options
export const getAvailableUsers = (allUsers: User[], assignedUsers: User[]): User[] => {
    const assignedUserIds = assignedUsers.map(u => u.userId);
    return allUsers.filter(user => !assignedUserIds.includes(user.userId));
};

//  Check if form entries are valid
const validateForm = (formData: FormData | Omit<FormData, 'taskId'>, setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.startDate && formData.dueDate && formData.startDate.isAfter(formData.dueDate))
        newErrors.dueDate = 'Due date must be after start date';
    // if (formData.completedDate && formData.startDate && formData.completedDate.isBefore(formData.startDate))
    //     newErrors.completedDate = 'Completed date cannot be before start date';
    if (formData.recurrenceFrequency != "One-Off" && !formData.recurrenceInterval) newErrors.recurrenceInterval = 'Recurrence interval is required when frequency is set';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (formData.assignedUsers.length === 0) newErrors.assignedUsers = 'At least one user must be assigned';
    if (formData.assignedUsers.length > 5) newErrors.assignedUsers = 'Maximum 5 users can be assigned to a task';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.project_name.trim()) newErrors.project_name = 'Project name is required';
    if (formData.departments.length < 1) newErrors.departments = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

// Reset form
export const resetForm = (
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setTagInput: React.Dispatch<React.SetStateAction<string>>,
    setNewComment: React.Dispatch<React.SetStateAction<string>>
) => {
    setFormData(DefaultFormData);
    setErrors({});
    setTagInput('');
    setNewComment('');
};

const transformFormDataToAPITaskParams = (
    currentUser: User,
    existingTaskDetails: Task | null,
    formData: FormData | Omit<FormData, 'taskId'>,
    newComment: string | null
): APITaskParams => {

    let Comments: Comment[] = [];

    if (existingTaskDetails) {
        Comments = [...existingTaskDetails.comments];

        if (newComment?.trim()) {
            const newCommentObj: Comment = {
                commentId: Math.max(...existingTaskDetails.comments.map(c => c.commentId), 0) + 1,
                author: currentUser.name,
                content: newComment.trim(),
                timestamp: dayjs().toISOString(),
            };
            Comments.push(newCommentObj);
        }
    }
    else {
        Comments = formData.comments?.trim()
            ? [{
                commentId: 1,
                author: currentUser.name,
                content: formData.comments?.trim(),
                timestamp: dayjs().toISOString(),
            }]
            : [];
    }

    return {
        ...formData,
        taskId: existingTaskDetails ? existingTaskDetails.taskId : 0,
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate!.toISOString(),
        completedDate: formData.completedDate?.toISOString() || null,
        dueDate: formData.dueDate!.toISOString(),
        departments: formData.departments,
        assigned_users: formData.assignedUsers.map(user => user.userId),
        comments: Comments,
        project_name: formData.project_name.trim(),
    };
};

export const handleSubmit = async (params: {
    existingTaskDetails: Task | null;
    formData: FormData | Omit<FormData, 'taskId'>;
    newComment: string;
    currentUser: User;
    setSnackbarContent: (message: string, severity: AlertColor) => void;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    handleReset: () => void;
    onClose: () => void;
}) => {
    const { existingTaskDetails, formData, newComment, currentUser,
        setSnackbarContent, setErrors, handleReset, onClose } = params;

    // Validate form
    if (!validateForm(formData, setErrors)) {
        return;
    }

    const TaskData = transformFormDataToAPITaskParams(currentUser, existingTaskDetails, formData, newComment);
    let response: any;

    if (TaskData.status === 'Completed') {
        if (existingTaskDetails?.status == "To Do") {
            setSnackbarContent('Task can only be "Completed" from "In Progress" status.', 'error');
            return;
        }
        const canComplete = await validateCanCompleteTask(TaskData, setSnackbarContent);
        if (!canComplete) return;
    }

    try {
        if (existingTaskDetails) {
            response = await updateTask(TaskData);
            setSnackbarContent('Task updated successfully', 'success');
        } else {
            // Pass files to createTask if they exist
            const files = formData.attachedFiles && formData.attachedFiles.length > 0 ? formData.attachedFiles : undefined;
            response = await createTask(TaskData, files);

            if (files && files.length > 0) {
                setSnackbarContent(`Task created successfully with ${files.length} file(s)`, 'success');
            } else {
                setSnackbarContent('Task created successfully', 'success');
            }
        }

        if (TaskData.status === 'Completed') {
            await taskCompletedTrigger(TaskData, setSnackbarContent);
        }

        // Return response immediately so refetchTasks() is called
        // The modal close is handled separately with setTimeout
        setTimeout(() => {
            handleReset();
            onClose();
        }, 1500 + (TaskData.status === "Completed" ? 2000 : 0));

        return response;
    } catch (error) {
        setSnackbarContent(`Failed to create task. Please try again`, 'error');
        console.error('Error submitting form:', error);
        return null; // Return null on error so refetchTasks is not called
    }
};

export const validateCanCompleteTask = async (
    task: APITaskParams,
    setSnackbarContent: (message: string, severity: AlertColor) => void
) => {
    // If subtask, no dependencies. Allow completion
    if (task.parentTaskId) return true;

    // If main task, check for incomplete subtasks
    const subtasks = await getSubtasks(String(task.taskId));
    const incompleteSubtasks = subtasks.filter(subtask => subtask.status !== 'Completed');

    if (incompleteSubtasks.length > 0) {
        setSnackbarContent('Complete all subtasks before completing the main task.', 'error');
        return false;
    }

    return true;
};

import { replicateRecurringTaskData, autoReplicateAllSubtasks } from './recurringTask';
export const taskCompletedTrigger = async (
    task: APITaskParams,
    setSnackbarContent: (message: string, severity: AlertColor) => void
) => {
    const newTask = replicateRecurringTaskData(task);

    if (!newTask) return null;

    try {
        const response = await createTask(newTask);
        setSnackbarContent('Replicated task created', 'success');

        await autoReplicateAllSubtasks(task, response.taskId, setSnackbarContent);
    }
    catch (error) {
        setSnackbarContent('Failed to create replicated task. Please try again', 'error');
        console.error('Error creating replicated task:', error);
        return null;
    }
};

// Handle file upload - accepts array of files
export const handleFileUpload = (
    files: File[],
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
) => {
    setFormData(prev => ({
        ...prev,
        attachedFiles: [...(prev.attachedFiles || []), ...files]
    }));
};

// Handle file removal - accepts index of file to remove
export const handleRemoveFile = (
    index: number,
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
) => {
    setFormData(prev => ({
        ...prev,
        attachedFiles: prev.attachedFiles?.filter((_, i) => i !== index) || []
    }));
};

// Add tag
export const handleAddTag = (
    event: React.KeyboardEvent<HTMLElement>,
    tagInput: string,
    setTagInput: React.Dispatch<React.SetStateAction<string>>,
    formData: FormData | Omit<FormData, 'taskId'>,
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
) => {
    if (event.key === 'Enter' && tagInput.trim()) {
        event.preventDefault();
        const newTag = tagInput.trim().toLowerCase();
        if (!formData.tags.includes(newTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }));
        }
        setTagInput('');
    }
};

// Remove tag
export const handleRemoveTag = (
    tagToRemove: string,
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
) => {
    setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
};

// Handle assigned users change with restrictions
export const handleAssignedUsersChange = (
    users: User[],
    isEditMode: boolean,
    canDelete: boolean,
    existingAssignees: User[],
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
) => {
    let updatedUsers = users;

    if (isEditMode && !canDelete) {
        // Add back any existing assignees that might have been removed
        const missingExistingUsers = existingAssignees.filter(
            existing => !updatedUsers.some(user => user.userId === existing.userId)
        );
        updatedUsers = [...updatedUsers, ...missingExistingUsers];
    }

    if (updatedUsers.length > 5) {
        updatedUsers = updatedUsers.slice(0, 5);
    }

    setFormData(prev => ({ ...prev, assignedUsers: updatedUsers }));
};

export const canAddMoreUsers = (assignedUsers: User[]) => {
    return assignedUsers.length < 5;
};

// Check if a user can be removed (only for edit mode)
export const canRemoveUser = (
    user: User,
    isEditMode: boolean,
    currentUser: User,
    existingAssignees: User[]
): boolean => {
    if (!isEditMode) return user.userId !== currentUser.userId;
    return !existingAssignees.some(existing => existing.userId === user.userId);
};