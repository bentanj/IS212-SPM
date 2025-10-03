'use client';

import React from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface LoginButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

export default function LoginButton({ 
  variant = 'contained', 
  size = 'medium', 
  fullWidth = false,
  className 
}: LoginButtonProps) {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async () => {
    clearError();
    await login();
  };

  return (
    <div className={className}>
      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleLogin}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
        sx={{
          backgroundColor: variant === 'contained' ? '#4285f4' : undefined,
          color: variant === 'contained' ? 'white' : '#4285f4',
          '&:hover': {
            backgroundColor: variant === 'contained' ? '#3367d6' : 'rgba(66, 133, 244, 0.04)',
          },
          '&:disabled': {
            backgroundColor: variant === 'contained' ? 'rgba(0, 0, 0, 0.12)' : undefined,
            color: 'rgba(0, 0, 0, 0.26)',
          },
        }}
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </div>
  );
}
