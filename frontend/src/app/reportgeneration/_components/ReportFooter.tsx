// src/app/reportgeneration/components/ReportFooter.tsx
import React from 'react';
import { Paper, Typography } from '@mui/material';

interface ReportFooterProps {
  totalTasks: number;
  uniqueProjects: number;
  uniqueDepartments: number;
  currentDate: string;
}

export const ReportFooter: React.FC<ReportFooterProps> = ({
  totalTasks,
  uniqueProjects,
  uniqueDepartments,
  currentDate,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
      <Typography variant="body2" color="text.secondary" align="center">
         All data is current as of {currentDate}.
      </Typography>
    </Paper>
  );
};
