import { useRef, useState } from "react";
import { DialogTitle, Box, Typography, Stack, Chip, Menu, MenuItem, Button } from "@mui/material"
import { Task, Priority, Status } from "@/types"
import { getPriorityColor, getStatusColor } from "@/utils/TaskRenderingFunctions";
import { PriorityOptions, StatusOptions } from "@/constants/DefaultFormData";

interface ModalTitleProps {
    task: Task;
    isMobile: boolean;
    changePriority: (priority: Priority) => void;
    changeStatus: (status: Status) => void;
    onSaveButtonClick: () => void;
}

export const ModalTitle: React.FC<ModalTitleProps> = ({
    task, isMobile, changePriority, changeStatus, onSaveButtonClick
}) => {
    const [priorityAnchorEl, setPriorityAnchorEl] = useState<null | HTMLElement>(null);
    const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);

    // Preserve original priority and status to detect changes
    const originalPriorityRef = useRef<Priority>(task?.priority);
    const originalStatusRef = useRef<Status>(task?.status);
    const originalPriority = originalPriorityRef.current;
    const originalStatus = originalStatusRef.current;

    const handlePriorityClick = (event: React.MouseEvent<HTMLElement>) => {
        setPriorityAnchorEl(event.currentTarget);
    };
    const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
        setStatusAnchorEl(event.currentTarget);
    };

    const handlePriorityClose = (option?: Priority) => {
        setPriorityAnchorEl(null);
        if (option) changePriority(option);
    };
    const handleStatusClose = (option?: Status) => {
        setStatusAnchorEl(null);
        if (option) changeStatus(option);
    };

    const promptSaveChanges = () => {
        return task!.priority !== originalPriority || task!.status !== originalStatus;
    }

    return (
        <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {task.parentTaskId ? `└ ${task.title}` : task.title}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>

                    {promptSaveChanges() &&
                        <Button variant="contained" color="primary" size="small"
                            onClick={onSaveButtonClick}>
                            Save Changes
                        </Button>}

                    <Chip
                        label={task.priority}
                        sx={{ color: getPriorityColor(task.priority) }}
                        size={isMobile ? 'small' : 'medium'}
                        onClick={handlePriorityClick}
                    />
                    <Menu
                        anchorEl={priorityAnchorEl}
                        open={Boolean(priorityAnchorEl)}
                        onClose={() => handlePriorityClose()}
                    >
                        {PriorityOptions.map((option) => (
                            <MenuItem
                                key={option}
                                selected={option === task.priority}
                                onClick={() => handlePriorityClose(option)}
                            >
                                {option}
                            </MenuItem>
                        ))}
                    </Menu>

                    <Chip
                        label={task.status}
                        sx={{ color: getStatusColor(task.status) }}
                        size={isMobile ? 'small' : 'medium'}
                        onClick={handleStatusClick}
                    />
                    <Menu
                        anchorEl={statusAnchorEl}
                        open={Boolean(statusAnchorEl)}
                        onClose={() => handleStatusClose()}
                    >
                        {StatusOptions.map((option) => (
                            <MenuItem
                                key={option}
                                selected={option === task.status}
                                onClick={() => handleStatusClose(option)}
                            >
                                {option}
                            </MenuItem>
                        ))}
                    </Menu>

                </Stack>
            </Box>
        </DialogTitle>
    )
}