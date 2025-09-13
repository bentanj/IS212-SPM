import { Autocomplete, Chip, TextField, } from '@mui/material';

interface MultiSelectInputProps {
    value: string[];
    onChange: (event: React.SyntheticEvent, newValue: string[] | null) => void;
    options: string[];
    freeSolo: boolean;
    label: string;
}

const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
    value,
    onChange,
    options,
    freeSolo = true,    // Allow user to create new tags not within options
    label,
}) => (
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
            />
        )}
    />
)

export default MultiSelectInput;