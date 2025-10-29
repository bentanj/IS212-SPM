'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertColor, Box, useTheme, useMediaQuery, Snackbar } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);

import { taskMockData } from '@/mocks/staff/taskMockData';
import { Task } from '@/types';
import { SideBar, Header, DayTasksModal, TaskCreateModal, TaskDetailModal } from './_components';
import { MonthHeader, CalendarBody, DayHeaders } from './_components/_TaskCalendar';
import { getTaskTypeColor, isTaskOverdue } from '@/utils/TaskRenderingFunctions';

// Functions
import { getUserTask } from '@/utils/Tasks/getTask';

const TaskCalendar: React.FC = () => {
  const { data: session } = useSession();

  // Mock Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mockJWT, setMockJWT] = useState(null);

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

  useEffect(() => {
    if (session?.user) {
      setMockJWT(session.user);
    }
  }, [session]);

  const fetchTasks = useCallback(async () => {
    if (!mockJWT) {
      // Session user not ready yet, exit early
      return;
    }

    try {
      const TaskData = await getUserTask(mockJWT);
      setTasks(TaskData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [mockJWT]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getTasksForDay = (date: Dayjs) => {
    return tasks.filter(task => dayjs(task.startDate).isSame(date, 'day'));
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

  if (!mockJWT) {
    // Session/user data not ready yet, show loading or empty state
    return <Box sx={{ textAlign: 'center', alignItems: 'center' }}>Loading Session Data...</Box>;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
      {/* Sidebar for Desktop */}
      <SideBar isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        currentUser={mockJWT}
        tasks={tasks}
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
        task={selectedTask} setSelectedTask={setSelectedTask}
        open={taskDetailModalOpen} onClose={handleCloseTaskDetailModal}
        currentUser={mockJWT}
        onCreateSubtask={handleCreateSubtask}
        onSubtaskClick={handleTaskClick}
        onEditButtonClick={() => setCreateModalOpen(true)}
        allTasks={tasks}
        setSnackbarContent={setSnackbarContent} refetchTasks={fetchTasks}
      />

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onClose={handleCloseCreateTaskModal}
        refetchTasks={fetchTasks}
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
