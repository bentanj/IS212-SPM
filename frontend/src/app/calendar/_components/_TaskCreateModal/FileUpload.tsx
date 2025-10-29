import { Box, Button, Typography, Paper, IconButton, Alert, Stack, Chip } from '@mui/material';
import { CloudUpload, Delete, AttachFile } from '@mui/icons-material';
import { handleFileUpload, handleRemoveFile } from '../../_functions/TaskCreateModelFunctions';
import { useState } from 'react';

interface FileUploadProps {
    isMobile: boolean;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const FileUpload: React.FC<FileUploadProps> = ({
    isMobile,
    formData,
    setFormData,
}) => {
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
        const validTypes = [
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        const validFiles: File[] = [];
        const errors: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                errors.push(`${file.name}: File size (${fileSizeMB}MB) exceeds the 50MB limit`);
                continue;
            }

            // Validate file type
            if (!validTypes.includes(file.type)) {
                errors.push(`${file.name}: Only PDF and Excel files are allowed`);
                continue;
            }

            validFiles.push(file);
        }

        if (errors.length > 0) {
            setError(errors.join('; '));
        } else {
            setError(null);
        }

        if (validFiles.length > 0) {
            handleFileUpload(validFiles, setFormData);
        }

        // Reset the input so the same file can be selected again if removed
        event.target.value = '';
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                File Attachments (Optional - PDF or Excel, max 50MB each)
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth={isMobile}
                sx={{ mb: formData.attachedFiles && formData.attachedFiles.length > 0 ? 2 : 0 }}
            >
                Upload Files
                <input
                    type="file"
                    hidden
                    accept=".pdf,.xls,.xlsx"
                    onChange={handleFileSelect}
                    multiple
                />
            </Button>

            {formData.attachedFiles && formData.attachedFiles.length > 0 && (
                <Stack spacing={1}>
                    {formData.attachedFiles.map((file: File, index: number) => (
                        <Paper key={index} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFile fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                {file.name}
                            </Typography>
                            <Chip
                                label={`${(file.size / 1024).toFixed(1)} KB`}
                                size="small"
                                variant="outlined"
                            />
                            <IconButton
                                size="small"
                                onClick={() => {
                                    handleRemoveFile(index, setFormData);
                                    setError(null);
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    )
}

export default FileUpload
