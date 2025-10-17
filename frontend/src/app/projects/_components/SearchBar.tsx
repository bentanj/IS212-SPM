// src/app/projects/_components/SearchBar.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  debounceMs = 300 
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

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
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
              <ClearIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ 
        maxWidth: 500,
        '& .MuiOutlinedInput-root': {
          bgcolor: 'background.paper',
          fontSize: '0.875rem',
        }
      }}
    />
  );
}