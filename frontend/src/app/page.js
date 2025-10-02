'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
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
            Welcome to SPM Project
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Software Project Management System
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>
                Get Started
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                This is the main landing page for the SPM project. 
                You can access the OAuth 2.0 authentication demo or explore other features.
              </Typography>
              
              <Box mt={4} display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/auth')}
                >
                  OAuth 2.0 Demo
                </Button>
                
                {isAuthenticated && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/auth')}
                  >
                    View Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Built with Next.js frontend and Flask backend microservices.
            <br />
            Features OAuth 2.0 authentication with Google.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
