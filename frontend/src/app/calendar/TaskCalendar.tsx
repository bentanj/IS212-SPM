'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarToday,
  Add,
  Menu as MenuIcon
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);

import { taskMockData, Task } from '@/mocks/staff/taskMockData';
import TaskDetailModal from './TaskDetailModal';
import TaskCreateModal from './TaskCreateModal';
import DayTasksModal from './DayTasksModal';

const TaskCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create Tasks
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tasks, setTasks] = useState(taskMockData.tasks);
  
  // Task Day
  const [dayTasksModalOpen, setDayTasksModalOpen] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // BUSINESS LOGIC 1: Filter tasks assigned to current user only
  const assignedTasks = useMemo(() => {
    const { currentUser } = taskMockData;
    return tasks.filter(task =>
      task.assignedUsers.some(assignedUser => assignedUser.userId === currentUser.userId)
    );
  }, [tasks]); // Add tasks as dependency
  

  // BUSINESS LOGIC 2: Get tasks for current month by START DATE
  const monthTasks = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    
    return assignedTasks.filter(task => {
      const taskStartDate = dayjs(task.startDate); // Changed from dueDate to startDate
      return taskStartDate.isBetween(startOfMonth, endOfMonth, 'day', '[]');
    });
  }, [currentDate, assignedTasks]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startOfCalendar = startOfMonth.startOf('week');
    const endOfCalendar = endOfMonth.endOf('week');

    const days = [];
    let day = startOfCalendar;

    while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    return days;
  }, [currentDate]);

  // BUSINESS LOGIC 2: Get tasks for specific day by START DATE
  const getTasksForDay = (date: Dayjs) => {
    return monthTasks.filter(task => dayjs(task.startDate).isSame(date, 'day')); // Changed from dueDate to startDate
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#f44336';
      case 'Medium': return '#ff9800';
      case 'Low': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
    setCreateModalOpen(false);
  };

  const handleMoreTasksClick = (date: Dayjs, tasks: Task[]) => {
    setSelectedDate(date);
    setSelectedDayTasks(tasks);
    setDayTasksModalOpen(true);
  };

  const handleCloseDayTasksModal = () => {
    setDayTasksModalOpen(false);
    setSelectedDate(null);
    setSelectedDayTasks([]);
  };

  // Handle Task Updates
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => 
        task.taskId === updatedTask.taskId ? updatedTask : task
      )
    );
    setModalOpen(false);
  };

  const { currentUser } = taskMockData;

  // Create weeks array for better calendar rendering
  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeksArray.push(calendarDays.slice(i, i + 7));
    }
    return weeksArray;
  }, [calendarDays]);

  // Calculate fixed cell height based on available space and number of weeks
  const getCellHeight = () => {
    if (isMobile) return 80;
    if (isTablet) return 100;
    return 120; // Desktop
  };

  // Sidebar content component - Updated stats to reflect assigned tasks only
  const SidebarContent = () => (
    <Box sx={{ p: 3, width: isMobile ? '100%' : 280 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#9e9e9e', fontSize: '0.875rem', fontWeight: 500 }}>
        TASK MANAGER
      </Typography>
      
      {/* User Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
          {currentUser.name.split(' ').map(n => n[0]).join('')}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {currentUser.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentUser.systemRole}
          </Typography>
        </Box>
      </Box>

      {/* Stats - Updated to show only assigned tasks */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="success">
            {assignedTasks.filter(t => t.status === 'Completed').length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Completed
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="warning.main">
            {assignedTasks.filter(t => t.status === 'To Do').length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            To do
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {assignedTasks.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            My tasks
          </Typography>
        </Box>
      </Stack>

      {/* Projects Section - Updated to show only projects with assigned tasks */}
      <Typography variant="h6" sx={{ mb: 2, fontSize: '0.875rem', fontWeight: 500 }}>
        MY PROJECTS
      </Typography>
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        {Array.from(new Set(assignedTasks.map(t => t.projectName))).map((project, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 1 }} />
            <Typography variant="body2">{project}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Paper sx={{ 
          width: 280, 
          mr: 2, 
          height: '100vh',
          overflow: 'auto',
          flexShrink: 0
        }}>
          <SidebarContent />
        </Paper>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={toggleSidebar}
        sx={{ 
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 }
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0,
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'white', flexShrink: 0 }}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <TextField
              placeholder="Search my tasks..."
              variant="outlined"
              size="small"
              sx={{ 
                mr: 'auto',
                width: { xs: '150px', sm: '200px', md: '300px' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                mx: { xs: 1, sm: 2 },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              My Calendar
            </Typography>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateModalOpen(true)}
                size={isMobile ? 'small' : 'medium'}
              >
                {isMobile ? '+' : 'Add task'}
            </Button>
          </Toolbar>
        </AppBar>

        {/* Calendar Container */}
        <Box sx={{ 
          flex: 1, 
          p: { xs: 1, sm: 2 }, 
          minHeight: 0,
          overflow: 'hidden'
        }}>
          <Paper sx={{ 
            height: '100%',
            p: { xs: 1, sm: 2 }, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Month Navigation */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 2,
              flexShrink: 0
            }}>
              <IconButton onClick={() => navigateMonth('prev')}>
                <ChevronLeft />
              </IconButton>
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                sx={{ mx: 2, minWidth: { xs: 120, sm: 140 }, textAlign: 'center' }}
              >
                {currentDate.format(isMobile ? 'MMM YYYY' : 'MMMM YYYY')}
              </Typography>
              <IconButton onClick={() => navigateMonth('next')}>
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Day Headers */}
              <Stack 
                direction="row" 
                spacing={0.5} 
                sx={{ 
                  mb: 1,
                  flexShrink: 0,
                  height: { xs: 24, sm: 32 }
                }}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Box 
                    key={day} 
                    sx={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 0
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      {isMobile ? day.slice(0, 2) : day}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Calendar Body with Fixed Heights */}
              <Stack 
                spacing={0.5} 
                sx={{ 
                  flex: 1,
                  minHeight: 0
                }}
              >
                {weeks.map((week, weekIndex) => (
                  <Stack 
                    key={weekIndex} 
                    direction="row" 
                    spacing={0.5} 
                    sx={{ 
                      height: getCellHeight(),
                      flexShrink: 0
                    }}
                  >
                    {week.map((day) => {
                      const dayTasks = getTasksForDay(day);
                      const isCurrentMonth = day.isSame(currentDate, 'month');
                      const isToday = day.isSame(dayjs(), 'day');

                      return (
                        <Box 
                          key={day.toString()} 
                          sx={{ 
                            flex: 1, 
                            minWidth: 0,
                            height: '100%'
                          }}
                        >
                          <Paper
                            variant={isToday ? 'elevation' : 'outlined'}
                            sx={{
                              height: '100%',
                              p: { xs: 0.5, sm: 1 },
                              opacity: isCurrentMonth ? 1 : 0.3,
                              bgcolor: isToday ? 'primary.50' : 'white',
                              border: isToday ? '2px solid' : undefined,
                              borderColor: isToday ? 'primary.main' : undefined,
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'hidden',
                              minWidth: 0,
                              width: '100%',
                              cursor: isMobile && dayTasks.length > 0 ? 'pointer' : 'default'
                            }}
                            onClick={isMobile && dayTasks.length === 1 ? () => handleTaskClick(dayTasks[0]) : undefined}
                          >
                            <Typography 
                              variant="body2" 
                              fontWeight={isToday ? 'bold' : 'normal'}
                              color={isToday ? 'primary.main' : 'text.primary'}
                              sx={{ 
                                mb: { xs: 0.5, sm: 1 }, 
                                flexShrink: 0,
                                fontSize: { xs: '0.7rem', sm: '0.875rem' }
                              }}
                            >
                              {day.format('D')}
                            </Typography>
                            
                            <Box sx={{ 
                              flex: 1, 
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              minWidth: 0
                            }}>
                              {/* Only show tasks that fit within the cell */}
                              {dayTasks.slice(0, isMobile ? 1 : 2).map((task) => (
                                <Card 
                                  key={task.taskId} 
                                  sx={{ 
                                    mb: 0.5, 
                                    cursor: 'pointer',
                                    bgcolor: getPriorityColor(task.priority) + '20',
                                    borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                                    '&:hover': { 
                                      bgcolor: getPriorityColor(task.priority) + '30',
                                    },
                                    minHeight: 0,
                                    flexShrink: 0,
                                    height: { xs: '16px', sm: '20px' },
                                    minWidth: 0,
                                    width: '100%'
                                  }}
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <CardContent sx={{ 
                                    p: '2px 4px !important', 
                                    '&:last-child': { pb: '2px !important' },
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    minWidth: 0,
                                    width: '100%'
                                  }}>
                                    <Typography 
                                      variant="caption" 
                                      noWrap
                                      sx={{ 
                                        display: 'block', 
                                        lineHeight: 1,
                                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                        width: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {task.title}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              ))}
                              
                              {/* Show more indicator only if it fits - MAKE IT CLICKABLE */}
                              {dayTasks.length > (isMobile ? 1 : 2) && (
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: { xs: '0.55rem', sm: '0.65rem' },
                                    flexShrink: 0,
                                    lineHeight: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      color: 'primary.main',
                                      textDecoration: 'underline'
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent day cell click
                                    handleMoreTasksClick(day, dayTasks);
                                  }}
                                >
                                  +{dayTasks.length - (isMobile ? 1 : 2)} more
                                </Typography>
                              )}  
                            </Box>
                          </Paper>
                        </Box>
                      );
                    })}
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Day Tasks Modal */}
      <DayTasksModal
        tasks={selectedDayTasks}
        selectedDate={selectedDate}
        open={dayTasksModalOpen}
        onClose={handleCloseDayTasksModal}
        onTaskSelect={handleTaskClick}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={modalOpen}
        onClose={handleCloseModal}
        onTaskUpdated={handleTaskUpdated}
      />

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      
    </Box>
  );
};

export default TaskCalendar;
