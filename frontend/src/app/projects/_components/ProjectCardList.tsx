'use client';

import React from 'react';
import { Box, Card, CardActionArea, CardContent, Typography, Chip, Stack } from '@mui/material';
import { TProject } from '@/types/TProject';

interface ProjectCardListProps {
  projects: TProject[];
  onProjectClick: (project: TProject) => void;
}

// A single card representing one project
function ProjectCard({ project, onProjectClick }: { project: TProject; onProjectClick: (project: TProject) => void; }) {
  
  const status = project.status;
  let chipColor: 'info' | 'success' | 'warning' | 'default' = 'default';
  if (status === 'active') chipColor = 'info';
  if (status === 'completed') chipColor = 'success';
  if (status === 'on-hold') chipColor = 'warning';

  return (
    <Card sx={{ mb: 2 }} elevation={1}>
      <CardActionArea onClick={() => onProjectClick(project)}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 500 }}>
              {project.name}
            </Typography>
            <Chip 
              label={status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} 
              color={chipColor} 
              size="small" 
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
            {project.description}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="caption" color="text.secondary">
              Tasks: {project.taskCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated: {new Date(project.updatedAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

// The component that maps over the projects and renders the cards
export function ProjectCardList({ projects, onProjectClick }: ProjectCardListProps) {
  return (
    <Box>
      {projects.map(project => (
        <ProjectCard 
          key={project.name} 
          project={project} 
          onProjectClick={onProjectClick} 
        />
      ))}
    </Box>
  );
}