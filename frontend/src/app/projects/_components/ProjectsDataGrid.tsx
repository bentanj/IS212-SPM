'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { TProject } from '@/types/TProject';

/**
 * Props for ProjectsDataGrid
 */
interface ProjectsDataGridProps {
  projects: TProject[];     // Array of projects to display
  loading?: boolean;        // Show loading state
}

/**
 * DataGrid component for displaying projects
 * 
 * Features:
 * - Sortable columns
 * - Pagination
 * - Click row to navigate to project detail
 * - Status badges with colors
 * - Responsive
 * 
 * Usage:
 * <ProjectsDataGrid projects={filteredProjects} loading={isLoading} />
 */
export function ProjectsDataGrid({ projects, loading = false }: ProjectsDataGridProps) {
  const router = useRouter();

  /**
   * Column definitions
   * Each column defines how to display a field from the project object
   */
  const columns: GridColDef<TProject>[] = [
    {
      field: 'name',
      headerName: 'Project Name',
      flex: 1,            // Takes up remaining space
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        // Custom rendering for status - show colored chip
        const statusColors = {
          active: 'success',
          completed: 'default',
          'on-hold': 'warning',
        } as const;

        return (
          <Chip
            label={params.value}
            color={statusColors[params.value as keyof typeof statusColors]}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        );
      },
    },
    {
      field: 'taskCount',
      headerName: 'Tasks',
      width: 100,
      type: 'number',
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      width: 150,
      type: 'date',
      valueFormatter: (params) => {
        // Format date nicely
        if (!params) return '';
        return new Date(params).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 250,
    },
  ];

  /**
   * Handle row click - navigate to project detail page
   */
  const handleRowClick = (params: GridRowParams<TProject>) => {
    router.push(`/projects/${params.row.name}`);
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={projects}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
          sorting: {
            sortModel: [{ field: 'updatedAt', sort: 'desc' }], // Default sort by recent
          },
        }}
        disableRowSelectionOnClick
        sx={{
          // Custom styling
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
          // Mobile responsiveness
          '@media (max-width: 600px)': {
            '& .MuiDataGrid-columnHeader': {
              fontSize: '0.75rem',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.75rem',
            },
          },
        }}
      />
    </Box>
  );
}