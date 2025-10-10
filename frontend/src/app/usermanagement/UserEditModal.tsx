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
  FormHelperText
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { User } from '@/mocks/staff/taskMockData';

interface ExtendedUser extends User {
  // Removed status and lastLogin properties
}

interface UserEditModalProps {
  open: boolean;
  selectedUser: ExtendedUser;
  formData: {
    name: string;
    email: string;
    role: 'Staff' | 'Manager' | 'Admin';
    department: string;
  };
  departments: string[];
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (field: string, value: string) => void;
  onAddDepartment: (newDepartment: string) => void;
}

const UserEditModal = memo(function UserEditModal({
  open,
  selectedUser,
  formData,
  departments,
  onClose,
  onSave,
  onFormDataChange,
  onAddDepartment
}: UserEditModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    department: false
  });

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'department':
        if (!value.trim()) return 'Department is required';
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string) => (event: any) => {
    const value = event.target.value;
    onFormDataChange(field, value);
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleDepartmentChange = (event: any) => {
    const value = event.target.value;
    if (value === 'ADD_NEW') {
      setShowNewDepartment(true);
    } else {
      onFormDataChange('department', value);
      // Clear department error
      if (errors.department) {
        setErrors(prev => ({ ...prev, department: '' }));
      }
    }
  };

  const handleAddNewDepartment = () => {
    if (newDepartment.trim()) {
      onAddDepartment(newDepartment.trim());
      onFormDataChange('department', newDepartment.trim());
      setNewDepartment('');
      setShowNewDepartment(false);
      // Clear department error
      setErrors(prev => ({ ...prev, department: '' }));
    }
  };

  const handleCancelNewDepartment = () => {
    setNewDepartment('');
    setShowNewDepartment(false);
  };

  const handleSave = () => {
    // Validate all fields and show errors
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const departmentError = validateField('department', formData.department);
    
    setErrors({
      name: nameError,
      email: emailError,
      department: departmentError
    });

    setTouched({
      name: true,
      email: true,
      department: true
    });

    // If no errors, proceed with saving
    if (!nameError && !emailError && !departmentError) {
      onSave();
      // Reset form state
      setErrors({ name: '', email: '', department: '' });
      setTouched({ name: false, email: false, department: false });
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setErrors({ name: '', email: '', department: '' });
    setTouched({ name: false, email: false, department: false });
    setShowNewDepartment(false);
    setNewDepartment('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
        Edit User
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
            onBlur={handleFieldBlur('name')}
            required
            fullWidth
            size={isMobile ? "small" : "medium"}
            error={touched.name && !!errors.name}
            helperText={touched.name ? errors.name || 'Only letters and spaces are allowed' : 'Only letters and spaces are allowed'}
          />
          
          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleFieldChange('email')}
            onBlur={handleFieldBlur('email')}
            required
            fullWidth
            size={isMobile ? "small" : "medium"}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
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

          <FormControl 
            fullWidth 
            required 
            size={isMobile ? "small" : "medium"}
            error={touched.department && !!errors.department}
          >
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={handleDepartmentChange}
              onBlur={handleFieldBlur('department')}
            >
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
            {touched.department && errors.department && (
              <FormHelperText>{errors.department}</FormHelperText>
            )}
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
          onClick={handleClose}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Update User
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default UserEditModal;
