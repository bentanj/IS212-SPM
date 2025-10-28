"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppBar, Box, Grid, IconButton, Toolbar, Menu, MenuItem, Typography, useMediaQuery, useTheme } from "@mui/material";
import { AccountTree, Assessment, CalendarMonth, Home, Group, Logout, ManageAccounts, Search, Info } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

// Component
import NavBarButton from "./NavBarButton";

const CustomNavBar: React.FC = () => {
    const theme = useTheme();
    const { data: session } = useSession();

    // Collapsable Menu State
    const isSmallScreen = useMediaQuery(theme.breakpoints.down(750));       // true when screen width <= 750px
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const HomeButton = <NavBarButton href="/" icon={<CalendarMonth />} title="Home" />
    const ProjectButton = <NavBarButton href="/project" icon={<AccountTree />} title="Projects" />
    const ReportButton = session?.user ? <NavBarButton href="/Report" icon={<Assessment />} title="Reports" /> : null;

    return (
        <AppBar position="static">
            <Toolbar>
                {isSmallScreen ?
                    /* Layout for smaller screens */
                    (<Grid container alignItems="center" width="100%">
                        {/* Menu Dropdown Button */}
                        <Grid size={2}>
                            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}><MenuIcon /></IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}>
                                <MenuItem onClick={() => setAnchorEl(null)}>{HomeButton}</MenuItem>
                                <MenuItem onClick={() => setAnchorEl(null)}>{ProjectButton}</MenuItem>
                                <MenuItem onClick={() => setAnchorEl(null)}>{ReportButton}</MenuItem>
                            </Menu>
                        </Grid>
                    </Grid>)
                    :
                    /* Layout for larger screens */
                    (<>
                        <Box ml={2}>{HomeButton}</Box>
                        <Box ml={2}>{ProjectButton}</Box>
                        <Box ml={2}>{ReportButton}</Box>
                    </>)}
            </Toolbar>
        </AppBar>
    );
}

export default CustomNavBar;