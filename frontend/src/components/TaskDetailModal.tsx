'use client';

import React, { useMemo } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Avatar, Stack,
  useTheme, useMediaQuery
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import { User, Task } from '@/types';
import dayjs from 'dayjs';
import { canEditTask } from '@/utils/Permissions';
import { ModalTitle, Subtitle1, SubTaskSection, CommentSection } from './_TaskDetailModal';

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

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
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
    return allTasks!.filter(t => t.parentTaskId === task.taskId);
  }, [task, allTasks]); // ✅ Add allTasks to dependency array

  if (!task) return null;

  // Check if current user can edit this task
  const canEdit = canEditTask(currentUser, task);

  return (
    <>
      <Dialog open={open} onClose={onClose}
        maxWidth="md" fullWidth fullScreen={isMobile}>

        <ModalTitle task={task} isMobile={isMobile} />

        <DialogContent dividers>

          <Subtitle1 boxMarginBottom={3} label="Description">{task.description} </Subtitle1>
          <Subtitle1 boxMarginBottom={3} label="Project">{task.project_name}</Subtitle1>

          {/* Dates Section - Responsive Stack */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} sx={{ mb: 3 }}>
            <Subtitle1 label="Start Date">{dayjs(task.startDate).format('MMM DD, YYYY')}</Subtitle1>
            <Subtitle1 label="Due Date">{dayjs(task.dueDate).format('MMM DD, YYYY')}</Subtitle1>

            <Subtitle1 label="Completed Date">
              {task.completedDate
                ? dayjs(task.completedDate).format('MMM DD, YYYY')
                : "Pending Completion"
              }
            </Subtitle1>
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
            <SubTaskSection relatedSubtasks={relatedSubtasks} onSubtaskClick={onSubtaskClick} />
          )}

          {/* Comments Section */}
          {task.comments.length > 0 && (
            <CommentSection comments={task.comments} />
          )}
        </DialogContent>

        <DialogActions>
          {/* Create Subtask Button - Only show if onCreateSubtask prop is provided and task is not already a subtask */}
          {onCreateSubtask && !task.parentTaskId && (
            <Button variant="outlined" startIcon={<Add />}
              sx={{ mr: 'auto' }} // Pushes button to the left
              onClick={() => { onCreateSubtask(task); }}>
              {isMobile ? 'Subtask' : 'Create Subtask'}
            </Button>
          )}

          <Button onClick={onClose} variant="outlined">
            Close
          </Button>

          {canEdit && (
            <Button variant="contained" startIcon={<Edit />} onClick={onEditButtonClick}>
              {isMobile ? 'Edit' : 'Edit Task'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};