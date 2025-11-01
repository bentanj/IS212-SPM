// src/app/reportgeneration/components/LoadingIndicator.tsx
import React from 'react';
import { Alert, CircularProgress, Box } from '@mui/material';

interface LoadingIndicatorProps {
  selectedReport: string | null;
  exportType: 'pdf' | 'excel' | null;
  isLoading: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  selectedReport,
  exportType,
  isLoading,
}) => {
  if (!selectedReport || !exportType) {
    return null;
  }

  return (
    <Alert
      severity="info"
      icon={<CircularProgress size={20} />}
      sx={{ mb: 3 }}
    >
      <Box component="span">
        {isLoading
          ? 'Loading data from backend...'
          : `Exporting to ${exportType === 'pdf' ? 'PDF' : 'Excel'}... This may take a few moments.`}
      </Box>
    </Alert>
  );
};
