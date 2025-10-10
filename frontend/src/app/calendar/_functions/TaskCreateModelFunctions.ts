import dayjs from 'dayjs';
import { User, Task, Comment, taskMockData } from '@/mocks/staff/taskMockData';
import IFormData from "@/types/IFormData";
import DefaultFormData from '@/constants/DefaultFormData';
import Priority from '@/types/TPriority';
import Status from '@/types/TStatus';
import updateTask from '@/utils/Tasks/updateTask';
import createTask from '@/utils/Tasks/createTask';

// Filter out already assigned users from available options
export const getAvailableUsers = (allUsers: User[], assignedUsers: User[]): User[] => {
    const assignedUserIds = assignedUsers.map(u => u.userId);
    return allUsers.filter(user => !assignedUserIds.includes(user.userId));
};

// Check if a user can be removed (only for edit mode)
export const canRemoveUser = (
    user: User,
    isEditMode: boolean,
    currentUser: CurrentUser,
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
    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!formData.department) newErrors.department = 'Department is required';

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
    setFormData(DefaultFormData);
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
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setSubmitStatus: React.Dispatch<React.SetStateAction<'idle' | 'success' | 'error'>>;
    setSubmitMessage: React.Dispatch<React.SetStateAction<string>>;
    handleReset: () => void;
    onClose: () => void;
    allTasks: Task[]; // New
}) => {
    const { isEditMode, existingTaskDetails, formData, newComment, currentUser,
        setErrors, setSubmitStatus, setSubmitMessage, handleReset, onClose, allTasks } = params;

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
                projectName: formData.projectName.trim(),
            };

            updateTask(updatedTask);
            setSubmitStatus('success');
            setSubmitMessage('Task updated successfully!');
        } else {
            // Create new task with proper ID generation from live state (Updated)
            const newTaskId = allTasks.length > 0
                ? Math.max(...allTasks.map(t => t.taskId), 0) + 1
                : 1;
            const comments = formData.comments.trim()
                ? [{
                    commentId: 1,
                    author: currentUser.name,
                    content: formData.comments.trim(),
                    timestamp: dayjs().toISOString(),
                }]
                : [];

            const newTask: Task = {
                taskId: newTaskId,
                title: formData.title.trim(),
                description: formData.description.trim(),
                startDate: formData.startDate!.format('YYYY-MM-DD'),
                completedDate: formData.completedDate?.format('YYYY-MM-DD') || null,
                dueDate: formData.dueDate!.format('YYYY-MM-DD'),
                department: formData.department,
                priority: formData.priority as Priority,
                assignedUsers: formData.assignedUsers,
                tags: formData.tags,
                status: formData.status as Status,
                comments: comments,
                projectName: formData.projectName.trim(),
                parentTaskId: (formData as any).parentTaskId || null, // New 
            };

            createTask(newTask);
            setSubmitStatus('success');
            setSubmitMessage('Task created successfully!');
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

// Handle file upload
export const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
) => {
    const file = event.target.files?.[0];
    if (file) {
        setFormData(prev => ({ ...prev, attachedFile: file }));
    }
};

// Handle file removal
export const handleRemoveFile = (
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
) => {
    setFormData(prev => ({ ...prev, attachedFile: null }));
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
