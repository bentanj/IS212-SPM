import { Box, Typography } from "@mui/material";

interface Subtitle1Props {
    boxMarginBottom?: number;
    label: string;
    children: React.ReactNode;
}

export const Subtitle1: React.FC<Subtitle1Props> = ({
    boxMarginBottom = null,
    label, children
}) => {
    return (
        <Box sx={{ mb: boxMarginBottom }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {children}
            </Typography>
        </Box>
    )
}