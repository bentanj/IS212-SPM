import { CurrentUser, Task } from '@/mocks/staff/taskMockData'
import { Avatar, Box, Stack, Typography } from '@mui/material'

interface SideBarContentProps {
    isMobile: boolean
    currentUser: CurrentUser
    assignedTasks: Task[]
}

const SideBarContent: React.FC<SideBarContentProps> = ({
    isMobile,
    currentUser,
    assignedTasks
}) => {
    return (
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
    )
}

export default SideBarContent;