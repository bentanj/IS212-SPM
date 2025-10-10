'use client';

import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Box,
  Chip
} from '@mui/material';
import { TProjectStatus } from '@/types/TProject';

/**
 * Props for FilterControls component
 */
interface FilterControlsProps {
  status: TProjectStatus;                    // Current status filter
  onStatusChange: (status: TProjectStatus) => void; // Callback when status changes
}

/**
 * Reusable filter controls component
 * Currently just has status filter, but easy to add more filters later
 * 
 * Usage:
 * <FilterControls 
 *   status={statusFilter}
 *   onStatusChange={setStatusFilter}
 * />
 */
export function FilterControls({ status, onStatusChange }: FilterControlsProps) {
  // Count active filters (for showing badge)
  const activeFilterCount = status !== 'all' ? 1 : 0;

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {/* Status Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={(e) => onStatusChange(e.target.value as TProjectStatus)}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="on-hold">On Hold</MenuItem>
        </Select>
      </FormControl>

      {/* Show active filter count */}
      {activeFilterCount > 0 && (
        <Chip 
          label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          size="small"
          onDelete={() => onStatusChange('all')}
          color="primary"
          variant="outlined"
        />
      )}
      
      {/* TODO: Add more filters here later (date range, assignee, etc.) */}
    </Box>
  );
}