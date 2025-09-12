import { TextField } from '@mui/material';

const TextFieldInput = ({
    ...textFieldProps
}) => (
    <TextField
        fullWidth
        {...textFieldProps}
    />
);

export default TextFieldInput;