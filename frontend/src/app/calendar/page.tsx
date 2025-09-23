'use client';

import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';

// Disable SSR for the TaskCalendar component
const TaskCalendar = dynamic(() => import('./TaskCalendar'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography>Loading Calendar...</Typography>
    </Box>
  ),
});

export default function CalendarPage() {
  return <TaskCalendar />;
}
