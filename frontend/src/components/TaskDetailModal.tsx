'use client';

import React, { useMemo } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Avatar, Stack,
  useTheme, useMediaQuery, AlertColor
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import { User, Task, Priority, Status } from '@/types';
import dayjs from 'dayjs';
import { canEditTask } from '@/utils/Permissions';
import { ModalTitle, Subtitle1, SubTaskSection, CommentSection } from './_TaskDetailModal';
import updateTask from '@/utils/Tasks/updateTask';
import { validateCanCompleteTask, taskCompletedTrigger } from '@/utils/TaskCreateModelFunctions';
import { TaskAttachmentsSection } from './_TaskCreateModal/TaskAttachmentsSection';

interface TaskDetailModalProps {
  task: Task | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  open: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateSubtask?: (parentTask: Task) => void;
  onSubtaskClick?: (subtask: Task) => void;
  onEditButtonClick?: () => void;
  allTasks?: Task[];
  setSnackbarContent: (message: string, severity: AlertColor) => void;
  refetchTasks: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task, setSelectedTask,
  open, onClose,
  currentUser,
  onCreateSubtask,
  onSubtaskClick,
  onEditButtonClick,
  allTasks,
  setSnackbarContent, refetchTasks
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

  // Preserve original priority and status to detect changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [originalPriority, originalStatus] = useMemo(() => [task?.priority, task?.status], [task?.taskId]);

  if (!task) return null;

  function changePriority(newPriority: Priority) {
    setSelectedTask(prev => prev ? { ...prev, priority: newPriority } : prev);
  }

  function changeStatus(newStatus: Status) {
    if (newStatus == "Completed") task!.completedDate = dayjs().format('YYYY-MM-DD');
    else task!.completedDate = null;
    setSelectedTask(prev => prev ? { ...prev, status: newStatus } : prev);
  }

  const renderCreateSubtaskButton = () => {
    return onCreateSubtask &&                     // onCreateSubtask prop is provided
      !task.parentTaskId &&                       // Task is not already a subtask
      task.status != "Completed" &&               // Task is not completed
      dayjs(task.dueDate).isAfter(dayjs())        // Due date is in the future
  }

  const onSave = async () => {
    const TaskData = {
      ...task,
      assigned_users: task.assignedUsers.map(user => user.userId),
      uploaded_by: currentUser.userId,
    }

    if (task.status == "Completed") {
      if (originalStatus == "To Do") {
        setSnackbarContent('Task can only be "Completed" from "In Progress" status.', 'error');
        return;
      }
      const canComplete = await validateCanCompleteTask(TaskData, setSnackbarContent)
      if (!canComplete) return;
      taskCompletedTrigger(TaskData, setSnackbarContent, currentUser.userId);
    }

    updateTask(TaskData)
      .then(() => {
        setSnackbarContent("Task updated successfully", "success");

        refetchTasks();

        setTimeout(() => {
          onClose();
        }, 1500 + (task.status == "Completed" ? 2000 : 0));
      })
      .catch((error) => {
        console.error("Error updating task:", error);
        setSnackbarContent("Failed to update task. Please try again", "error");
      });
  }

  // Check if current user can edit this task
  const canEdit = canEditTask(currentUser, task);

  return (
    <>
      <Dialog open={open} onClose={onClose}
        maxWidth="md" fullWidth fullScreen={isMobile}>

        <ModalTitle task={task} isMobile={isMobile}
          originalPriority={originalPriority as Priority}
          originalStatus={originalStatus as Status}
          changePriority={changePriority}
          changeStatus={changeStatus}
          onSaveButtonClick={onSave} />

        <DialogContent dividers>

          <Subtitle1 boxMarginBottom={3} label="Description">{task.description} </Subtitle1>

          <Stack direction="row">
            <Subtitle1 boxMarginBottom={3} label="Project">{task.project_name}</Subtitle1>
            <Box sx={{ ml: "auto", mr: "auto" }}>
              <Subtitle1 boxMarginBottom={3} label="Departments">
                {task.departments.map((dept, idx) => (
                  <Chip key={idx} label={dept} sx={{ mr: 1 }} size="small" />
                ))}
              </Subtitle1>
            </Box>
          </Stack>

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

            <Subtitle1 label="Recurrence Frequency">{task.recurrenceFrequency}</Subtitle1>
            {task.recurrenceFrequency != "One-Off" &&
              <Subtitle1 label="Recurrence Interval">{task.recurrenceInterval}</Subtitle1>
            }
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
                <Chip key={index} label={tag} size="small" variant="outlined" />
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

          {/* Attachments Section */}
          <TaskAttachmentsSection
            taskId={task.taskId}
            uploadedBy={currentUser.userId}
            setSnackbarContent={setSnackbarContent}
          />
        </DialogContent>

        <DialogActions>
          {/* Create Subtask Button - Only show if   */}
          {renderCreateSubtaskButton() &&
            (<Button variant="outlined" startIcon={<Add />}
              sx={{ mr: 'auto' }} // Pushes button to the left
              onClick={() => { onCreateSubtask!(task); }}>
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