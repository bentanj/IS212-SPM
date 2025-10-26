; 'use client';

import React from 'react';
import { Autocomplete, TextField, Chip, Box, Typography } from '@mui/material';
import { Task } from '@/types';
import { getPriorityColor, getStatusColor } from '@/utils/TaskRenderingFunctions';

interface ParentTaskFieldProps {
  parentTask: Task | null;
  availableParentTasks: Task[];
  onChange: (task: Task | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const ParentTaskField: React.FC<ParentTaskFieldProps> = ({
  parentTask,
  availableParentTasks,
  onChange,
  error = false,
  helperText = '',
  disabled = false,
}) => {

  return (
    <Box sx={{ mt: 2 }}>
      <Autocomplete
        options={availableParentTasks}
        getOptionLabel={(option) => `${option.title} (ID: ${option.taskId})`}
        value={parentTask}
        onChange={(event, newValue) => onChange(newValue)}
        disabled={disabled}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box component="li" key={key} {...otherProps}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ID: {option.taskId}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={option.priority}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(option.priority) + '20',
                      color: getPriorityColor(option.priority),
                      fontSize: '0.7rem',
                      height: '20px'
                    }}
                  />
                  <Chip
                    label={option.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(option.status) + '20',
                      color: getStatusColor(option.status),
                      fontSize: '0.7rem',
                      height: '20px'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {option.project_name}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Parent Task (Optional)"
            placeholder="Search for a parent task..."
            error={error}
            helperText={helperText || "Select a parent task to create this as a subtask"}
            fullWidth
          />
        )}
        renderValue={(selected) => {
          if (!selected) return null;
          return (
            <Chip
              variant="outlined"
              label={`${selected.title} (ID: ${selected.taskId})`}
              sx={{
                maxWidth: '300px',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
            />
          );
        }}
        isOptionEqualToValue={(option, value) => option.taskId === value.taskId}
        filterOptions={(options, { inputValue }) => {
          return options.filter(option =>
            option.title.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.taskId.toString().includes(inputValue) ||
            option.project_name.toLowerCase().includes(inputValue.toLowerCase())
          );
        }}
      />
    </Box>
  );
};