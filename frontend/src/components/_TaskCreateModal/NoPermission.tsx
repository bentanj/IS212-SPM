import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface NoPermissionProps {
    open: boolean;
    onClose: () => void;
}

export const NoPermission: React.FC<NoPermissionProps> = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogContent>
                <Typography>You do not have permission to edit this task.</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};