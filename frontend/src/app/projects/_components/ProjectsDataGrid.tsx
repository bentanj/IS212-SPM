'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { TProject } from '@/types/TProject';

interface ProjectsDataGridProps {
  projects: TProject[];
  loading?: boolean;
  onProjectClick: (project: TProject) => void;  // Callback when row is clicked
}

/**
 * DataGrid for displaying list of projects
 * Click a row to open ProjectDetailModal
 */
export function ProjectsDataGrid({ projects, loading = false, onProjectClick }: ProjectsDataGridProps) {
  
  /**
   * Column definitions
   * Using 'name' as the id field since it's unique
   */
  const columns: GridColDef<TProject>[] = [
    {
      field: 'name',
      headerName: 'Project Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
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
      valueFormatter: (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('en-US', {
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
   * Handle row click - call parent's callback with project data
   */
  const handleRowClick = (params: GridRowParams<TProject>) => {
    onProjectClick(params.row);
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={projects}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        getRowId={(row) => row.name}  // Use name as unique ID
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
          sorting: {
            sortModel: [{ field: 'updatedAt', sort: 'desc' }],
          },
        }}
        disableRowSelectionOnClick
        sx={{
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