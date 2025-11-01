// src/app/reportgeneration/components/ReportTypeSelector.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { People, TrendingUp } from '@mui/icons-material';

interface ReportTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: 'per-user' | 'per-project') => void;
}

export const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({
  open,
  onClose,
  onSelectType,
}) => {
  const reportSubTypes = [
    {
      id: 'per-user',
      title: 'Per User Report',
      description: 'Team productivity analysis with individual performance metrics',
      icon: <People sx={{ fontSize: 32, color: 'primary.main' }} />,
    },
    {
      id: 'per-project',
      title: 'Per Project Report',
      description: 'Project performance analytics with task distribution',
      icon: <TrendingUp sx={{ fontSize: 32, color: 'success.main' }} />,
    },
  ];

  const handleSelect = (type: 'per-user' | 'per-project') => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Select Report Type
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Choose the type of Task Completion Report you want to generate
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <List sx={{ p: 0 }}>
          {reportSubTypes.map((subType) => (
            <ListItem key={subType.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleSelect(subType.id as 'per-user' | 'per-project')}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                  py: 2,
                }}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                    }}
                  >
                    {subType.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={subType.title}
                  secondary={subType.description}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
