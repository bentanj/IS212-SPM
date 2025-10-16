// src/app/projects/_components/ProjectsDataGrid.tsx

'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { TProject } from '@/types/TProject';

interface ProjectsDataGridProps {
  projects: TProject[];
  loading?: boolean;
  onProjectClick: (project: TProject) => void;
}

/**
 * DataGrid for displaying list of projects
 * Styled to match calendar aesthetic
 */
export function ProjectsDataGrid({ projects, loading = false, onProjectClick }: ProjectsDataGridProps) {
  
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
        const statusConfig = {
          active: { label: 'Active', color: '#2e7d32' },
          completed: { label: 'Completed', color: '#9e9e9e' },
          'on-hold': { label: 'On-Hold', color: '#ed6c02' },
        } as const;

        const config = statusConfig[params.value as keyof typeof statusConfig];

        return (
          <Chip
            label={config.label}
            size="small"
            sx={{ 
              bgcolor: config.color,
              color: 'white',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        );
      },
    },
    {
      field: 'taskCount',
      headerName: 'Tasks',
      width: 100,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
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
      flex: 2,
      minWidth: 300,
    },
  ];

  const handleRowClick = (params: GridRowParams<TProject>) => {
    onProjectClick(params.row);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={projects}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        getRowId={(row) => row.name}
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
        autoHeight
        sx={{
          border: 'none',
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'background.default',
            borderBottom: '2px solid',
            borderColor: 'divider',
            fontSize: '0.875rem',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          },
        }}
      />
    </Box>
  );
}