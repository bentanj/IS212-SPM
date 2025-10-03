'use client';

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const { isAuthenticated, isLoading, error, checkAuthStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // The AuthContext will handle the OAuth callback automatically
    // This effect just monitors the state and redirects when ready
    
    if (isAuthenticated && !isLoading) {
      // Redirect to home page after successful authentication
      router.push('/');
    } else if (error && !isLoading) {
      // Stay on this page to show error, user can try again
      console.error('OAuth callback error:', error);
    }
  }, [isAuthenticated, isLoading, error, router]);

  const handleRetry = () => {
    // Clear any OAuth parameters and processing flags
    window.history.replaceState({}, document.title, '/auth');
    sessionStorage.removeItem('oauth_callback_processed');
    localStorage.removeItem('oauth_state');
    
    // Redirect to auth page to restart OAuth flow
    router.push('/auth');
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Completing sign in...
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Please wait while we verify your authentication with Google.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
        p={3}
      >
        <Alert severity="error" sx={{ maxWidth: 500, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Authentication Failed
          </Typography>
          <Typography variant="body2" gutterBottom>
            {error}
          </Typography>
        </Alert>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            onClick={handleRetry}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/')}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    );
  }

  if (isAuthenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Redirecting...
        </Typography>
      </Box>
    );
  }

  // Fallback state
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <Typography variant="h6" color="text.secondary">
        Processing authentication...
      </Typography>
    </Box>
  );
}
