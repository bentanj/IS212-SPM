'use client';

import { useState, useMemo } from 'react';
import {
  Alert, AlertColor, Box, Paper, Typography, Card, CardContent, Stack,
  useTheme, useMediaQuery, Snackbar
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);

import { taskMockData, Task } from '@/mocks/staff/taskMockData';
import SideBar from './_components/SideBar';
import Header from './_components/Header';
import MonthHeader from './_components/_TaskCalendar/MonthHeader';
import TaskDetailModal from './TaskDetailModal';
import TaskCreateModal from './_components/TaskCreateModal';
import DayTasksModal from './DayTasksModal';
import DayHeaders from './_components/_TaskCalendar/DayHeaders';
import { getTaskTypeColor, isTaskOverdue } from './_functions/TaskRenderingFunctions';

const TaskCalendar: React.FC = () => {
  // Mock Data
  const [tasks, setTasks] = useState(taskMockData.tasks);
  const [mockJWT, setMockJWT] = useState(taskMockData.currentUser);

  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create Tasks
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedParentTask, setSelectedParentTask] = useState<Task | null>(null);

  // Task Day
  const [dayTasksModalOpen, setDayTasksModalOpen] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
  const setSnackbarContent = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const snackbarReset = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
    setSnackbarSeverity('success');
  }

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // BUSINESS LOGIC 1: Filter tasks assigned to current user only
  const assignedTasks = useMemo(() => {
    return tasks.filter(task =>
      task.assignedUsers.some(assignedUser => assignedUser.userId === mockJWT.userId)
    );
  }, [tasks]);

  // BUSINESS LOGIC 2: Get tasks for current month by START DATE
  const monthTasks = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');

    return assignedTasks.filter(task => {
      const taskStartDate = dayjs(task.startDate);
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
    return monthTasks.filter(task => dayjs(task.startDate).isSame(date, 'day'));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetailModal = () => {
    setTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);   // To be replaced with POST API endpoint
    setCreateModalOpen(false);
  };

  // NEW FUNCTION: Open subtask modal with parent
  const handleCreateSubtask = (parentTask: Task) => {
    setSelectedParentTask(parentTask);
    setCreateModalOpen(true);
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
    setTaskDetailModalOpen(false);
  };

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

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
      {/* Sidebar for Desktop */}
      <SideBar isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        currentUser={mockJWT}
        assignedTasks={assignedTasks}
      />

      {/* Main Content */}
      <Box sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, height: '100vh', overflow: 'hidden'
      }}>
        {/* Header */}
        <Header
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          setCreateModalOpen={setCreateModalOpen}
        />

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
            <MonthHeader
              isMobile={isMobile}
              currentDate={currentDate}
              navigateMonth={navigateMonth} />

            {/* Calendar Grid */}
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Day Headers */}
              <DayHeaders isMobile={isMobile} />

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
                              {dayTasks.slice(0, isMobile ? 1 : 2).map((task) => {
                                const isOverdue = isTaskOverdue(task);

                                return (
                                  <Card
                                    key={task.taskId}
                                    sx={{
                                      mb: 0.5,
                                      cursor: 'pointer',
                                      // Apply overdue styles if overdue, otherwise normal
                                      ...(isOverdue
                                        ? {
                                          background: `repeating-linear-gradient(
                                              45deg,
                                              ${getTaskTypeColor(task)}20,
                                              ${getTaskTypeColor(task)}20 10px,
                                              ${getTaskTypeColor(task)}35 10px,
                                              ${getTaskTypeColor(task)}35 20px
                                            )`,
                                          borderLeft: task.parentTaskId
                                            ? `2px dashed ${getTaskTypeColor(task)}`
                                            : `3px solid ${getTaskTypeColor(task)}`,
                                          opacity: 0.95,
                                        }
                                        : {
                                          bgcolor: `${getTaskTypeColor(task)}20`,
                                          borderLeft: task.parentTaskId
                                            ? `2px dashed ${getTaskTypeColor(task)}`
                                            : `3px solid ${getTaskTypeColor(task)}`,
                                        }
                                      ),
                                      ml: task.parentTaskId ? 0.5 : 0,
                                      '&:hover': {
                                        bgcolor: isOverdue
                                          ? `${getTaskTypeColor(task)}40`
                                          : `${getTaskTypeColor(task)}30`,
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
                                          textOverflow: 'ellipsis',
                                          fontStyle: task.parentTaskId ? 'italic' : 'normal',
                                          fontWeight: isOverdue ? 600 : 400,
                                        }}
                                      >
                                        {isOverdue ? '⚠️ ' : ''}{task.parentTaskId ? '└ ' : ''}{task.title}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                );
                              })}

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
                                    e.stopPropagation();
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
        open={taskDetailModalOpen}
        onClose={handleCloseTaskDetailModal}
        currentUser={mockJWT}
        onCreateSubtask={handleCreateSubtask}
        onSubtaskClick={handleTaskClick}
        onEditButtonClick={() => setCreateModalOpen(true)}
        allTasks={tasks}
      />

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        setSnackbarContent={setSnackbarContent}
        currentUser={mockJWT}
        existingTaskDetails={selectedTask || null}
        preselectedParentTask={selectedParentTask}
        allTasks={tasks}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={snackbarReset}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={snackbarReset} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default TaskCalendar;
