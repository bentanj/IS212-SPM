import { useMemo } from "react";
import { Box, Card, CardContent, Paper, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Task } from "@/mocks/staff/taskMockData";

interface CalendarBodyProps {
    currentDate: dayjs.Dayjs;
    getTasksForDay: (day: dayjs.Dayjs) => Task[];
    isTaskOverdue: (task: Task) => boolean;
    getTaskTypeColor: (task: Task) => string;
    handleTaskClick: (task: Task) => void;
    handleMoreTasksClick: (day: dayjs.Dayjs, tasks: Task[]) => void;
    isMobile: boolean;
    isTablet: boolean;
}

const CalendarBody: React.FC<CalendarBodyProps> = ({
    currentDate,
    getTasksForDay,
    isTaskOverdue,
    getTaskTypeColor,
    handleTaskClick,
    handleMoreTasksClick,
    isMobile, isTablet
}) => {

    const getCellHeight = () => {
        if (isMobile) return 80;
        if (isTablet) return 100;
        return 120; // Desktop
    };

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

    // Create weeks array for better calendar rendering
    const weeks = useMemo(() => {
        const weeksArray = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            weeksArray.push(calendarDays.slice(i, i + 7));
        }
        return weeksArray;
    }, [calendarDays]);

    return (
        <Stack spacing={0.5}
            sx={{ flex: 1, minHeight: 0 }}>
            {weeks.map((week, weekIndex) => (
                <Stack key={weekIndex}
                    direction="row" spacing={0.5}
                    sx={{ height: getCellHeight(), flexShrink: 0 }}>

                    {week.map((day) => {
                        const dayTasks = getTasksForDay(day);
                        const isCurrentMonth = day.isSame(currentDate, 'month');
                        const isToday = day.isSame(dayjs(), 'day');

                        return (
                            <Box key={day.toString()} sx={{ flex: 1, minWidth: 0, height: '100%' }}>
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
                                    <Typography variant="body2"
                                        fontWeight={isToday ? 'bold' : 'normal'}
                                        color={isToday ? 'primary.main' : 'text.primary'}
                                        sx={{
                                            mb: { xs: 0.5, sm: 1 },
                                            flexShrink: 0,
                                            fontSize: { xs: '0.7rem', sm: '0.875rem' }
                                        }}>
                                        {day.format('D')}
                                    </Typography>

                                    <Box sx={{
                                        flex: 1, overflow: 'hidden', display: 'flex',
                                        flexDirection: 'column', minWidth: 0
                                    }}>
                                        {/* Only show tasks that fit within the cell */}
                                        {dayTasks.slice(0, isMobile ? 1 : 2).map((task) => {
                                            const isOverdue = isTaskOverdue(task);

                                            return (
                                                <Card
                                                    key={task.taskId}
                                                    sx={{
                                                        mb: 0.5, cursor: 'pointer',
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
                                                        minHeight: 0, flexShrink: 0,
                                                        height: { xs: '16px', sm: '20px' },
                                                        minWidth: 0, width: '100%'
                                                    }}
                                                    onClick={() => handleTaskClick(task)}
                                                >
                                                    <CardContent sx={{
                                                        p: '2px 4px !important',
                                                        '&:last-child': { pb: '2px !important' },
                                                        height: '100%', display: 'flex', alignItems: 'center',
                                                        minWidth: 0, width: '100%'
                                                    }}>
                                                        <Typography variant="caption" noWrap
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
                                            <Typography variant="caption" color="text.secondary"
                                                sx={{
                                                    fontSize: { xs: '0.55rem', sm: '0.65rem' },
                                                    flexShrink: 0, lineHeight: 1,
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
    )
}

export default CalendarBody