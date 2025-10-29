import dayjs from 'dayjs';
import { User, Task, Comment, Priority, Status } from '@/types';
import { taskMockData } from '@/mocks/staff/taskMockData';
import { FormData as IFormData } from "@/types/IFormData";
import DefaultFormData from '@/constants/DefaultFormData';

// Filter out already assigned users from available options
export const getAvailableUsers = (allUsers: User[], assignedUsers: User[]): User[] => {
    const assignedUserIds = assignedUsers.map(u => u.userId);
    return allUsers.filter(user => !assignedUserIds.includes(user.userId));
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

//  Check if form entries are valid
const validateForm = (formData: IFormData, setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.startDate && formData.dueDate && formData.startDate.isAfter(formData.dueDate))
        newErrors.dueDate = 'Due date must be after start date';
    if (formData.completedDate && formData.startDate && formData.completedDate.isBefore(formData.startDate))
        newErrors.completedDate = 'Completed date cannot be before start date';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (formData.assignedUsers.length === 0) newErrors.assignedUsers = 'At least one user must be assigned';
    if (formData.assignedUsers.length > 5) newErrors.assignedUsers = 'Maximum 5 users can be assigned to a task';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.project_name.trim()) newErrors.project_name = 'Project name is required';
    if (formData.departments.length === 0) newErrors.departments = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

// Reset form
export const resetForm = (
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setSubmitStatus: React.Dispatch<React.SetStateAction<'idle' | 'success' | 'error'>>,
    setSubmitMessage: React.Dispatch<React.SetStateAction<string>>,
    setTagInput: React.Dispatch<React.SetStateAction<string>>,
    setNewComment: React.Dispatch<React.SetStateAction<string>>
) => {
    setFormData({ ...DefaultFormData, taskId: 0 });
    setErrors({});
    setSubmitStatus('idle');
    setSubmitMessage('');
    setTagInput('');
    setNewComment('');
};

export const handleSubmit = async (params: {
    isEditMode: boolean;
    existingTaskDetails: Task | null;
    formData: IFormData;
    newComment: string;
    currentUser: User;
    onTaskCreated?: (task: Task) => void;
    onTaskUpdated?: (task: Task) => void;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setSubmitStatus: React.Dispatch<React.SetStateAction<'idle' | 'success' | 'error'>>;
    setSubmitMessage: React.Dispatch<React.SetStateAction<string>>;
    handleReset: () => void;
    onClose: () => void;
    allTasks: Task[]; // New
}) => {
    const { isEditMode, existingTaskDetails, formData, newComment, currentUser,
        onTaskCreated, onTaskUpdated, setErrors, setSubmitStatus, setSubmitMessage, handleReset, onClose, allTasks } = params;

    // Validate form
    if (!validateForm(formData, setErrors)) {
        setSubmitStatus('error');
        setSubmitMessage('Please fix the errors');
        return;
    }

    try {
        if (existingTaskDetails) {
            // Update existing task with comments
            const updatedComments = [...existingTaskDetails.comments];

            if (newComment.trim()) {
                const newCommentObj: Comment = {
                    commentId: Math.max(...existingTaskDetails.comments.map(c => c.commentId), 0) + 1,
                    author: currentUser.name,
                    content: newComment.trim(),
                    timestamp: dayjs().toISOString(),
                };
                updatedComments.push(newCommentObj);
            }

            const updatedTask: Task = {
                ...existingTaskDetails,
                title: formData.title.trim(),
                description: formData.description.trim(),
                startDate: formData.startDate!.format('YYYY-MM-DD'),
                completedDate: formData.completedDate?.format('YYYY-MM-DD') || null,
                dueDate: formData.dueDate!.format('YYYY-MM-DD'),
                priority: formData.priority as Priority,
                assignedUsers: formData.assignedUsers,
                tags: formData.tags,
                status: formData.status as Status,
                comments: updatedComments,
                project_name: formData.project_name.trim(),
            };

            onTaskUpdated?.(updatedTask);
            setSubmitStatus('success');
            setSubmitMessage('Task updated successfully!');
        } else {
            // Create new task via backend API
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            if (formData.attachedFiles && formData.attachedFiles.length > 0) {
                // Send as multipart/form-data with files
                const formDataToSend = new FormData();

                // Add task data as JSON string
                const taskData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    start_date: formData.startDate!.toISOString(),
                    due_date: formData.dueDate!.toISOString(),
                    priority: formData.priority,
                    status: formData.status,
                    project_name: formData.project_name.trim(),
                    assigned_users: formData.assignedUsers.map(u => u.userId),
                    tags: JSON.stringify(formData.tags),
                    departments: formData.departments,
                    uploaded_by: currentUser.userId,
                };

                formDataToSend.append('task_data', JSON.stringify(taskData));

                // Append all files
                formData.attachedFiles.forEach((file: File) => {
                    formDataToSend.append('files', file);
                });

                const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                    method: 'POST',
                    body: formDataToSend,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create task');
                }

                const createdTask = await response.json();
                onTaskCreated?.(createdTask);
                setSubmitStatus('success');
                setSubmitMessage(`Task created successfully with ${formData.attachedFiles.length} file(s)!`);
            } else {
                // Send as JSON without files
                const taskData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    start_date: formData.startDate!.toISOString(),
                    due_date: formData.dueDate!.toISOString(),
                    priority: formData.priority,
                    status: formData.status,
                    project_name: formData.project_name.trim(),
                    assigned_users: formData.assignedUsers.map(u => u.userId),
                    tags: JSON.stringify(formData.tags),
                    departments: formData.departments,
                    uploaded_by: currentUser.userId,
                };

                const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(taskData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create task');
                }

                const createdTask = await response.json();
                onTaskCreated?.(createdTask);
                setSubmitStatus('success');
                setSubmitMessage('Task created successfully!');
            }
        }

        setTimeout(() => {
            handleReset()
            onClose();
        }, 1500);
    } catch (error) {
        setSubmitStatus('error');
        setSubmitMessage(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
    }
};

// Handle file upload - accepts array of files
export const handleFileUpload = (
    files: File[],
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
) => {
    setFormData(prev => ({
        ...prev,
        attachedFiles: [...(prev.attachedFiles || []), ...files]
    }));
};

// Handle file removal - accepts index of file to remove
export const handleRemoveFile = (
    index: number,
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
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
    formData: IFormData,
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
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
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
) => {
    setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
};

// Handle assigned users change with restrictions
export const handleAssignedUsersChange = (
    event: React.SyntheticEvent,
    users: User[],
    isEditMode: boolean,
    existingAssignees: User[],
    currentUser: User,
    currentUserObj: User | undefined,
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
) => {
    let updatedUsers = users;

    if (isEditMode) {
        // Add back any existing assignees that might have been removed
        const missingExistingUsers = existingAssignees.filter(
            existing => !updatedUsers.some(user => user.userId === existing.userId)
        );
        updatedUsers = [...updatedUsers, ...missingExistingUsers];
    } else {
        // In create mode, ensure current user is always included
        const currentUserIncluded = users.find(u => u.userId === currentUser.userId);
        if (!currentUserIncluded && currentUserObj) {
            updatedUsers = [currentUserObj, ...users];
        }
    }

    if (updatedUsers.length > 5) {
        updatedUsers = updatedUsers.slice(0, 5);
    }

    setFormData(prev => ({ ...prev, assignedUsers: updatedUsers }));
};

export const canAddMoreUsers = (assignedUsers: User[]) => {
    return assignedUsers.length < 5;
};
