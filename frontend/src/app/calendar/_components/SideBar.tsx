import { Drawer, Paper } from "@mui/material";
import { Task, User } from "@/types";
import SideBarContent from "./SideBarContent"

interface SideBarProps {
    isMobile: boolean
    sidebarOpen: boolean
    toggleSidebar: () => void
    currentUser: User
    tasks: Task[]
}

export const SideBar: React.FC<SideBarProps> = ({
    isMobile,
    sidebarOpen,
    toggleSidebar,
    currentUser,
    tasks
}) => {

    const assignedTasks = tasks.filter(task =>
        task.assignedUsers.some(assignedUser => assignedUser.userId === currentUser.userId)
    );

    const departmentTasks = tasks.filter(task =>
        task.departments.includes(currentUser.department) &&
        !task.assignedUsers.some(assignedUser => assignedUser.userId === currentUser.userId) &&
        !assignedTasks.includes(task)
    );

    if (isMobile) {
        // Mobile Drawer
        return (
            <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: 280 }
                }}>
                <SideBarContent isMobile={isMobile} currentUser={currentUser} assignedTasks={assignedTasks} departmentTasks={departmentTasks} />
            </Drawer>
        )

    }
    // Desktop Sidebar
    return (
        <Paper sx={{ width: 280, mr: 2, height: '100vh', overflow: 'auto', flexShrink: 0 }}>
            <SideBarContent isMobile={isMobile} currentUser={currentUser} assignedTasks={assignedTasks} departmentTasks={departmentTasks} />
        </Paper>
    )
}