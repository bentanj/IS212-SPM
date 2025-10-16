'use client';

// All your original imports from page.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Stack, useMediaQuery, useTheme } from '@mui/material';

import { taskMockData } from '@/mocks/staff/taskMockData';
import { Task, TProject, TProjectStatus } from '@/types';
import { getAllProjects } from '@/utils/Projects/getProjects';

import { ProjectsDataGrid } from './ProjectsDataGrid';
import { ProjectDetailModal } from './ProjectDetailModal';
import { SearchBar } from './SearchBar';
import { FilterControls } from './FilterControls';

import { applyProjectFilters } from '../_functions/filterHelpers';
import { TaskDetailModal } from '@/app/calendar/_components';
import { ProjectCardList } from './ProjectCardList';


// The ONLY CHANGE is the function name here
export default function ProjectsUI() {

  // Projects data
  const [projects, setProjects] = useState<TProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // This is TRUE on mobile screens

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TProjectStatus>('all');

  // Modal state
  const [selectedProject, setSelectedProject] = useState<TProject | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleTaskUpdated = (updatedTask: Task) => {
    console.log('Task updated:', updatedTask);
  };

  const setSnackbarContent = (message: string, severity: any) => {
    console.log(`Snackbar: ${severity} - ${message}`);
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
              // If mobile is true, show the new card list
              <ProjectCardList
                projects={filteredProjects}
                onProjectClick={handleProjectClick}
              />
            ) : (
              // Otherwise, show the original data grid inside the Paper
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
        open={!!selectedProject}
        onClose={handleProjectModalClose}
        onTaskClick={handleTaskClick}
      />

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={handleTaskModalClose}
        onTaskUpdated={handleTaskUpdated}
        setSnackbarContent={setSnackbarContent}
        currentUser={taskMockData.currentUser}
        onSubtaskClick={handleSubtaskClick}
        allTasks={taskMockData.tasks}
      />
    </Box>
  );
}