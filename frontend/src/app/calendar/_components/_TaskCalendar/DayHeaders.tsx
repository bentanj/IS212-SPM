import { Box, Stack, Typography } from "@mui/material"

interface DayHeadersProps {
    isMobile: boolean
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DayHeaders: React.FC<DayHeadersProps> = ({
    isMobile
}) => {
    return (
        <Stack direction="row" spacing={0.5}
            sx={{ mb: 1, flexShrink: 0, height: { xs: 24, sm: 32 } }}>
            {dayNames.map((day) => (
                <Box key={day} sx={{
                    flex: 1, textAlign: 'center',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', minWidth: 0
                }}>
                    <Typography variant="subtitle2" color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                        {isMobile ? day.slice(0, 2) : day}
                    </Typography>
                </Box>
            ))}
        </Stack>
    )
}

export default DayHeaders;