'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  Chip,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { Task } from '@/mocks/staff/taskMockData';
import dayjs, { Dayjs } from 'dayjs';

interface DayTasksModalProps {
  tasks: Task[];
  selectedDate: Dayjs | null;
  open: boolean;
  onClose: () => void;
  onTaskSelect: (task: Task) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return '#f44336';
    case 'Medium': return '#ff9800';
    case 'Low': return '#2196f3';
    default: return '#9e9e9e';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'In Progress': return 'primary';
    case 'Blocked': return 'error';
    case 'To Do': return 'default';
    default: return 'default';
  }
};

const DayTasksModal: React.FC<DayTasksModalProps> = ({ 
  tasks, 
  selectedDate, 
  open, 
  onClose, 
  onTaskSelect 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!selectedDate) return null;

  const handleTaskClick = (task: Task) => {
    onTaskSelect(task);
    onClose(); // Close the day tasks modal when a task is selected
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : 2,
          height: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? 'none' : '80vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant={isMobile ? 'h6' : 'h5'} 
          component="div"
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.5rem' },
            fontWeight: 600
          }}
        >
          Tasks for {selectedDate.format('MMMM D, YYYY')}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          component="div"
          sx={{ mt: 0.5 }}
        >
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} starting on this day
        </Typography>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          px: { xs: 1, sm: 2 },
          py: 0
        }}
      >
        <List disablePadding>
          {tasks.map((task, index) => (
            <ListItem 
              key={`task-${task.taskId}-${index}-${task.title.slice(0, 10)}`} // FIXED: Unique key combination
              disablePadding
            >
              <ListItemButton
                onClick={() => handleTaskClick(task)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  border: `1px solid ${getPriorityColor(task.priority)}20`,
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                  '&:hover': {
                    bgcolor: `${getPriorityColor(task.priority)}10`,
                  },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%'
                }}
              >
                {/* Task Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ 
                      fontWeight: 600,
                      mr: 2,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      flex: 1
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={task.priority} 
                      size="small"
                      sx={{ 
                        bgcolor: `${getPriorityColor(task.priority)}20`,
                        color: getPriorityColor(task.priority),
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip 
                      label={task.status} 
                      color={getStatusColor(task.status) as any}
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Stack>
                </Box>

                {/* Task Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  component="div"
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                >
                  {task.description}
                </Typography>

                {/* Task Footer */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    component="div"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Project: {task.projectName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    component="div"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Due: {dayjs(task.dueDate).format('MMM D')}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          pb: { xs: 2, sm: 2 },
          pt: { xs: 1, sm: 2 }
        }}
      >
        <Button 
          onClick={onClose} 
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DayTasksModal;
