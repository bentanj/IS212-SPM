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
import { handleAddTag, handleRemoveTag, resetForm, handleSubmit, canAddMoreUsers } from '@/utils/TaskCreateModelFunctions';

// Types and Constants
import { taskMockData } from '@/mocks/staff/taskMockData';
import DefaultFormData, { PriorityOptions, StatusOptions } from '@/constants/DefaultFormData';
import { ALL_DEPARTMENTS } from '@/constants/Organisation';
import { Task, User, FormData, Departments, Priority, Status } from '@/types'

// Components
import { ModalTitle, ParentTaskField, DateRow, RecurringParams, MultiSelectInput, DropDownMenu, Tags, AssignedUsersAutocomplete, Comments, FileUpload } from './_TaskCreateModal/';

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetchTasks: () => void;
  setSnackbarContent: (message: string, severity: AlertColor) => void;
  currentUser: User;
  existingTaskDetails?: Task | null;
  preselectedParentTask?: Task | null;
  allTasks: Task[];
};

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  open,
  onClose,
  refetchTasks,
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

  // Form state
  const [formData, setFormData] = useState<FormData | Omit<FormData, 'taskId'>>(DefaultFormData);
  const [parentTask, setParentTask] = useState<Task | null>(null);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [newComment, setNewComment] = useState('');

  // Get available parent tasks (exclude subtasks and the task being edited)
  // To be replaced by API call to fetch all tasks where parentTaskId not null
  const availableParentTasks = allTasks.filter(task =>
    !task.parentTaskId && // Only allow main tasks as parents
    (!isEditMode || task.taskId !== existingTaskDetails!.taskId) && // Exclude current task in edit mode
    task.status !== "Completed" // Exclude completed tasks
  );

  // Initialize form data when editing
  useEffect(() => {
    setErrors({});
    setParentTask(preselectedParentTask);
    if (isEditMode && existingTaskDetails) {
      // Pre-populate form with existing task data
      setFormData({
        ...existingTaskDetails,
        startDate: dayjs(existingTaskDetails.startDate),
        completedDate: existingTaskDetails.completedDate ? dayjs(existingTaskDetails.completedDate) : null,
        dueDate: dayjs(existingTaskDetails.dueDate),
        comments: "",
        attachedFile: null,
      });

      if (existingTaskDetails.parentTaskId) {
        const parentTaskObj = allTasks.find(t => t.taskId === existingTaskDetails.parentTaskId);
        setParentTask(parentTaskObj || null);
      }
    }
    else {
      setFormData(DefaultFormData);
    }

    if (preselectedParentTask) { setFormData(prev => ({ ...prev, parentTaskId: preselectedParentTask.taskId })) }

  }, [preselectedParentTask, open, isEditMode, existingTaskDetails, allTasks]);

  const handleReset = () => {
    resetForm(setFormData, setErrors, setTagInput, setNewComment)
    setParentTask(null);
  }

  // Function to Trigger when Submit Button is Clicked
  const onSubmit = () => {
    handleSubmit({
      existingTaskDetails, formData, newComment, currentUser,
      setSnackbarContent, setErrors, handleReset, onClose
    })
      .then((response) => {
        if (response) {
          refetchTasks();
        }
      })
  }

  // Get unique project names from existing tasks [TO CHANGE TO API CALL LATER]
  const existingProjects = Array.from(new Set(taskMockData.tasks.map(t => t.project_name)));

  return (
    <Dialog open={open} onClose={onClose}
      maxWidth="md" fullWidth fullScreen={isMobile} closeAfterTransition={false}
    >
      <ModalTitle isEditMode={isEditMode} onClose={onClose} />

      <DialogContent dividers>
        {Object.keys(errors).length > 0 && (
          <Alert sx={{ mb: 2 }} severity='error'>
            Please fix the following errors before submitting.
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
          value={formData.project_name}
          onChange={(event: React.SyntheticEvent, value: string | null) => setFormData(prev => ({ ...prev, project_name: value || '' }))}
          onInputChange={(event: React.SyntheticEvent, value: string) => setFormData(prev => ({ ...prev, project_name: value }))}
          renderInput={(params) => (
            <TextField label="Project Name"
              {...params} required margin="normal"
              error={!!errors.project_name}
              helperText={errors.project_name} />
          )} />

        {/* Dates Row */}
        <DateRow formData={formData} setFormData={setFormData} errors={errors} parentTask={parentTask} />

        {/* Recurring Params */}
        <RecurringParams formData={formData} setFormData={setFormData} errors={errors} />

        {/* Department, Priority and Status Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <MultiSelectInput
            label="Department"
            value={formData.departments ?? []}
            onChange={(_, val) => setFormData((prev) => ({ ...prev, departments: val as Departments[] }))}
            options={ALL_DEPARTMENTS}
            error={!!errors.departments}
            helperText={errors.departments}
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
            onChange={(val) => {
              if (val === "Completed") {
                setFormData((prev) => ({ ...prev, status: val as Status, completedDate: dayjs() }))
              } else {
                setFormData((prev) => ({ ...prev, status: val as Status, completedDate: null }))
              }
            }}
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
        <Button variant="contained" onClick={onSubmit}>
          {isEditMode ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog >
  );
};