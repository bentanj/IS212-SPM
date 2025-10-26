import { Box, Button, Typography, Paper, IconButton, Alert } from '@mui/material'
import { CloudUpload, Delete } from '@mui/icons-material';
import { handleFileUpload, handleRemoveFile } from '@/utils/TaskCreateModelFunctions';
import { useState } from 'react';

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
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (50MB limit)
        const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
        if (file.size > MAX_FILE_SIZE_BYTES) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            setError(`File size (${fileSizeMB}MB) exceeds the 50MB limit`);
            return;
        }

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        
        if (!validTypes.includes(file.type)) {
            setError('Only PDF and Excel files are allowed');
            return;
        }

        setError(null);
        handleFileUpload(event, setFormData);
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                File Attachment (Optional - PDF or Excel, max 50MB)
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {!formData.attachedFile ? (
                <Button component="label" variant="outlined"
                    startIcon={<CloudUpload />} fullWidth={isMobile}>
                    Upload File
                    <input type="file" hidden accept=".pdf,.xls,.xlsx"
                        onChange={handleFileSelect} />
                </Button>
            ) : (
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {formData.attachedFile.name}
                    </Typography>
                    <IconButton size="small" onClick={() => {
                        handleRemoveFile(setFormData);
                        setError(null);
                    }}>
                        <Delete />
                    </IconButton>
                </Paper>
            )}
        </Box>
    )
}