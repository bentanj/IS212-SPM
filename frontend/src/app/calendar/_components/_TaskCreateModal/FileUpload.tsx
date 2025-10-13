import { Box, Button, Typography, Paper, IconButton } from '@mui/material'
import { CloudUpload, Delete } from '@mui/icons-material';
import { handleFileUpload, handleRemoveFile } from '../../_functions/TaskCreateModelFunctions';

interface FileUploadProps {
    isMobile: boolean;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    isMobile,
    formData,
    setFormData,
}) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                File Attachment (Optional - Maximum 1 file)
            </Typography>

            {!formData.attachedFile ? (
                <Button component="label" variant="outlined"
                    startIcon={<CloudUpload />} fullWidth={isMobile}>
                    Upload File
                    <input type="file" hidden
                        onChange={(event) => { handleFileUpload(event, setFormData) }} />
                </Button>
            ) : (
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {formData.attachedFile.name}
                    </Typography>
                    <IconButton size="small" onClick={() => handleRemoveFile(setFormData)}>
                        <Delete />
                    </IconButton>
                </Paper>
            )}
        </Box>
    )
}