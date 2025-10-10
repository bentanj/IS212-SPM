'use client';

import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * Props for SearchBar component
 */
interface SearchBarProps {
  value: string;                    // Current search value
  onChange: (value: string) => void; // Callback when search changes
  placeholder?: string;             // Placeholder text
  debounceMs?: number;              // Delay before triggering onChange (default 300ms)
}

/**
 * Reusable search bar component with debouncing
 * 
 * Debouncing means it waits for user to stop typing before triggering search
 * This prevents searching on every single keystroke (better performance)
 * 
 * Usage:
 * <SearchBar 
 *   value={searchTerm} 
 *   onChange={setSearchTerm}
 *   placeholder="Search projects..."
 * />
 */
export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  debounceMs = 300 
}: SearchBarProps) {
  // Local state for the input (updates immediately)
  const [localValue, setLocalValue] = useState(value);

  // Debounce effect: wait for user to stop typing
  useEffect(() => {
    // Set a timer
    const timer = setTimeout(() => {
      onChange(localValue); // Call parent's onChange after delay
    }, debounceMs);

    // Clear timer if user types again before delay finishes
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Clear search
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <TextField
      fullWidth
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: localValue && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              edge="end"
              aria-label="clear search"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ maxWidth: 400 }}
    />
  );
}