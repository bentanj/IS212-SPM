'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Box, Typography, Alert, Autocomplete, Stack,
  useTheme, useMediaQuery, Paper, IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { User, Task, Comment, taskMockData, allUsers } from '@/mocks/staff/taskMockData';
import IFormData from "@/types/IFormData";
import DefaultFormData from '@/constants/DefaultFormData';
import CustomDatePicker from '@/components/DatePickerInput';
import {
  getAvailableUsers, validateForm,
  handleFileUpload, handleRemoveFile, handleAssignedUsersChange,
  handleAddTag, handleRemoveTag, resetForm,
  handleSubmit,
} from '../_functions/TaskCreateModelFunctions';
import renderAssignedUserTags from '../_functions/renderAssignedUserTags';
import NoPermission from './_TaskCreateModal/NoPermission';
import ModalTitle from './_TaskCreateModal/ModalTitle';

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
      onTaskCreated, onTaskUpdated, setSubmitStatus, setSubmitMessage, handleReset, onClose
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <CustomDatePicker label="Start Date"
              value={formData.startDate ? formData.startDate.toDate() : null}
              onChange={(date) => setFormData(prev => ({ ...prev, startDate: date ? dayjs(date) : null }))}
              minSelectableDate={new Date()}
              textFieldProps={{
                required: true,
                error: !!errors.startDate,
                helperText: errors.startDate,
              }}
            />

            <CustomDatePicker label="Due Date"
              value={formData.dueDate ? formData.dueDate.toDate() : null}
              onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date ? dayjs(date) : null }))}
              minSelectableDate={formData.startDate ? formData.startDate.toDate() : null}
              textFieldProps={{
                required: true,
                error: !!errors.dueDate,
                helperText: errors.dueDate,
              }}
            />

            <CustomDatePicker label="Completed Date"
              value={formData.completedDate ? formData.completedDate.toDate() : null}
              onChange={(date) => setFormData(prev => ({ ...prev, completedDate: date ? dayjs(date) : null }))}
              minSelectableDate={formData.startDate ? formData.startDate.toDate() : null}
              textFieldProps={{
                required: true,
                error: !!errors.completedDate,
                helperText: errors.completedDate,
              }}
            />
          </Stack>
        </LocalizationProvider>

        {/* Priority and Status Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <FormControl fullWidth error={!!errors.priority}>
            <InputLabel required>Priority</InputLabel>
            <Select label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
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
          onChange={(event, value) => {
            handleAssignedUsersChange(event, value, isEditMode, existingAssignees, currentUser, currentUserObj, setFormData);
          }}
          noOptionsText={
            !canAddMoreUsers
              ? "Maximum 5 users reached. Remove a user to add more."
              : availableUsers.length === 0
                ? "No more users available"
                : "No options"
          }
          renderInput={(params) => (
            <TextField label="Assigned Users"
              required margin="normal"
              {...params}
              error={!!errors.assignedUsers}
              helperText={
                errors.assignedUsers ||
                (isEditMode ? "Note: Existing assignees cannot be removed, but you can add new ones" : "")
              }
            />
          )}
          renderValue={(user, getTagProps) =>
            renderAssignedUserTags(user, getTagProps, currentUser, isEditMode, existingAssignees)
          }
          filterSelectedOptions
          getOptionDisabled={(option) => !canAddMoreUsers}
        />

        {/* Tags */}
        <TextField label="Add Tags"
          fullWidth margin="normal"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(event) => {
            handleAddTag(event, tagInput, setTagInput, formData, setFormData);
          }}
          helperText="Type a tag and press Enter to add it"
        />

        {formData.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {formData.tags.map((tag, index) => (
              <Chip key={index} label={tag}
                size="small" color="primary" variant="outlined"
                onDelete={() => handleRemoveTag(tag, setFormData)} />
            ))}
          </Box>
        )}

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
