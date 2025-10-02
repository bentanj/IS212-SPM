'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Logout as LogoutIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className }: UserProfileProps) {
  const { user, logout, isLoading, error, clearError } = useAuth();

  const handleLogout = async () => {
    clearError();
    await logout();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              Not signed in
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
        
        <Box display="flex" flexDirection="column" gap={2}>
          {/* User Avatar and Basic Info */}
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56,
                backgroundColor: 'primary.main',
                fontSize: '1.5rem'
              }}
            >
              {user.first_name?.[0] || user.email[0].toUpperCase()}
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h6" component="div">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.first_name || 'User'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* User Status Chips */}
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label={user.role} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={user.is_verified ? 'Verified' : 'Unverified'} 
              size="small" 
              color={user.is_verified ? 'success' : 'warning'}
              variant="outlined"
            />
            <Chip 
              label={user.is_active ? 'Active' : 'Inactive'} 
              size="small" 
              color={user.is_active ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>

          {/* User Details */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Account Details
            </Typography>
            <Typography variant="body2" component="div">
              <strong>User ID:</strong> {user.id}
            </Typography>
            {user.created_at && (
              <Typography variant="body2" component="div">
                <strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            )}
            {user.last_login && (
              <Typography variant="body2" component="div">
                <strong>Last login:</strong> {new Date(user.last_login).toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Logout Button */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            disabled={isLoading}
            fullWidth
          >
            Sign Out
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
