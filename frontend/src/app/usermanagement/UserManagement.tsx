"use client";

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  InputAdornment,
  Toolbar,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { userMockData, User } from '@/mocks/staff/taskMockData';

const UserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return userMockData.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === '' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter]);

  // Generate mock data for last active and date added
  const getUserData = (user: User) => ({
    ...user,
    lastActive: new Date(2024, 2, Math.floor(Math.random() * 8) + 1).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    dateAdded: new Date(2022, 6, 4).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    })
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    handleFilterClose();
  };

  const getAccessLevel = (role: string) => {
    switch (role) {
      case 'Admin':
        return { label: 'Admin', color: 'primary' as const };
      case 'Manager':
        return { label: 'Admin', color: 'primary' as const }; // Managers shown as Admin in the design
      default:
        return { label: 'Data Export', color: 'default' as const };
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'User name',
      width: 300,
      renderCell: (params) => {
        const user = params.row as User;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.400' }}>
              {getInitials(user.name)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        );
      },
      sortable: false,
    },
    {
      field: 'access',
      headerName: 'Access',
      width: 200,
      renderCell: (params) => {
        const user = params.row as User;
        const access = getAccessLevel(user.role);
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={access.label} 
              color={access.color}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
            {user.role === 'Staff' && (
              <>
                <Chip 
                  label="Data Import" 
                  color="secondary" 
                  size="small"
                  sx={{ fontSize: '0.75rem' }}
                />
              </>
            )}
          </Box>
        );
      },
      sortable: false,
    },
    {
      field: 'lastActive',
      headerName: 'Last active',
      width: 140,
      renderCell: (params) => {
        const userData = getUserData(params.row as User);
        return (
          <Typography variant="body2">
            {userData.lastActive}
          </Typography>
        );
      },
    },
    {
      field: 'dateAdded',
      headerName: 'Date added',
      width: 140,
      renderCell: (params) => {
        const userData = getUserData(params.row as User);
        return (
          <Typography variant="body2">
            {userData.dateAdded}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 60,
      getActions: (params) => [
        <GridActionsCellItem
          key="menu"
          icon={<MoreVertIcon />}
          label="More actions"
          onClick={(event) => handleMenuClick(event, params.row as User)}
        />,
      ],
    },
  ];

  return (
    <Container maxWidth={false} sx={{ mt: 3, px: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500, mb: 1 }}>
          User management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your team members and their account permissions here.
        </Typography>
      </Box>

      {/* Toolbar */}
      <Paper elevation={0} sx={{ mb: 3 }}>
        <Toolbar sx={{ px: 0, justifyContent: 'space-between', minHeight: '64px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="div">
              All users <Chip label={filteredUsers.length} size="small" sx={{ ml: 1 }} />
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 240 }}
            />
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
            >
              Filters
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: 'black', '&:hover': { bgcolor: 'grey.800' } }}
            >
              Add user
            </Button>
          </Box>
        </Toolbar>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={0} sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          getRowId={(row) => row.userId}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          disableColumnMenu
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'grey.50',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>View profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit permissions</MenuItem>
        <MenuItem onClick={handleMenuClose}>Deactivate user</MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleRoleFilter('')}>All Roles</MenuItem>
        <MenuItem onClick={() => handleRoleFilter('Admin')}>Admin</MenuItem>
        <MenuItem onClick={() => handleRoleFilter('Manager')}>Manager</MenuItem>
        <MenuItem onClick={() => handleRoleFilter('Staff')}>Staff</MenuItem>
      </Menu>
    </Container>
  );
};

export default UserManagementPage;
