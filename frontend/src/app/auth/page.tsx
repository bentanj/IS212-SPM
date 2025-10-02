'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/Auth/LoginButton';
import UserProfile from '@/components/Auth/UserProfile';

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            OAuth 2.0 Demo
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Next.js + Flask OAuth 2.0 Authentication System
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <Box textAlign="center">
                <Typography variant="h5" gutterBottom>
                  Welcome!
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Sign in with your Google account to get started.
                </Typography>
                <LoginButton 
                  variant="contained" 
                  size="large" 
                  fullWidth 
                  className="mt-4"
                />
              </Box>
            )}
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            This is a demonstration of OAuth 2.0 authentication with Google.
            <br />
            Built with Next.js frontend and Flask backend.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
