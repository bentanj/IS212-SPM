import { Box, IconButton, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

interface MonthHeaderProps {
    isMobile: boolean
    currentDate: any
    navigateMonth: (direction: 'prev' | 'next') => void
}

const MonthHeader: React.FC<MonthHeaderProps> = ({
    isMobile, currentDate, navigateMonth
}) => {
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            flexShrink: 0
        }}>
            <IconButton onClick={() => navigateMonth('prev')}>
                <ChevronLeft />
            </IconButton>
            <Typography
                variant={isMobile ? 'h6' : 'h5'}
                sx={{ mx: 2, minWidth: { xs: 120, sm: 140 }, textAlign: 'center' }}
            >
                {currentDate.format(isMobile ? 'MMM YYYY' : 'MMMM YYYY')}
            </Typography>
            <IconButton onClick={() => navigateMonth('next')}>
                <ChevronRight />
            </IconButton>
        </Box>
    )
}

export default MonthHeader;