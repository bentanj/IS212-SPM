'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert, Autocomplete, Stack,
  useTheme, useMediaQuery, Paper, IconButton
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

import dayjs from 'dayjs';
import { Task, taskMockData, allUsers } from '@/mocks/staff/taskMockData';
import IFormData from "@/types/IFormData";
import DefaultFormData, { PriorityOptions, StatusOptions } from '@/constants/DefaultFormData';
import { getAvailableUsers, handleFileUpload, handleRemoveFile, handleAddTag, handleRemoveTag, resetForm, handleSubmit } from '../_functions/TaskCreateModelFunctions';
import NoPermission from './_TaskCreateModal/NoPermission';
import ModalTitle from './_TaskCreateModal/ModalTitle';
import DateRow from './_TaskCreateModal/DateRow';
import DropDownMenu from './_TaskCreateModal/DropDownMenu';
import Tags from './_TaskCreateModal/Tags';
import AssignedUsersAutocomplete from './_TaskCreateModal/AssignedUsers';

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

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [newComment, setNewComment] = useState('');

  // Initialize form data when editing
  useEffect(() => {
    setErrors({});
    setSubmitMessage('')
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
      }
    }
  }, [open, isEditMode, editingTask]);

  const handleReset = () => {
    resetForm(setFormData, setErrors, setSubmitStatus, setSubmitMessage, setTagInput, setNewComment)
  }

  // Function to Trigger when Submit Button is Clicked
  const onSubmit = () => {
    handleSubmit({
      canEdit, isEditMode, editingTask, formData, newComment, currentUser,
      onTaskCreated, onTaskUpdated, setSubmitStatus, setSubmitMessage, setErrors, handleReset, onClose
    });
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
      <ModalTitle isEditMode={isEditMode} onClose={onClose} />

      <DialogContent dividers>
        {submitStatus !== 'idle' && (
          <Alert sx={{ mb: 2 }} severity={submitStatus === 'success' ? 'success' : 'error'}>
            {submitMessage}
          </Alert>
        )}

        {/* Title */}
        <TextField label="Title"
          required fullWidth margin="normal"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          error={!!errors.title}
          helperText={errors.title}
        />

        {/* Description */}
        <TextField label="Description"
          required fullWidth margin="normal"
          multiline rows={3}
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
            <TextField label="Project Name"
              {...params} required margin="normal"
              error={!!errors.projectName}
              helperText={errors.projectName}
            />
          )}
        />

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
          canAddMoreUsers={canAddMoreUsers}
        />

        {/* Tags */}
        <Tags
          tagInput={tagInput}
          setTagInput={setTagInput}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          formData={formData}
          setFormData={setFormData}
        />

        {/* Comments */}
        {isEditMode ? (
          <TextField label="Add New Comment (Optional)"
            fullWidth margin="normal"
            multiline rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            helperText="Add an optional comment about your changes"
          />
        ) : (
          <TextField label="Initial Comment (Optional)"
            fullWidth margin="normal"
            multiline rows={2}
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
            <Button component="label" variant="outlined"
              startIcon={<CloudUploadIcon />} fullWidth={isMobile}>
              Upload File
              <input type="file" hidden
                onChange={(event) => { handleFileUpload(event, setFormData) }} />
            </Button>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {formData.attachedFile.name}
              </Typography>
              <IconButton size="small" onClick={() => handleRemoveFile(setFormData)}>
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

export default TaskCreateModal;
