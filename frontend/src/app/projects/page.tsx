// src/app/projects/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Container,
  Alert,
  Stack
} from '@mui/material';
import { ProjectsDataGrid } from './_components/ProjectsDataGrid';
import { ProjectDetailModal } from './_components/ProjectDetailModal';
import { SearchBar } from './_components/SearchBar';
import { FilterControls } from './_components/FilterControls';
import { TProject, TProjectStatus } from '@/types/TProject';
import { Task, taskMockData } from '@/mocks/staff/taskMockData';
import { getAllProjects } from './_functions/getProjects';
import { applyProjectFilters } from './_functions/filterHelpers';

// Import your existing TaskDetailModal from calendar
import TaskDetailModal from '../calendar/TaskDetailModal';

/**
 * Main Projects Page
 * Shows list of projects, opens modals for details
 */
export default function ProjectsPage() {
  // Projects data
  const [projects, setProjects] = useState<TProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TProjectStatus>('all');

  // Modal state
  const [selectedProject, setSelectedProject] = useState<TProject | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  /**
   * Load projects on mount
   */
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

  /**
   * Apply search and filters to projects
   */
  const filteredProjects = applyProjectFilters(projects, searchTerm, statusFilter);

  /**
   * Handlers for modal open/close
   */
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
  /**
   * Handler for subtask clicks (from TaskDetailModal)
   */
  const handleSubtaskClick = (subtask: Task) => {
    setSelectedTask(subtask);
  };

  /**
   * Handler for task updates (from TaskDetailModal)
   */
  const handleTaskUpdated = (updatedTask: Task) => {
    // Optionally refresh projects or update local state
    console.log('Task updated:', updatedTask);
  };

  /**
   * Snackbar handler (for TaskDetailModal)
   */
  const setSnackbarContent = (message: string, severity: any) => {
    // TODO: Implement snackbar if needed
    console.log(`Snackbar: ${severity} - ${message}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all your projects and their tasks
        </Typography>
      </Box>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
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

        {/* Results count */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProjects.length} of {projects.length} projects
          </Typography>
        </Box>
      </Paper>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <Paper sx={{ p: 2 }}>
          <ProjectsDataGrid
            projects={filteredProjects}
            loading={loading}
            onProjectClick={handleProjectClick}
          />
        </Paper>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={handleProjectModalClose}
        onTaskClick={handleTaskClick}
      />

      {/* Task Detail Modal - Reusing from calendar */}
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
    </Container>
  );
}