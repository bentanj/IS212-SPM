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

interface FilterControlsProps {
  status: TProjectStatus;
  onStatusChange: (status: TProjectStatus) => void;
}

/**
 * Reusable filter controls component
 */
export function FilterControls({ status, onStatusChange }: FilterControlsProps) {
  const activeFilterCount = status !== 'all' ? 1 : 0;

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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

      {/* Active filter indicator */}
      {activeFilterCount > 0 && (
        <Chip 
          label={`${activeFilterCount} filter active`}
          size="small"
          onDelete={() => onStatusChange('all')}
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  );
}