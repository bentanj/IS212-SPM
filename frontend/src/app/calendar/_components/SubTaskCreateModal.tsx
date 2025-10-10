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
import { Task, taskMockData, allUsers, User } from '@/mocks/staff/taskMockData';
import IFormData from "@/types/IFormData";
import DefaultFormData, { PriorityOptions, StatusOptions } from '@/constants/DefaultFormData';
import { ALL_DEPARTMENTS } from '@/constants/Organisation';

// Components
import ModalTitle from './_TaskCreateModal/ModalTitle';
import DateRow from './_TaskCreateModal/DateRow';
import DropDownMenu from './_TaskCreateModal/DropDownMenu';
import Tags from './_TaskCreateModal/Tags';
import AssignedUsersAutocomplete from './_TaskCreateModal/AssignedUsers';
import Comments from './_TaskCreateModal/Comments';
import FileUpload from './_TaskCreateModal/FileUpload';
import ParentTaskField from './_TaskCreateModal/ParentTaskField';
import { Departments } from '@/types/TOrganisation';
import Priority from '@/types/TPriority';
import Status from '@/types/TStatus';

interface SubtaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  setSnackbarContent: (message: string, severity: AlertColor) => void;
  currentUser: User;
  existingTaskDetails?: Task | null;
  preselectedParentTask?: Task | null; // New prop for pre-selecting parent
  allTasks: Task[]; // All tasks for parent selection
}

const SubtaskCreateModal: React.FC<SubtaskCreateModalProps> = ({
  open,
  onClose,
  onTaskCreated,
  onTaskUpdated,
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

  // Get existing assignees for edit mode (cannot be removed)
  const existingAssignees = isEditMode ? existingTaskDetails!.assignedUsers : [];

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
    (!isEditMode || task.taskId !== existingTaskDetails!.taskId) // Exclude current task in edit mode
  );

  // Initialize form data when editing or opening
  useEffect(() => {
    setErrors({});
    setSubmitMessage('');
    setSubmitStatus('idle');

    if (open) {
      if (isEditMode && existingTaskDetails) {
        // Pre-populate form with existing task data
        setFormData({
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

        // Set parent task if editing a subtask
        if (existingTaskDetails.parentTaskId) {
          const parentTaskObj = allTasks.find(t => t.taskId === existingTaskDetails.parentTaskId);
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
  }, [open, isEditMode, existingTaskDetails, preselectedParentTask, allTasks]);

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
      isEditMode, existingTaskDetails, formData: taskWithParent, newComment, currentUser,
      setSubmitStatus, setSubmitMessage, setErrors, handleReset, onClose,
      allTasks,
    });

    // Success messages
    if (existingTaskDetails) setSnackbarContent('Subtask updated successfully', 'success');
    else if (true) setSnackbarContent('Subtask created successfully', 'success');
    else setSnackbarContent('Failed to create subtask', 'error');
  };


  // Get available users for assignment (excluding already assigned)
  const availableUsers = getAvailableUsers(allUsers, formData.assignedUsers);

  // Get unique project names from existing tasks
  const existingProjects = Array.from(new Set(taskMockData.tasks.map(t => t.projectName)));

  return (
    <Dialog open={open} onClose={onClose}
      maxWidth="md" fullWidth fullScreen={isMobile}
    >
      <ModalTitle
        isEditMode={isEditMode}
        onClose={onClose}
      />

      Subtask Modal

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
        <DateRow formData={formData} setFormData={setFormData} errors={errors} parentTask={parentTask as Task} />

        {/* Priority and Status Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <DropDownMenu
            label="Department"
            value={formData.department}
            onChange={(val) => setFormData((prev) => ({ ...prev, department: val as Departments }))}
            options={ALL_DEPARTMENTS}
            error={!!errors.department}
            helperText={errors.department}
            required />

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
          availableUsers={availableUsers}
          assignedUsers={formData.assignedUsers}
          setFormData={setFormData}
          isEditMode={isEditMode}
          existingAssignees={existingAssignees}
          currentUser={currentUser}
          currentUserObj={currentUserObj}
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
              (existingTaskDetails?.parentTaskId ? 'Update Subtask' : 'Update Task') :
              (parentTask ? 'Create Subtask' : 'Create Task')
            )
          }
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default SubtaskCreateModal;