// src/app/reportgeneration/components/ErrorNotification.tsx
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ErrorNotificationProps {
  error: string | null;
  showError: boolean;
  onClose: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  showError,
  onClose,
}) => {
  return (
    <Snackbar
      open={showError}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity="error"
        sx={{ width: '100%' }}
        icon={<ErrorOutline />}
      >
        {error}
      </Alert>
    </Snackbar>
  );
};
