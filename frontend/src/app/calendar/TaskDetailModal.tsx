'use client';

import React, { useState } from 'react';
import {
  AlertColor,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { Task, taskMockData } from '@/mocks/staff/taskMockData';
import dayjs from 'dayjs';
import TaskCreateModal from './_components/TaskCreateModal';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  setSnackbarContent: (message: string, severity: AlertColor) => void;
  onTaskUpdated?: (task: Task) => void;
  onCreateSubtask?: (parentTask: Task) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'info';
    default: return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'In Progress': return 'primary';
    case 'Blocked': return 'error';
    case 'To Do': return 'default';
    default: return 'default';
  }
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  open,
  onClose,
  onTaskUpdated,
  setSnackbarContent,
  onCreateSubtask, // Accept the new prop
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { currentUser } = taskMockData;

  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!task) return null;

  // Check if current user can edit this task
  const canEdit = task.ownerId === currentUser.userId ||
    task.assignedUsers.some(user => user.userId === currentUser.userId);

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    onTaskUpdated?.(updatedTask);
    setEditModalOpen(false);
  };

  // New handler for subtask creation
  const handleCreateSubtask = () => {
    onCreateSubtask?.(task);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            margin: isMobile ? 0 : 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {task.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Chip
                label={task.priority}
                color={getPriorityColor(task.priority) as any}
                size={isMobile ? 'small' : 'medium'}
              />
              <Chip
                label={task.status}
                color={getStatusColor(task.status) as any}
                size={isMobile ? 'small' : 'medium'}
              />
            </Stack>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Description Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task.description}
            </Typography>
          </Box>

          {/* Project Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Project
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task.projectName}
            </Typography>
          </Box>

          {/* Dates Section - Responsive Stack */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Start Date
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayjs(task.startDate).format('MMM DD, YYYY')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Due Date
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayjs(task.dueDate).format('MMM DD, YYYY')}
              </Typography>
            </Box>
            {task.completedDate && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Completed Date
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(task.completedDate).format('MMM DD, YYYY')}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Assigned Users Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Assigned Users
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {task.assignedUsers.map((user) => (
                <Box key={user.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Typography variant="body2">{user.name}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Tags Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {task.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          {/* Comments Section */}
          {task.comments.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Comments ({task.comments.length})
              </Typography>
              <List sx={{ p: 0 }}>
                {task.comments.map((comment, index) => (
                  <ListItem key={comment.commentId} sx={{ p: 0, mb: 2, display: 'block' }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {comment.author}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(comment.timestamp).format('MMM DD, YYYY HH:mm')}
                      </Typography>
                    </Paper>
                    {index !== task.comments.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {/* Create Subtask Button - Only show if onCreateSubtask prop is provided and task is not already a subtask */}
          {onCreateSubtask && !task.parentTaskId && (
            <Button
              onClick={handleCreateSubtask}
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mr: 'auto' }} // Pushes button to the left
            >
              {isMobile ? 'Subtask' : 'Create Subtask'}
            </Button>
          )}

          <Button
            onClick={onClose}
            variant="outlined"
          >
            Close
          </Button>
          
          {canEdit && (
            <Button
              onClick={handleEditClick}
              variant="contained"
              startIcon={<EditIcon />}
            >
              {isMobile ? 'Edit' : 'Edit Task'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <TaskCreateModal
        open={editModalOpen}
        onClose={handleEditClose}
        onTaskUpdated={handleTaskUpdated}
        editingTask={task}
        setSnackbarContent={setSnackbarContent}
      />
    </>
  );
};

export default TaskDetailModal;
