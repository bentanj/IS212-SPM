// src/app/reportgeneration/components/ReportHeader.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const ReportHeader: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2.125rem' },
        }}
      >
        Reports Dashboard
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 1,
          opacity: 0.95,
          fontSize: { xs: '0.938rem', sm: '1rem' },
        }}
      >
      </Typography>
      <Typography
        variant="body2"
        sx={{
          opacity: 0.9,
          maxWidth: '800px',
          fontSize: { xs: '0.875rem', sm: '0.938rem' },
        }}
      >
        Generate comprehensive reports and analytics to gain insights into task management,
        team performance, and organizational productivity.
      </Typography>
    </Paper>
  );
};
