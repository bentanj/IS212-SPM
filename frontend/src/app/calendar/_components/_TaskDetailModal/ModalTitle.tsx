import { DialogTitle, Box, Typography, Stack, Chip } from "@mui/material"
import { Task } from "@/types"
import { getPriorityColor, getStatusColor } from "../../_functions/TaskRenderingFunctions";

interface ModalTitleProps {
    task: Task;
    isMobile: boolean;
}

export const ModalTitle: React.FC<ModalTitleProps> = ({
    task, isMobile
}) => {
    return (
        <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {task.parentTaskId ? `└ ${task.title}` : task.title}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <Chip
                        label={task.priority}
                        sx={{ color: getPriorityColor(task.priority) }}
                        size={isMobile ? 'small' : 'medium'}
                    />
                    <Chip
                        label={task.status}
                        sx={{ color: getStatusColor(task.status) }}
                        size={isMobile ? 'small' : 'medium'}
                    />
                </Stack>
            </Box>
        </DialogTitle>
    )
}