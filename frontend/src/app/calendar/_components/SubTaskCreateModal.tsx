'use client';

import { useState, useEffect } from 'react';
import {
  Alert, AlertColor, Autocomplete, Button,
  Dialog, DialogContent, DialogActions,
  Stack, TextField,
  useTheme, useMediaQuery
} from '@mui/material';
import dayjs from 'dayjs';

// Functions
import { getAvailableUsers, handleAddTag, handleRemoveTag, resetForm, handleSubmit } from '../_functions/TaskCreateModelFunctions';

// Types and Constants
import { Task, taskMockData, allUsers } from '@/mocks/staff/taskMockData';
import IFormData from "@/types/IFormData";
import DefaultFormData, { PriorityOptions, StatusOptions } from '@/constants/DefaultFormData';

// Components
import NoPermission from './_TaskCreateModal/NoPermission';
import ModalTitle from './_TaskCreateModal/ModalTitle';
import DateRow from './_TaskCreateModal/DateRow';
import DropDownMenu from './_TaskCreateModal/DropDownMenu';
import Tags from './_TaskCreateModal/Tags';
import AssignedUsersAutocomplete from './_TaskCreateModal/AssignedUsers';
import Comments from './_TaskCreateModal/Comments';
import FileUpload from './_TaskCreateModal/FileUpload';
import ParentTaskField from './_TaskCreateModal/ParentTaskField';

interface SubtaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  setSnackbarContent: (message: string, severity: AlertColor) => void;
  editingTask?: Task | null;
  preselectedParentTask?: Task | null; // New prop for pre-selecting parent
  allTasks: Task[]; // All tasks for parent selection
}

const SubtaskCreateModal: React.FC<SubtaskCreateModalProps> = ({
  open,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  setSnackbarContent,
  editingTask = null,
  preselectedParentTask = null,
  allTasks,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock current user details
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
  const [formData, setFormData] = useState<IFormData>(DefaultFormData);
  const [parentTask, setParentTask] = useState<Task | null>(preselectedParentTask);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [newComment, setNewComment] = useState('');

  // Get available parent tasks (exclude subtasks and the task being edited)
  const availableParentTasks = allTasks.filter(task => 
    !task.parentTaskId && // Only allow main tasks as parents
    (!isEditMode || task.taskId !== editingTask!.taskId) // Exclude current task in edit mode
  );

  // Initialize form data when editing or opening
  useEffect(() => {
    setErrors({});
    setSubmitMessage('');
    setSubmitStatus('idle');
    
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

        // Set parent task if editing a subtask
        if (editingTask.parentTaskId) {
          const parentTaskObj = allTasks.find(t => t.taskId === editingTask.parentTaskId);
          setParentTask(parentTaskObj || null);
        } else {
          setParentTask(null);
        }
      } else {
        // Reset form for new subtask creation
        setFormData(DefaultFormData);
        setParentTask(preselectedParentTask);
      }
    }
  }, [open, isEditMode, editingTask, preselectedParentTask, allTasks]);

  const handleReset = () => {
    resetForm(setFormData, setErrors, setSubmitStatus, setSubmitMessage, setTagInput, setNewComment);
    setParentTask(preselectedParentTask);
  };

  // Modified submit function to handle parent task
  const onSubmit = () => {
    // Create a modified task object with parentTaskId
    const taskWithParent = {
      ...formData,
      parentTaskId: parentTask?.taskId,
    };

    // Use existing submit logic but with modified data
    handleSubmit({
      canEdit, 
      isEditMode, 
      editingTask, 
      formData: taskWithParent, 
      newComment, 
      currentUser,
      onTaskCreated, 
      onTaskUpdated, 
      setSubmitStatus, 
      setSubmitMessage, 
      setErrors, 
      handleReset, 
      onClose
    });

    // Success messages
    if (editingTask) {
      setSnackbarContent('Subtask updated successfully', 'success');
    } else {
      setSnackbarContent(parentTask ? 'Subtask created successfully' : 'Task created successfully', 'success');
    }
  };

  // Check if user can add more assignees
  const canAddMoreUsers = formData.assignedUsers.length < 5;

  // Get available users for assignment (excluding already assigned)
  const availableUsers = getAvailableUsers(allUsers, formData.assignedUsers);

  // Get unique project names from existing tasks
  const existingProjects = Array.from(new Set(taskMockData.tasks.map(t => t.projectName)));

  if (!canEdit && isEditMode) {
    return (
      <NoPermission open={open} onClose={onClose} />
    );
  }

  return (
    <Dialog open={open} onClose={onClose}
      maxWidth="md" fullWidth fullScreen={isMobile}
    >
      <ModalTitle 
        isEditMode={isEditMode} 
        onClose={onClose}
        />

      <DialogContent dividers>
        {submitStatus !== 'idle' && (
          <Alert sx={{ mb: 2 }} severity={submitStatus === 'success' ? 'success' : 'error'}>
            {submitMessage}
          </Alert>
        )}

        {/* Parent Task Selection */}
        <ParentTaskField
          parentTask={parentTask}
          availableParentTasks={availableParentTasks}
          onChange={setParentTask}
          error={!!errors.parentTaskId}
          helperText={errors.parentTaskId}
          disabled={isEditMode} // Disable editing parent in edit mode
        />

        {/* Title */}
        <TextField label="Title"
          required fullWidth margin="normal"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          error={!!errors.title}
          helperText={errors.title} />

        {/* Description */}
        <TextField label="Description"
          required fullWidth margin="normal"
          multiline rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          error={!!errors.description}
          helperText={errors.description} />

        {/* Project Name */}
        <Autocomplete
          freeSolo
          options={existingProjects}
          value={formData.projectName}
          onChange={(event: React.SyntheticEvent, value: string | null) => setFormData(prev => ({ ...prev, projectName: value || '' }))}
          onInputChange={(event: React.SyntheticEvent, value: string) => setFormData(prev => ({ ...prev, projectName: value }))}
          renderInput={(params) => (
            <TextField label="Project Name"
              {...params} required margin="normal"
              error={!!errors.projectName}
              helperText={errors.projectName} />
          )} />

        {/* Dates Row */}
        <DateRow formData={formData} setFormData={setFormData} errors={errors} />

        {/* Priority and Status Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <DropDownMenu
            label="Priority"
            value={formData.priority}
            onChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
            options={PriorityOptions}
            error={!!errors.priority}
            helperText={errors.priority}
            required />

          <DropDownMenu
            label="Status"
            value={formData.status}
            onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
            options={StatusOptions}
            error={!!errors.status}
            helperText={errors.status}
            required />
        </Stack>

        {/* Assigned Users */}
        <AssignedUsersAutocomplete
          availableUsers={availableUsers}
          assignedUsers={formData.assignedUsers}
          setFormData={setFormData}
          isEditMode={isEditMode}
          existingAssignees={existingAssignees}
          currentUser={currentUser}
          currentUserObj={currentUserObj}
          error={!!errors.assignedUsers}
          helperText={errors.assignedUsers}
          canAddMoreUsers={canAddMoreUsers} />

        {/* Tags */}
        <Tags
          tagInput={tagInput}
          setTagInput={setTagInput}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          formData={formData}
          setFormData={setFormData} />

        {/* Comments */}
        <Comments
          isEditMode={isEditMode}
          formData={formData}
          setFormData={setFormData}
          errors={errors} 
          newComment={newComment} 
          setNewComment={setNewComment} />

        {/* File Upload */}
        <FileUpload
          isMobile={isMobile}
          formData={formData}
          setFormData={setFormData} />

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitStatus === 'success'}
        >
          {submitStatus === 'success' ?
            (isEditMode ? 'Updated!' : 'Created!') :
            (isEditMode ? 
              (editingTask?.parentTaskId ? 'Update Subtask' : 'Update Task') : 
              (parentTask ? 'Create Subtask' : 'Create Task')
            )
          }
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default SubtaskCreateModal;