'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';

/**
 * Props for TasksDataGrid
 */
interface TasksDataGridProps {
  tasks: any[];           // Array of tasks to display (TODO: type this properly after seeing your task structure)
  projectId: string;      // The project these tasks belong to
  loading?: boolean;      // Show loading state
}

/**
 * DataGrid component for displaying tasks
 * 
 * Features:
 * - Sortable columns
 * - Pagination
 * - Click row to navigate to task detail
 * - Status and priority badges
 * - Responsive
 * 
 * Usage:
 * <TasksDataGrid tasks={projectTasks} projectId={projectId} loading={isLoading} />
 */
export function TasksDataGrid({ tasks, projectId, loading = false }: TasksDataGridProps) {
  const router = useRouter();

  /**
   * Column definitions
   * NOTE: These are placeholder columns. Adjust based on your actual task structure
   */
  const columns: GridColDef[] = [
    {
      field: 'title',           // Adjust field name based on your task structure
      headerName: 'Task Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const statusColors: Record<string, any> = {
          'not-started': 'default',
          'in-progress': 'primary',
          'completed': 'success',
          'blocked': 'error',
        };

        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        );
      },
    },
    {
      field: 'priority',        // If your tasks have priority
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => {
        if (!params.value) return null;
        
        const priorityColors: Record<string, any> = {
          low: 'default',
          medium: 'warning',
          high: 'error',
        };

        return (
          <Chip
            label={params.value}
            color={priorityColors[params.value] || 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'assignee',        // Adjust based on your structure
      headerName: 'Assignee',
      width: 150,
    },
    {
      field: 'dueDate',         // Adjust based on your structure
      headerName: 'Due Date',
      width: 130,
      type: 'date',
      valueFormatter: (params) => {
        if (!params) return '';
        return new Date(params).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ];

  /**
   * Handle row click - navigate to task detail page
   */
  const handleRowClick = (params: GridRowParams) => {
    // Navigate to task detail page
    router.push(`/projects/${projectId}/tasks/${params.row.id}`);
    
    // OR: Open your existing modal instead
    // onTaskClick(params.row);
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={tasks}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
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
        }}
      />
    </Box>
  );
}