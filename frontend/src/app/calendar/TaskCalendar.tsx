'use client';

import { useState, useMemo, useEffect } from 'react';
import { Alert, AlertColor, Box, useTheme, useMediaQuery, Snackbar } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);

import { taskMockData } from '@/mocks/staff/taskMockData';
import { Task } from '@/types';
import { SideBar, Header, TaskCreateModal } from './_components';
import { MonthHeader, CalendarBody, DayHeaders } from './_components/_TaskCalendar';
import TaskDetailModal from './TaskDetailModal';
import DayTasksModal from './DayTasksModal';
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

  // BUSINESS LOGIC 2: Get tasks for specific day by START DATE
  const getTasksForDay = (date: Dayjs) => {
    return monthTasks.filter(task => dayjs(task.startDate).isSame(date, 'day'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month'));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetailModal = () => {
    setTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  // NEW FUNCTION: Open subtask modal with parent
  const handleCreateSubtask = (parentTask: Task) => {
    setSelectedParentTask(parentTask);
    setSelectedTask(null);
    setCreateModalOpen(true);
  };

  const handleCloseCreateTaskModal = () => {
    setCreateModalOpen(false);
    setSelectedParentTask(null);
    setSelectedTask(null);
  }

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

  // Handle Task Creation
  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);   // To be replaced with POST API endpoint
    setCreateModalOpen(false);
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
          flex: 1, minHeight: 0, overflow: 'hidden',
          p: { xs: 1, sm: 2 },
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
            <CalendarBody
              currentDate={currentDate}
              getTasksForDay={getTasksForDay}
              isTaskOverdue={isTaskOverdue}
              getTaskTypeColor={getTaskTypeColor}
              handleTaskClick={handleTaskClick}
              handleMoreTasksClick={handleMoreTasksClick}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </Box>
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
        onClose={handleCloseCreateTaskModal}
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
