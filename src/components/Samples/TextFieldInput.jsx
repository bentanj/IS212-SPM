import { TextField } from '@mui/material';

const TextFieldInput = ({
    ...textFieldProps
}) => (
    <TextField
        fullWidth
        margin={margin}
        {...textFieldProps}
    />
);

export default TextFieldInput;