import { Autocomplete, TextField } from '@mui/material';

// options: string[];
// value: string | null;
// onChange: (event: React.SyntheticEvent, newValue: string | null) => void;
// label: string;

const DropDownInput = ({
    options,
    value,
    onChange,
    label,
}) => (
    <Autocomplete
        options={options}
        value={value}
        onChange={onChange}
        renderInput={(params) => (
            <TextField {...params} label={label} />
        )}
    />
);

export default DropDownInput;