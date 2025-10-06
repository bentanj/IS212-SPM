import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import Priority from "@/types/TPriority";
import Status from "@/types/TStatus";

interface DropDownMenuProps {
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    options: Priority[] | Status[];
    error?: boolean;
    helperText?: string;
    required?: boolean;
}

const DropDownMenu: React.FC<DropDownMenuProps> = ({
    label,
    value,
    onChange,
    options,
    error = false,
    helperText = "",
    required = false,
}) => {
    return (
        <FormControl fullWidth error={error} required={required}>
            <InputLabel>{label}</InputLabel>
            <Select
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                        {opt}
                    </MenuItem>
                ))}
            </Select>
            {error && helperText && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, mx: 1.75 }}>
                    {helperText}
                </Typography>
            )}
        </FormControl>
    );
};

export default DropDownMenu;
