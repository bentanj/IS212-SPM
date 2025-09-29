'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Typography,
  Paper,
  Toolbar,
  InputAdornment,
  useTheme,
  useMediaQuery,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbar,
  GridActionsCellItem,
  useGridApiContext,
  useGridSelector,
  gridPageCountSelector,
  gridPageSelector,
  gridPageSizeSelector,
  GridFooterContainer
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { allUsers, User, taskMockData } from '@/mocks/staff/taskMockData';
import UserEditModal from './UserEditModal';
import UserCreateModal from './UserCreateModal';

interface ExtendedUser extends User {
}

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom Pagination Component
function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const rowCount = apiRef.current.state.rows.totalRowCount;

  const handleFirstPage = () => apiRef.current.setPage(0);
  const handlePreviousPage = () => apiRef.current.setPage(page - 1);
  const handleNextPage = () => apiRef.current.setPage(page + 1);
  const handleLastPage = () => apiRef.current.setPage(pageCount - 1);

  return (
    <GridFooterContainer>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          px: 2,
          py: 1
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Rows per page: {pageSize}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, rowCount)} of {rowCount}
          </Typography>
          
          <Tooltip title="First page">
            <span>
              <IconButton
                onClick={handleFirstPage}
                disabled={page === 0}
                size="small"
              >
                <FirstPageIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Previous page">
            <span>
              <IconButton
                onClick={handlePreviousPage}
                disabled={page === 0}
                size="small"
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Next page">
            <span>
              <IconButton
                onClick={handleNextPage}
                disabled={page >= pageCount - 1}
                size="small"
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Last page">
            <span>
              <IconButton
                onClick={handleLastPage}
                disabled={page >= pageCount - 1}
                size="small"
              >
                <LastPageIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </GridFooterContainer>
  );
}

export default function UserManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    role: 'Staff' as 'Staff' | 'Manager' | 'Admin',
    department: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'Staff' as 'Staff' | 'Manager' | 'Admin',
    department: ''
  });

  // Debounce search term to reduce filtering frequency
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize users and departments
  useEffect(() => {
    const extendedUsers: ExtendedUser[] = allUsers.map(user => ({
      ...user
    }));
    setUsers(extendedUsers);
    setDepartments([...new Set(allUsers.map(user => user.department))]);
  }, []);

  const roles = useMemo(() => ['Staff', 'Manager', 'Admin'], []);

  // Memoized filtered users with debounced search
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = debouncedSearchTerm === '' || 
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesDepartment = !departmentFilter || user.department === departmentFilter;
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      return matchesSearch && matchesDepartment && matchesRole;
    });
  }, [users, debouncedSearchTerm, departmentFilter, roleFilter]);

  // Add Department Handler
  const handleAddDepartment = useCallback((newDepartment: string) => {
    if (!departments.includes(newDepartment)) {
      setDepartments(prev => [...prev, newDepartment]);
      setSnackbar({ 
        open: true, 
        message: `Department "${newDepartment}" added successfully`, 
        severity: 'success' 
      });
    }
  }, [departments]);

  // Validate name function
  const validateName = useCallback((name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  }, []);

  // Create User Functions
  const handleOpenCreateDialog = useCallback(() => {
    setCreateFormData({
      name: '',
      email: '',
      role: 'Staff',
      department: ''
    });
    setOpenCreateDialog(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setOpenCreateDialog(false);
  }, []);

  const handleCreateFormDataChange = useCallback((field: string, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCreateUser = useCallback(() => {
    if (!createFormData.name || !createFormData.email || !createFormData.department) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    // Validate name
    if (!validateName(createFormData.name)) {
      setSnackbar({ open: true, message: 'Name can only contain letters and spaces', severity: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createFormData.email)) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }

    // Check for duplicate email
    const emailExists = users.some(user => user.email.toLowerCase() === createFormData.email.toLowerCase());
    if (emailExists) {
      setSnackbar({ open: true, message: 'A user with this email address already exists', severity: 'error' });
      return;
    }

    const newUser: ExtendedUser = {
      userId: Math.max(...users.map(u => u.userId)) + 1,
      ...createFormData
    };
    setUsers(prev => [...prev, newUser]);
    setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
    handleCloseCreateDialog();
  }, [createFormData, users, validateName, handleCloseCreateDialog]);

  // Edit User Functions
  const handleOpenEditDialog = useCallback((user: ExtendedUser) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
    setOpenEditDialog(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  }, []);

  const handleEditFormDataChange = useCallback((field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveUser = useCallback(() => {
    if (!editFormData.name || !editFormData.email || !editFormData.department) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    // Validate name
    if (!validateName(editFormData.name)) {
      setSnackbar({ open: true, message: 'Name can only contain letters and spaces', severity: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }

    // Check for duplicate email (excluding current user)
    const emailExists = users.some(user => 
      user.userId !== selectedUser?.userId && 
      user.email.toLowerCase() === editFormData.email.toLowerCase()
    );
    if (emailExists) {
      setSnackbar({ open: true, message: 'A user with this email address already exists', severity: 'error' });
      return;
    }

    if (selectedUser) {
      setUsers(prev => prev.map(user =>
        user.userId === selectedUser.userId
          ? { ...user, ...editFormData }
          : user
      ));
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
    }

    handleCloseEditDialog();
  }, [editFormData, users, selectedUser, validateName, handleCloseEditDialog]);

  const getRoleColor = useCallback((role: string): "primary" | "secondary" | "error" => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Manager': return 'secondary';
      case 'Staff': return 'primary';
      default: return 'primary';
    }
  }, []);

  const getColumnWidth = useCallback((baseWidth: number) => {
    if (isMobile) return Math.max(120, baseWidth * 0.8);
    if (isTablet) return Math.max(150, baseWidth * 0.9);
    return baseWidth;
  }, [isMobile, isTablet]);

  // Memoized column definitions to prevent recreating on each render
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Name',
      width: getColumnWidth(200),
      resizable: false,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: '100%',
          height: '100%',
          pl: 1
        }}>
          <Box
            sx={{
              width: { xs: 24, sm: 32 },
              height: { xs: 24, sm: 32 },
              borderRadius: '50%',
              backgroundColor: '#1976d2',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: { xs: '10px', sm: '14px' },
              fontWeight: 'bold',
              flexShrink: 0,
              minWidth: { xs: 24, sm: 32 },
              maxWidth: { xs: 24, sm: 32 }
            }}
          >
            {params.value.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: getColumnWidth(250),
      resizable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Typography 
            variant="body2"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: getColumnWidth(120),
      resizable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Chip
            label={params.value}
            color={getRoleColor(params.value)}
            size="small"
            variant="outlined"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
          />
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: getColumnWidth(180),
      resizable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <Typography 
            variant="body2"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: getColumnWidth(80),
      resizable: false,
      headerAlign: 'center',
      align: 'center',
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
          onClick={() => handleOpenEditDialog(params.row)}
          label="Edit"
        />
      ],
    },
  ], [getColumnWidth, getRoleColor, handleOpenEditDialog]);

  // Memoized rows to prevent recreation on each render
  const rows: GridRowsProp = useMemo(() => 
    filteredUsers.map(user => ({
      id: user.userId,
      ...user,
    })), [filteredUsers]);

  // Memoized clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setDepartmentFilter('');
    setRoleFilter('');
  }, []);

  // Memoized snackbar close handler
  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5'
    }}>
      <Paper sx={{ 
        height: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 32px)', md: 'calc(100vh - 48px)' },
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <Toolbar sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          py: { xs: 1, sm: 2 }
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h1" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            User Management
          </Typography>
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ 
                borderRadius: 2,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Add User
            </Button>
          )}
        </Toolbar>

        <Box sx={{ 
          p: { xs: 1, sm: 2 }, 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          alignItems: 'center', 
          flexWrap: 'wrap' 
        }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { xs: '100%', sm: 200, md: 250 },
              mb: { xs: 1, sm: 0 }
            }}
          />

          <FormControl 
            size="small" 
            sx={{ 
              minWidth: { xs: '48%', sm: 120, md: 150 },
              mb: { xs: 1, sm: 0 }
            }}
          >
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl 
            size="small" 
            sx={{ 
              minWidth: { xs: '48%', sm: 100, md: 120 },
              mb: { xs: 1, sm: 0 }
            }}
          >
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              {roles.map(role => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ 
                borderRadius: 2,
                fontSize: '0.8rem',
                width: '100%',
                mb: 1
              }}
            >
              Add User
            </Button>
          )}

          {(searchTerm || departmentFilter || roleFilter) && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2 }, 
          pt: 0,
          overflow: 'hidden'
        }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            disableColumnResize={true}
            disableColumnMenu={true}
            slots={{
              toolbar: GridToolbar,
              footer: CustomPagination,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
              },
            }}
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
              },
              '& .MuiDataGrid-cell[data-field="name"]': {
                justifyContent: 'flex-start',
                paddingLeft: '16px',
              },
              '& .MuiDataGrid-cell:not([data-field="name"])': {
                justifyContent: 'center',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#fafafa',
                color: '#333',
                fontSize: { xs: '0.75rem', sm: '14px' },
                fontWeight: 600,
              },
              '& .MuiDataGrid-columnHeader': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                }
              },
              '& .MuiDataGrid-columnHeader[data-field="name"]': {
                justifyContent: 'center',
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: 'white',
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: '#fafafa',
                borderTop: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-toolbarContainer': {
                padding: { xs: '8px', sm: '16px' },
                '& .MuiButton-root': {
                  fontSize: { xs: '0.7rem', sm: '0.875rem' }
                }
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 },
              },
            }}
            pageSizeOptions={isMobile ? [5, 10] : [10, 25, 50]}
          />
        </Box>
      </Paper>

      <UserCreateModal
        open={openCreateDialog}
        formData={createFormData}
        departments={departments}
        onClose={handleCloseCreateDialog}
        onCreate={handleCreateUser}
        onFormDataChange={handleCreateFormDataChange}
        onAddDepartment={handleAddDepartment}
      />

      {selectedUser && (
        <UserEditModal
          open={openEditDialog}
          selectedUser={selectedUser}
          formData={editFormData}
          departments={departments}
          onClose={handleCloseEditDialog}
          onSave={handleSaveUser}
          onFormDataChange={handleEditFormDataChange}
          onAddDepartment={handleAddDepartment}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
