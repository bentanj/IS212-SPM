'use client';

import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useCallback } from 'react';
import { AlertColor, Box, Typography, Paper, CircularProgress, Alert, Stack, Snackbar, useMediaQuery, useTheme } from '@mui/material';

import { Task, TProject, TProjectStatus } from '@/types';
import { getUserTask } from '@/utils/Tasks/getTask';
import { getProjectsByTasks } from '../_functions/getProjectsByTasks';

import { ProjectsDataGrid } from './ProjectsDataGrid';
import { ProjectDetailModal } from './ProjectDetailModal';
import { SearchBar } from './SearchBar';
import { FilterControls } from './FilterControls';
import { ProjectCardList } from './ProjectCardList';

import { applyProjectFilters } from '../_functions/filterHelpers';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { enqueueSnackbar } from 'notistack';

export default function ProjectsUI() {
  // Data state
  const [projects, setProjects] = useState<TProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current user - using session data
  const { data: session } = useSession();
  const currentUser = session?.user || null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TProjectStatus>('all');

  // Modal state
  const [selectedProject, setSelectedProject] = useState<TProject | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Snackbar
  const setSnackbarContent = (message: string, severity: AlertColor) => {
    enqueueSnackbar(message, { variant: severity });
  };

  const loadProjectsAndTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch tasks from API (same as calendar does)
      const taskData = await getUserTask(currentUser);
      setTasks(taskData);

      // 2. Extract projects from tasks
      const projectData = getProjectsByTasks(taskData);
      setProjects(projectData);

    } catch (err) {
      console.error('Error loading projects and tasks:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProjectsAndTasks();
  }, [loadProjectsAndTasks]);

  const filteredProjects = applyProjectFilters(projects, searchTerm, statusFilter);

  const handleProjectClick = (project: TProject) => {
    setSelectedProject(project);
  };

  const handleProjectModalClose = () => {
    setSelectedProject(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskModalClose = () => {
    setSelectedTask(null);
  };

  const handleSubtaskClick = (subtask: Task) => {
    setSelectedTask(subtask);
  };

  const handleTaskUpdated = (newAllTasks: Task[]) => {
    // The modal gives us the complete, updated list.
    setTasks(newAllTasks);
    console.log('Task list updated via modal.');
  };

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Main Content Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{
          px: 3,
          py: 2,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Projects
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Box sx={{
          px: 3,
          py: 2,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Box sx={{ flex: 1 }}>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search projects..."
              />
            </Box>
            <FilterControls
              status={statusFilter}
              onStatusChange={setStatusFilter}
            />
          </Stack>
        </Box>

        {/* Content Area */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
        }}>
          {/* Results Summary */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredProjects.length} of {projects.length} projects
            </Typography>
          </Box>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400
            }}>
              <CircularProgress />
            </Box>
          )}

          {/* Projects Grid or Card List */}
          {!loading && !error && (
            isMobile ? (
              <ProjectCardList
                projects={filteredProjects}
                onProjectClick={handleProjectClick}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <ProjectsDataGrid
                  projects={filteredProjects}
                  loading={loading}
                  onProjectClick={handleProjectClick}
                />
              </Paper>
            )
          )}
        </Box>
      </Box>

      {/* Modals */}
      <ProjectDetailModal
        project={selectedProject}
        tasks={tasks}
        open={!!selectedProject}
        onClose={handleProjectModalClose}
        onTaskClick={handleTaskClick}
      />

      <TaskDetailModal
        task={selectedTask}
        setSelectedTask={setSelectedTask}
        open={!!selectedTask}
        onClose={handleTaskModalClose}
        setSnackbarContent={setSnackbarContent}
        currentUser={currentUser}
        onSubtaskClick={handleSubtaskClick}
        allTasks={tasks}
        refetchTasks={loadProjectsAndTasks}
      />

    </Box>
  );
}