import { AppBar, Toolbar, IconButton, TextField, InputAdornment, Typography, Button } from '@mui/material'
import { Menu, Search, Add } from '@mui/icons-material'

interface HeaderProps {
    isMobile: boolean;
    toggleSidebar: () => void;
    setCreateModalOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
    isMobile, toggleSidebar, setCreateModalOpen
}) => {
    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'white', flexShrink: 0 }}>
            <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
                {isMobile && (
                    <IconButton edge="start" onClick={toggleSidebar} sx={{ mr: 2, }} >
                        <Menu />
                    </IconButton>
                )}
                {/* <TextField
                    placeholder="Search my tasks..."
                    variant="outlined"
                    size="small"
                    sx={{
                        mr: 'auto',
                        width: { xs: '150px', sm: '200px', md: '300px' }
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        },
                    }}
                /> */}
                <Typography
                    variant="h6"
                    sx={{
                        mx: { xs: 1, sm: 2 },
                        display: { xs: 'none', sm: 'block' }
                    }}
                    flexGrow={1}
                >
                    My Calendar
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => setCreateModalOpen(true)}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ ml: 'auto' }}
                >
                    <Add />
                    {isMobile ? '' : 'Add task'}
                </Button>
            </Toolbar>
        </AppBar>
    )
}