import { useSnackbar, SnackbarKey } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function SnackbarCloseButton({ snackbarKey }: { snackbarKey: SnackbarKey }) {
    const { closeSnackbar } = useSnackbar();
    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)} color="inherit">
            <CloseIcon />
        </IconButton>
    );
}
export default SnackbarCloseButton;