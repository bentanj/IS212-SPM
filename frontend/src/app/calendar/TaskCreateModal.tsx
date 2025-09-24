'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert,
  Autocomplete,
  Stack,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { User, Task, Comment, taskMockData, allUsers } from '@/mocks/staff/taskMockData';
import IFormData from "@/types/IFormData";

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  editingTask?: Task | null; // New prop for edit mode
};

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  open,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  editingTask = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = taskMockData;

  // Determine if in edit mode
  const isEditMode = editingTask !== null;

  // Get current user object from allUsers
  const currentUserObj = allUsers.find(user => user.userId === currentUser.userId);

  // Check if current user has edit permissions
  const canEdit = isEditMode ?
    (editingTask!.ownerId === currentUser.userId ||
      editingTask!.assignedUsers.some(user => user.userId === currentUser.userId)) :
    true;

  // Get existing assignees for edit mode (cannot be removed)
  const existingAssignees = isEditMode ? editingTask!.assignedUsers : [];

  // Form state
  const [formData, setFormData] = useState<IFormData>({
    title: '',
    description: '',
    startDate: null,
    completedDate: null,
    dueDate: null,
    priority: '',
    assignedUsers: currentUserObj ? [currentUserObj] : [],
    tags: [],
    status: '',
    comments: '',
    projectName: '',
    attachedFile: null,
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [newComment, setNewComment] = useState('');

  // Initialize form data when editing
  useEffect(() => {
    if (open) {
      if (isEditMode && editingTask) {
        // Pre-populate form with existing task data
        setFormData({
          title: editingTask.title,
          description: editingTask.description,
          startDate: dayjs(editingTask.startDate),
          completedDate: editingTask.completedDate ? dayjs(editingTask.completedDate) : null,
          dueDate: dayjs(editingTask.dueDate),
          priority: editingTask.priority,
          assignedUsers: [...editingTask.assignedUsers],
          tags: [...editingTask.tags],
          status: editingTask.status,
          comments: '',
          projectName: editingTask.projectName,
          attachedFile: null,
        });
      } else {
        // Reset for create mode
        setFormData({
          title: '',
          description: '',
          startDate: null,
          completedDate: null,
          dueDate: null,
          priority: '',
          assignedUsers: currentUserObj ? [currentUserObj] : [],
          tags: [],
          status: '',
          comments: '',
          projectName: '',
          attachedFile: null,
        });
      }
    }
  }, [open, isEditMode, editingTask, currentUserObj]);

  // Helper function to convert null to undefined for DatePicker props
  const convertNullToUndefined = (date: Dayjs | null): Dayjs | undefined => {
    return date === null ? undefined : date;
  };

  // Filter out already assigned users from available options
  const getAvailableUsers = (): User[] => {
    const assignedUserIds = formData.assignedUsers.map(u => u.userId);
    return allUsers.filter(user => !assignedUserIds.includes(user.userId));
  };

  // Check if a user can be removed (only for edit mode)
  const canRemoveUser = (user: User): boolean => {
    if (!isEditMode) return user.userId !== currentUser.userId;
    return !existingAssignees.some(existing => existing.userId === user.userId);
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.startDate && formData.dueDate && formData.startDate.isAfter(formData.dueDate)) {
      newErrors.dueDate = 'Due date must be after start date';
    }

    if (formData.completedDate && formData.startDate && formData.completedDate.isBefore(formData.startDate)) {
      newErrors.completedDate = 'Completed date cannot be before start date';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (formData.assignedUsers.length === 0) {
      newErrors.assignedUsers = 'At least one user must be assigned';
    }

    if (formData.assignedUsers.length > 5) {
      newErrors.assignedUsers = 'Maximum 5 users can be assigned to a task';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!canEdit) {
      setSubmitStatus('error');
      setSubmitMessage('You do not have permission to edit this task');
      return;
    }

    if (!validateForm()) {
      setSubmitStatus('error');
      setSubmitMessage('Please fix the errors above');
      return;
    }

    try {
      if (isEditMode && editingTask) {
        // Update existing task
        const updatedComments = [...editingTask.comments];

        // Add new comment if provided
        if (newComment.trim()) {
          const newCommentObj: Comment = {
            commentId: Math.max(...editingTask.comments.map(c => c.commentId), 0) + 1,
            author: currentUser.name,
            content: newComment.trim(),
            timestamp: dayjs().toISOString(),
          };
          updatedComments.push(newCommentObj);
        }

        const updatedTask: Task = {
          ...editingTask,
          title: formData.title.trim(),
          description: formData.description.trim(),
          startDate: formData.startDate!.format('YYYY-MM-DD'),
          completedDate: formData.completedDate?.format('YYYY-MM-DD') || null,
          dueDate: formData.dueDate!.format('YYYY-MM-DD'),
          priority: formData.priority as 'Low' | 'Medium' | 'High',
          assignedUsers: formData.assignedUsers,
          tags: formData.tags,
          status: formData.status as 'To Do' | 'In Progress' | 'Completed' | 'Blocked',
          comments: updatedComments,
          projectName: formData.projectName.trim(),
          sharedWith: formData.assignedUsers.map(user => user.userId).filter(id => id !== editingTask.ownerId),
        };

        onTaskUpdated?.(updatedTask);
        setSubmitStatus('success');
        setSubmitMessage('Task updated successfully!');
      } else {
        // Create new task
        const newTaskId = Math.max(...taskMockData.tasks.map(t => t.taskId)) + 1;

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
          priority: formData.priority as 'Low' | 'Medium' | 'High',
          assignedUsers: formData.assignedUsers,
          tags: formData.tags,
          status: formData.status as 'To Do' | 'In Progress' | 'Completed' | 'Blocked',
          comments: comments,
          projectName: formData.projectName.trim(),
          ownerId: currentUser.userId,
          sharedWith: formData.assignedUsers.map(user => user.userId).filter(id => id !== currentUser.userId),
        };

        onTaskCreated?.(newTask);
        setSubmitStatus('success');
        setSubmitMessage('Task created successfully!');
      }

      // Reset form and close modal after a short delay
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: null,
      completedDate: null,
      dueDate: null,
      priority: '',
      assignedUsers: currentUserObj ? [currentUserObj] : [],
      tags: [],
      status: '',
      comments: '',
      projectName: '',
      attachedFile: null,
    });
    setErrors({});
    setSubmitStatus('idle');
    setSubmitMessage('');
    setTagInput('');
    setNewComment('');
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, attachedFile: file }));
    }
  };

  // Remove file
  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, attachedFile: null }));
  };

  // Add tag
  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle assigned users change with restrictions
  const handleAssignedUsersChange = (event: React.SyntheticEvent, users: User[]) => {
    // In edit mode, ensure existing assignees cannot be removed
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

    // Limit to 5 users maximum
    if (updatedUsers.length > 5) {
      updatedUsers = updatedUsers.slice(0, 5);
    }

    setFormData(prev => ({ ...prev, assignedUsers: updatedUsers }));
  };

  // Custom render for assigned user tags
  const renderAssignedUserTags = (users: User[], getTagProps: any) => {
    return users.map((user, index) => {
      const isCurrentUser = user.userId === currentUser.userId;
      const isExistingAssignee = isEditMode && existingAssignees.some(existing => existing.userId === user.userId);
      const canDelete = canRemoveUser(user);
      const { key, ...tagPropsWithoutKey } = getTagProps({ index });

      return (
        <Chip
          key={user.userId}
          {...tagPropsWithoutKey}
          icon={!canDelete ? <LockIcon fontSize="small" /> : undefined}
          label={`${user.name}${isCurrentUser ? ' (You)' : ''}${isExistingAssignee ? ' (Existing)' : ''}`}
          size="small"
          color={isCurrentUser ? 'primary' : isExistingAssignee ? 'secondary' : 'default'}
          variant={isCurrentUser || isExistingAssignee ? 'filled' : 'outlined'}
          onDelete={canDelete ? tagPropsWithoutKey.onDelete : undefined}
        />
      );
    });
  };

  // Check if user can add more assignees
  const canAddMoreUsers = formData.assignedUsers.length < 5;
  const availableUsers = getAvailableUsers();

  // Get unique project names from existing tasks
  const existingProjects = Array.from(new Set(taskMockData.tasks.map(t => t.projectName)));

  if (!canEdit && isEditMode) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Access Denied</DialogTitle>
        <DialogContent>
          <Typography>You do not have permission to edit this task.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEditMode ? <EditIcon /> : null}
          {isEditMode ? 'Edit Task' : 'Create New Task'}
          <IconButton
            sx={{ ml: 'auto' }}
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {submitStatus !== 'idle' && (
            <Alert
              severity={submitStatus === 'success' ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {submitMessage}
            </Alert>
          )}

          {/* Title */}
          <TextField
            label="Title"
            required
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            error={!!errors.title}
            helperText={errors.title}
          />

          {/* Description */}
          <TextField
            label="Description"
            required
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* Project Name */}
          <Autocomplete
            freeSolo
            options={existingProjects}
            value={formData.projectName}
            onChange={(event: React.SyntheticEvent, value: string | null) => setFormData(prev => ({ ...prev, projectName: value || '' }))}
            onInputChange={(event: React.SyntheticEvent, value: string) => setFormData(prev => ({ ...prev, projectName: value }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Project Name"
                required
                margin="normal"
                error={!!errors.projectName}
                helperText={errors.projectName}
              />
            )}
          />

          {/* Dates Row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <DatePicker
              label="Start Date"
              value={convertNullToUndefined(formData.startDate)}
              onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true,
                  error: !!errors.startDate,
                  helperText: errors.startDate,
                }
              }}
            />
            <DatePicker
              label="Due Date"
              value={convertNullToUndefined(formData.dueDate)}
              onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
              minDate={convertNullToUndefined(formData.startDate)}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true,
                  error: !!errors.dueDate,
                  helperText: errors.dueDate,
                }
              }}
            />
            <DatePicker
              label="Completed Date"
              value={convertNullToUndefined(formData.completedDate)}
              onChange={(date) => setFormData(prev => ({ ...prev, completedDate: date }))}
              minDate={convertNullToUndefined(formData.startDate)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.completedDate,
                  helperText: errors.completedDate,
                }
              }}
            />
          </Stack>

          {/* Priority and Status Row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth error={!!errors.priority}>
              <InputLabel required>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                label="Priority"
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
              {errors.priority && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                  {errors.priority}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.status}>
              <InputLabel required>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                label="Status"
              >
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
              </Select>
              {errors.status && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                  {errors.status}
                </Typography>
              )}
            </FormControl>
          </Stack>

          {/* Assigned Users */}
          <Autocomplete
            multiple
            options={availableUsers}
            getOptionLabel={(user) => user.name}
            value={formData.assignedUsers}
            onChange={handleAssignedUsersChange}
            noOptionsText={
              !canAddMoreUsers
                ? "Maximum 5 users reached. Remove a user to add more."
                : availableUsers.length === 0
                  ? "No more users available"
                  : "No options"
            }
            renderInput={(params) => (
              <TextField
                required
                {...params}
                label="Assigned Users"
                margin="normal"
                error={!!errors.assignedUsers}
                helperText={
                  errors.assignedUsers ||
                  (isEditMode ? "Note: Existing assignees cannot be removed, but you can add new ones" : "")
                }
              />
            )}
            renderTags={renderAssignedUserTags}
            filterSelectedOptions
            getOptionDisabled={(option) => !canAddMoreUsers}
          />

          {/* Tags */}
          <TextField
            label="Add Tags"
            fullWidth
            margin="normal"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            helperText="Type a tag and press Enter to add it"
          />

          {formData.tags.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}

          {/* Comments */}
          {isEditMode ? (
            <TextField
              label="Add New Comment (Optional)"
              fullWidth
              multiline
              rows={2}
              margin="normal"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              helperText="Add an optional comment about your changes"
            />
          ) : (
            <TextField
              label="Initial Comment (Optional)"
              fullWidth
              multiline
              rows={2}
              margin="normal"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              error={!!errors.comments}
              helperText={errors.comments || "Add an optional initial comment to the task"}
            />
          )}

          {/* File Upload */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              File Attachment (Optional - Maximum 1 file)
            </Typography>

            {!formData.attachedFile ? (
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth={isMobile}
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            ) : (
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {formData.attachedFile.name}
                </Typography>
                <IconButton size="small" onClick={handleRemoveFile}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitStatus === 'success'}
          >
            {submitStatus === 'success' ?
              (isEditMode ? 'Updated!' : 'Created!') :
              (isEditMode ? 'Update Task' : 'Create Task')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TaskCreateModal;
