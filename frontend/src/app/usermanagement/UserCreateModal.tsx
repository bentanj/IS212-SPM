'use client';

import React, { useState, memo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface UserCreateModalProps {
  open: boolean;
  formData: {
    name: string;
    email: string;
    role: 'Staff' | 'Manager' | 'Admin';
    department: string;
  };
  departments: string[];
  onClose: () => void;
  onCreate: () => void;
  onFormDataChange: (field: string, value: string) => void;
  onAddDepartment: (newDepartment: string) => void;
}

const UserCreateModal = memo(function UserCreateModal({
  open,
  formData,
  departments,
  onClose,
  onCreate,
  onFormDataChange,
  onAddDepartment
}: UserCreateModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [nameError, setNameError] = useState('');

  const handleFieldChange = (field: string) => (event: any) => {
    const value = event.target.value;
    
    // Special validation for name field
    if (field === 'name') {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (value && !nameRegex.test(value)) {
        setNameError('Name can only contain letters and spaces');
        return; // Don't update the field if validation fails
      } else {
        setNameError('');
      }
    }
    
    onFormDataChange(field, value);
  };

  const handleDepartmentChange = (event: any) => {
    const value = event.target.value;
    if (value === 'ADD_NEW') {
      setShowNewDepartment(true);
    } else {
      onFormDataChange('department', value);
    }
  };

  const handleAddNewDepartment = () => {
    if (newDepartment.trim()) {
      onAddDepartment(newDepartment.trim());
      onFormDataChange('department', newDepartment.trim());
      setNewDepartment('');
      setShowNewDepartment(false);
    }
  };

  const handleCancelNewDepartment = () => {
    setNewDepartment('');
    setShowNewDepartment(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
        Add New User
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1.5, sm: 2 }, 
          pt: 1 
        }}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={handleFieldChange('name')}
            required
            fullWidth
            size={isMobile ? "small" : "medium"}
            placeholder="Enter full name (letters only)"
            error={!!nameError}
            helperText={nameError || 'Only letters and spaces are allowed'}
          />
          
          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleFieldChange('email')}
            required
            fullWidth
            size={isMobile ? "small" : "medium"}
            placeholder="Enter email address"
          />

          <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={handleFieldChange('role')}
            >
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={handleDepartmentChange}
            >
              <MenuItem value="" disabled>
                Select a department
              </MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
              <MenuItem 
                value="ADD_NEW" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                  borderTop: '1px solid #e0e0e0',
                  mt: 1,
                  pt: 1
                }}
              >
                <AddIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Add New Department
              </MenuItem>
            </Select>
          </FormControl>

          {showNewDepartment && (
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 2, 
              backgroundColor: '#f9f9f9' 
            }}>
              <TextField
                label="New Department Name"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter new department name"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={handleCancelNewDepartment}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAddNewDepartment}
                  disabled={!newDepartment.trim()}
                >
                  Add Department
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Button 
          onClick={onClose}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onCreate} 
          variant="contained"
          disabled={!!nameError || !formData.name}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Create User
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default UserCreateModal;
