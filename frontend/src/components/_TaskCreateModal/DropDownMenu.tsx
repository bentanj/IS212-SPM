import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { Priority, Status } from "@/types";

interface DropDownMenuProps {
    label: string;
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    options: Priority[] | Status[];
    error?: boolean;
    helperText?: string;
    required?: boolean;
}

export const DropDownMenu: React.FC<DropDownMenuProps> = ({
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