'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { TProject } from '@/types/TProject';
import { Task } from '@/types';
import { TasksDataGrid } from './TasksDataGrid';
import dayjs from 'dayjs';

interface ProjectDetailModalProps {
  project: TProject | null;
  tasks: Task[];
  open: boolean;
  onClose: () => void;
  onTaskClick: (task: Task) => void;
}

/**
 * Modal that shows project details and its tasks
 * Now receives tasks as prop instead of fetching them
 */
export function ProjectDetailModal({ 
  project,
  tasks,
  open, 
  onClose, 
  onTaskClick 
}: ProjectDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Filter tasks for this project
   * useMemo to avoid recalculating on every render
   */
  const projectTasks = useMemo(() => {
    if (!project) return [];
    return tasks.filter(
      task => task.projectName.toLowerCase() === project.name.toLowerCase()
    );
  }, [project, tasks]);

  // Separate parent tasks and subtasks for display
  const parentTasks = projectTasks.filter(t => !t.parentTaskId);
  const subtaskCount = projectTasks.filter(t => t.parentTaskId).length;

  if (!project) return null;

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      completed: 'default',
      'on-hold': 'warning',
    } as const;
    return colors[status as keyof typeof colors] || 'default';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
            {project.name}
          </Typography>

          <Chip
            label={project.status}
            color={getStatusColor(project.status)}
            size={isMobile ? 'small' : 'medium'}
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Description Section */}
        {project.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.description}
            </Typography>
          </Box>
        )}

        {/* Dates Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 4 }}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Created
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs(project.createdAt).format('MMM DD, YYYY')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Last Updated
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs(project.updatedAt).format('MMM DD, YYYY')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Total Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {parentTasks.length} tasks, {subtaskCount} subtasks
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Tasks Section */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Tasks ({projectTasks.length})
          </Typography>

          {projectTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No tasks found in this project
              </Typography>
            </Box>
          ) : (
            <TasksDataGrid
              tasks={projectTasks}
              onTaskClick={onTaskClick}
              loading={false}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}