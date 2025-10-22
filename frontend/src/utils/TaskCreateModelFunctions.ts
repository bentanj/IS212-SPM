import dayjs from 'dayjs';
import { User, Task, Comment, FormData, APITaskParams } from '@/types'
import { AlertColor } from '@mui/material';
import DefaultFormData from '@/constants/DefaultFormData';
import updateTask from '@/utils/Tasks/updateTask';
import createTask from '@/utils/Tasks/createTask';
import replicateRecurringTaskData from './recurringTask';

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

    try {
        if (existingTaskDetails) {
            response = await updateTask(TaskData);
            setSnackbarContent('Task updated successfully', 'success');
        } else {
            response = await createTask(TaskData);
            setSnackbarContent('Task created successfully', 'success');
        }

        if (TaskData.status == 'Completed') {
            await taskCompletedTrigger(TaskData, setSnackbarContent);
        }

        setTimeout(() => {
            handleReset();
            onClose();
        }, 1500 + (TaskData.status === "Completed" ? 2000 : 0));

        return response;
    } catch (error) {
        setSnackbarContent(`Failed to create task. Please try again`, 'error');
        console.error('Error submitting form:', error);
    }
};

export const taskCompletedTrigger = async (
    task: APITaskParams,
    setSnackbarContent: (message: string, severity: AlertColor) => void
) => {
    const newTask = replicateRecurringTaskData(task);

    if (!newTask) return null;

    try {
        const response = await createTask(newTask);
        setSnackbarContent('Replicated task created', 'success');
        return response;
    }
    catch (error) {
        setSnackbarContent('Failed to create replicated task. Please try again', 'error');
        console.error('Error creating replicated task:', error);
        return null;
    }
};

// Handle file upload
export const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
) => {
    const file = event.target.files?.[0];
    if (file) {
        setFormData(prev => ({ ...prev, attachedFile: file }));
    }
};

// Handle file removal
export const handleRemoveFile = (
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
) => {
    setFormData(prev => ({ ...prev, attachedFile: null }));
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