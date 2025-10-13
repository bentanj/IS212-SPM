import { TextField } from '@mui/material';
import { FormData } from '@/types';

interface CommentsProps {
    isEditMode: boolean;
    newComment: string;
    formData: FormData;
    setNewComment: (value: React.SetStateAction<string>) => void
    setFormData: (value: React.SetStateAction<FormData>) => void
    errors: Record<string, string>;
}

export const Comments: React.FC<CommentsProps> = ({
    isEditMode, newComment, formData, setNewComment, setFormData, errors
}) => {
    return (
        <>
            {isEditMode ? (
                <TextField label="Add New Comment (Optional)"
                    fullWidth margin="normal"
                    multiline rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    helperText="Add an optional comment about your changes"
                />
            ) : (
                <TextField label="Initial Comment (Optional)"
                    fullWidth margin="normal"
                    multiline rows={2}
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    error={!!errors.comments}
                    helperText={errors.comments || "Add an optional initial comment to the task"}
                />
            )}
        </>
    )
}