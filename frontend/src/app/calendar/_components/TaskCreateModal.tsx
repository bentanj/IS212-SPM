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
import { getAvailableUsers, handleAddTag, handleRemoveTag, resetForm, handleSubmit, canAddMoreUsers } from '../_functions/TaskCreateModelFunctions';

// Types and Constants
import { taskMockData, allUsers } from '@/mocks/staff/taskMockData';
import DefaultFormData, { PriorityOptions, StatusOptions } from '@/constants/DefaultFormData';
import { ALL_DEPARTMENTS } from '@/constants/Organisation';
import { Task, User, FormData, Departments, Priority, Status } from '@/types'

// Components
import { ModalTitle, ParentTaskField, DateRow, MultiSelectInput, DropDownMenu, Tags, AssignedUsersAutocomplete, Comments, FileUpload } from './_TaskCreateModal/';

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  setSnackbarContent: (message: string, severity: AlertColor) => void;
  currentUser: User;
  existingTaskDetails?: Task | null;
  preselectedParentTask?: Task | null;
  allTasks: Task[];
};

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  open,
  onClose,
  setSnackbarContent,
  currentUser,
  existingTaskDetails = null,
  preselectedParentTask = null,
  allTasks,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Determine if in edit mode
  const isEditMode = existingTaskDetails !== null;

  // Get current user object from allUsers
  const currentUserObj = allUsers.find(user => user.userId === currentUser.userId);

  // Form state
  const [formData, setFormData] = useState<FormData | Omit<FormData, 'taskId'>>(DefaultFormData);
  const [parentTask, setParentTask] = useState<Task | null>(null);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [newComment, setNewComment] = useState('');

  // Get available parent tasks (exclude subtasks and the task being edited)
  // To be replaced by API call to fetch all tasks where parentTaskId not null
  const availableParentTasks = allTasks.filter(task =>
    !task.parentTaskId && // Only allow main tasks as parents
    (!isEditMode || task.taskId !== existingTaskDetails!.taskId) // Exclude current task in edit mode
  );


  // Initialize form data when editing
  useEffect(() => {
    setErrors({});
    setSubmitMessage('')
    setSubmitStatus('idle');
    setParentTask(preselectedParentTask);
    if (open) {
      if (isEditMode && existingTaskDetails) {
        // Pre-populate form with existing task data
        setFormData({
          taskId: existingTaskDetails.taskId,
          title: existingTaskDetails.title,
          description: existingTaskDetails.description,
          parentTaskId: existingTaskDetails.parentTaskId,
          department: existingTaskDetails.department,
          priority: existingTaskDetails.priority,
          status: existingTaskDetails.status,
          startDate: dayjs(existingTaskDetails.startDate),
          completedDate: existingTaskDetails.completedDate ? dayjs(existingTaskDetails.completedDate) : null,
          dueDate: dayjs(existingTaskDetails.dueDate),
          assignedUsers: [...existingTaskDetails.assignedUsers],
          tags: [...existingTaskDetails.tags],
          comments: '',
          projectName: existingTaskDetails.projectName,
          attachedFile: null,
        });

        if (existingTaskDetails.parentTaskId) {
          const parentTaskObj = allTasks.find(t => t.taskId === existingTaskDetails.parentTaskId);
          setParentTask(parentTaskObj || null);
        }
      }
    }
    else {
      setFormData(DefaultFormData);
    }
  }, [open, isEditMode, existingTaskDetails, allTasks]);

  console.log('Form Data:', formData);

  const handleReset = () => {
    resetForm(setFormData, setErrors, setSubmitStatus, setSubmitMessage, setTagInput, setNewComment)
    setParentTask(null);
  }

  // Function to Trigger when Submit Button is Clicked
  const onSubmit = () => {

    const taskWithParent = {
      ...formData,
      parentTaskId: parentTask?.taskId,
    };

    handleSubmit({
      isEditMode, existingTaskDetails, formData: taskWithParent, newComment, currentUser,
      setSubmitStatus, setSubmitMessage, setErrors, handleReset, onClose,
      allTasks
    });
    // Placeholder. To replace with actual success condition
    if (existingTaskDetails) setSnackbarContent('Task updated successfully', 'success');
    else if (true) setSnackbarContent('Task created successfully', 'success');
    else setSnackbarContent('Failed to create task', 'error');
  };

  // Get unique project names from existing tasks [TO CHANGE TO API CALL LATER]
  const existingProjects = Array.from(new Set(taskMockData.tasks.map(t => t.projectName)));

  return (
    <Dialog open={open} onClose={onClose}
      maxWidth="md" fullWidth fullScreen={isMobile}
    >
      <ModalTitle isEditMode={isEditMode} onClose={onClose} />

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
        <DateRow formData={formData} setFormData={setFormData} errors={errors} parentTask={parentTask} />

        {/* Department, Priority and Status Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <MultiSelectInput
            label="Department"
            value={formData.department ?? []}
            onChange={(_, val) => setFormData((prev) => ({ ...prev, department: val as Departments[] }))}
            options={ALL_DEPARTMENTS}
            error={!!errors.department}
            helperText={errors.department}
            freeSolo={true} required={true} />

          <DropDownMenu
            label="Priority"
            value={formData.priority}
            onChange={(val) => setFormData((prev) => ({ ...prev, priority: val as Priority }))}
            options={PriorityOptions}
            error={!!errors.priority}
            helperText={errors.priority}
            required />

          <DropDownMenu
            label="Status"
            value={formData.status}
            onChange={(val) => setFormData((prev) => ({ ...prev, status: val as Status }))}
            options={StatusOptions}
            error={!!errors.status}
            helperText={errors.status}
            required />
        </Stack>

        {/* Assigned Users */}
        <AssignedUsersAutocomplete
          assignedUsers={formData.assignedUsers}
          setFormData={setFormData}
          isEditMode={isEditMode}
          existingAssignees={existingTaskDetails?.assignedUsers || []}
          currentUser={currentUser}
          error={!!errors.assignedUsers}
          helperText={errors.assignedUsers}
          canAddMoreUsers={canAddMoreUsers(formData.assignedUsers)} />

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
          errors={errors} newComment={newComment} setNewComment={setNewComment} />

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
            (isEditMode ? 'Update Task' : 'Create Task')
          }
        </Button>
      </DialogActions>
    </Dialog >
  );
};