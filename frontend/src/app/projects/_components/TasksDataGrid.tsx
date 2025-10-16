'use client';

import React from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { Task } from '@/mocks/staff/taskMockData';
import dayjs from 'dayjs';
import Priority from '@/types/TPriority';
import { getStatusColor, getPriorityColor } from '../../calendar/_functions/TaskRenderingFunctions';

interface TasksDataGridProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick: (task: Task) => void;  // Callback when row is clicked
}

/**
 * DataGrid for displaying tasks
 * Used inside ProjectDetailModal
 * Click a row to open TaskDetailModal
 */
export function TasksDataGrid({ tasks, loading = false, onTaskClick }: TasksDataGridProps) {
  
  /**
   * Column definitions based on Task structure
   */
  const columns: GridColDef<Task>[] = [
    {
      field: 'title',
      headerName: 'Task Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        // Show subtask indicator
        const isSubtask = !!params.row.parentTaskId;
        return (
          <Box>
            {isSubtask && <span style={{ marginRight: 4 }}>└</span>}
            {params.value}
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        // Adjust colors based on your status values
        const statusColors: Record<string, any> = {
          'Not Started': 'default',
          'In Progress': 'primary',
          'Completed': 'success',
          'Blocked': 'error',
        };

        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            variant="outlined"
            size="small"
          />
        );
      },
    },

    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      type: 'number',
      align: 'center',        
      headerAlign: 'center',
      renderCell: (params) => {
        const priority = params.value as Priority;

        const getPriorityTextColor = (p: Priority) => {
          if (typeof p !== 'number') return '#3f3f3f';
          if (p >= 7) return '#f44336';
          if (p >= 4) return '#ff9800';
          return '#2196f3';
        };

        return (
          // This new outer Box fills the cell and centers the circle
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* This is your original circle component */}
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                color: getPriorityTextColor(priority),
                fontWeight: 'bold',
                fontSize: '0.75rem',
              }}
            >
              {priority}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'assignedUsers',
      headerName: 'Assignees',
      width: 150,
      renderCell: (params) => {
        const users = params.value || [];
        if (users.length === 0) return '-';
        if (users.length === 1) return users[0].name;
        return `${users[0].name} +${users.length - 1}`;
      },
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 130,
      valueFormatter: (value) => {
        if (!value) return '';
        return dayjs(value).format('MMM DD, YYYY');
      },
    },
  ];

  /**
   * Handle row click
   */
  const handleRowClick = (params: GridRowParams<Task>) => {
    onTaskClick(params.row);
  };

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={tasks}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        getRowId={(row) => row.taskId}
        pageSizeOptions={[5, 10, 25]}
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