import { Autocomplete, Chip, FormControl, TextField, } from '@mui/material';

interface MultiSelectInputProps {
    value: string[];
    onChange: (event: React.SyntheticEvent, newValue: string[] | null) => void;
    options: string[];
    freeSolo: boolean;
    label: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
    value,
    onChange,
    options,
    freeSolo = true,    // Allow user to create new tags not within options
    label,
    error = false,
    helperText = "",
    required = false,
}) => (
    <FormControl fullWidth error={error} required={required}>
        <Autocomplete
            multiple
            freeSolo={freeSolo}
            options={options}
            value={value}
            onChange={onChange}
            renderValue={(value, props) =>
                value.map((option, index) => (
                    <Chip label={option} {...props({ index })} key={index} />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder="Type to create new tags"
                    error={error}
                    helperText={helperText}
                    required={required}
                />
            )}
        />
    </FormControl>
)