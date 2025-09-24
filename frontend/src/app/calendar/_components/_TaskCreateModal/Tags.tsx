import { TextField, Chip, Box } from '@mui/material'
import IFormData from '@/types/IFormData';

interface TagsProps {
    tagInput: string;
    setTagInput: React.Dispatch<React.SetStateAction<string>>;
    handleAddTag: (event: React.KeyboardEvent<HTMLElement>, tagInput: string, setTagInput: React.Dispatch<React.SetStateAction<string>>, formData: IFormData, setFormData: React.Dispatch<React.SetStateAction<IFormData>>) => void

    handleRemoveTag: (tagToRemove: string, setFormData: React.Dispatch<React.SetStateAction<IFormData>>) => void
    formData: IFormData;
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
}

const Tags: React.FC<TagsProps> = ({
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
    formData,
    setFormData
}) => {
    return (
        <>
            <TextField label="Add Tags"
                fullWidth margin="normal"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(event) => {
                    handleAddTag(event, tagInput, setTagInput, formData, setFormData);
                }}
                helperText="Type a tag and press Enter to add it"
            />

            {
                formData.tags.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {formData.tags.map((tag, index) => (
                            <Chip key={index} label={tag}
                                size="small" color="primary" variant="outlined"
                                onDelete={() => handleRemoveTag(tag, setFormData)} />
                        ))}
                    </Box>
                )
            }
        </>
    )
}

export default Tags