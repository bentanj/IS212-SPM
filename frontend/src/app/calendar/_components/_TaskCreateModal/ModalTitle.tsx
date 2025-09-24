import { DialogTitle, IconButton } from '@mui/material';
import { Edit, Close } from '@mui/icons-material';

interface ModalTitleProps {
    isEditMode: boolean;
    onClose: () => void;
}

const ModalTitle: React.FC<ModalTitleProps> = ({
    isEditMode, onClose
}) => {
    return (
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }} >
            {isEditMode ? <Edit /> : null}
            {isEditMode ? 'Edit Task' : 'Create New Task'}
            <IconButton sx={{ ml: 'auto' }} onClick={onClose} aria-label="close">
                <Close />
            </IconButton>
        </DialogTitle>
    )
}

export default ModalTitle;