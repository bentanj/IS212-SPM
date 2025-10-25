import React from 'react';
import { Box, Typography, List, ListItem, Stack, Chip } from '@mui/material';
import { Task } from '@/types';
import { getPriorityColor, getStatusColor } from '@/utils/TaskRenderingFunctions';
import dayjs from 'dayjs';

interface SubTaskSectionProps {
    relatedSubtasks: Task[];
    onSubtaskClick?: (subtask: Task) => void;
}

export const SubTaskSection: React.FC<SubTaskSectionProps> = ({
    relatedSubtasks,
    onSubtaskClick,
}) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{
                mb: 2, fontWeight: 600, color: 'primary.main'
            }}>
                Subtasks ({relatedSubtasks.length})
            </Typography>
            <List sx={{ p: 0 }}>
                {relatedSubtasks.map((subtask, index) => (
                    <React.Fragment key={subtask.taskId}>
                        <ListItem
                            sx={{
                                p: 2,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                mb: 1,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    cursor: 'pointer'
                                }
                            }}
                            onClick={() => onSubtaskClick?.(subtask)}
                        >
                            <Stack spacing={1} sx={{ width: '100%' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            fontStyle: 'italic',
                                            flexGrow: 1
                                        }}
                                    >
                                        └ {subtask.title}
                                    </Typography>

                                    <Chip
                                        label={subtask.priority}
                                        size="small"
                                        sx={{ color: getPriorityColor(subtask.priority) }}
                                    />
                                    <Chip
                                        label={subtask.status}
                                        size="small"
                                        variant="outlined"
                                        color={getStatusColor(subtask.status)}
                                    />
                                </Stack>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {subtask.description}
                                </Typography>

                                <Stack direction="row" spacing={2}>
                                    <Typography variant="caption" color="text.secondary">
                                        Start: {dayjs(subtask.startDate).format('MMM DD, YYYY')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Due: {dayjs(subtask.dueDate).format('MMM DD, YYYY')}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </ListItem>
                    </React.Fragment>
                ))}
            </List>
        </Box>
    )
}