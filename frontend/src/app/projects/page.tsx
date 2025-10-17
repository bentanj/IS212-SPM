'use client';

import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

// Dynamically import the UI component and disable SSR
const ProjectsUI = dynamic(
  () => import('./_components/ProjectsUI'),
  { 
    ssr: false, // The key to preventing hydration errors
    loading: () => (
      // Show a nice spinner while the client loads the component
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }
);

// The page now just renders the dynamically loaded component
export default function ProjectsPage() {
  return <ProjectsUI />;
}