'use client';

import React, { useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Avatar, Divider, List, ListItem, Paper, Stack,
  useTheme, useMediaQuery
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import { taskMockData } from '@/mocks/staff/taskMockData';
import { User, Task } from '@/types';
import dayjs from 'dayjs';
import { canEditTask } from '@/utils/Permissions';
import { getPriorityColor, getStatusColor } from './_functions/TaskRenderingFunctions';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateSubtask?: (parentTask: Task) => void;
  onSubtaskClick?: (subtask: Task) => void;
  onEditButtonClick?: () => void; // New
  allTasks?: Task[]; // New
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  open,
  currentUser,
  onClose,
  onCreateSubtask,
  onSubtaskClick,
  onEditButtonClick,
  allTasks, // New
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const relatedSubtasks = useMemo(() => {
    // Return empty array if task is null/undefined
    // This prevents the "Cannot read properties of null" error
    if (!task) return [];

    // Only show subtasks if this is a parent task (not a subtask itself)
    // If the current task has a parentTaskId, it means it's a subtask,
    // so we don't want to show its siblings or any subtasks
    if (task.parentTaskId) return [];

    // ✅ Use allTasks prop if provided, fallback to mockData
    const tasksToFilter = allTasks || taskMockData.tasks;
    return tasksToFilter.filter(t => t.parentTaskId === task.taskId);
  }, [task, allTasks]); // ✅ Add allTasks to dependency array

  if (!task) return null;

  // Check if current user can edit this task
  const canEdit = canEditTask(currentUser, task);

  return (
    <>
      <Dialog open={open} onClose={onClose}
        maxWidth="md" fullWidth fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              maxHeight: '90vh',
              margin: isMobile ? 0 : 2,
            }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {task.parentTaskId ? `└ ${task.title}` : task.title}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Chip
                label={task.priority}
                sx={{ color: getPriorityColor(task.priority) }}
                size={isMobile ? 'small' : 'medium'}
              />
              <Chip
                label={task.status}
                sx={{ color: getStatusColor(task.status) }}
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

          {/* Subtasks Section - Only show for parent tasks with subtasks */}
          {!task.parentTaskId && relatedSubtasks.length > 0 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  Subtasks ({relatedSubtasks.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {relatedSubtasks.map((subtask, index) => (
                    <React.Fragment key={subtask.taskId}>
                      <ListItem
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => onSubtaskClick?.(subtask)}
                      >
                        <Stack spacing={1} sx={{ width: '100%' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontStyle: 'italic',
                                flexGrow: 1
                              }}
                            >
                              └ {subtask.title}
                            </Typography>

                            <Chip
                              label={subtask.priority}
                              size="small"
                              sx={{ color: getPriorityColor(subtask.priority) }}
                            />
                            <Chip
                              label={subtask.status}
                              size="small"
                              variant="outlined"
                              color={getStatusColor(subtask.status)}
                            />
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {subtask.description}
                          </Typography>

                          <Stack direction="row" spacing={2}>
                            <Typography variant="caption" color="text.secondary">
                              Start: {dayjs(subtask.startDate).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Due: {dayjs(subtask.dueDate).format('MMM DD, YYYY')}
                            </Typography>
                          </Stack>
                        </Stack>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

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
              onClick={() => { onCreateSubtask(task); }}
              variant="outlined"
              startIcon={<Add />}
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
              onClick={onEditButtonClick}
              variant="contained"
              startIcon={<Edit />}
            >
              {isMobile ? 'Edit' : 'Edit Task'}
            </Button>
          )}
        </DialogActions>
      </Dialog >
    </>
  );
};

export default TaskDetailModal;
