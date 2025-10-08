import { TextFieldProps } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/en-gb';

dayjs.extend(utc);

type DatePickerInputProps = {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    // Optional props
    minSelectableDate?: Date | null;
    maxSelectableDate?: Date | null;
    textFieldProps?: Partial<TextFieldProps>;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
    label,
    value,
    onChange,
    // Default values for optional props
    minSelectableDate = new Date(),
    maxSelectableDate = null,
    textFieldProps,
}) => {
    // Handles dates with 16:00 UTC as the default time
    // and converts them to local time for display
    const handleDateChange = (newValue: Dayjs | null) => {
        const selectedDate = newValue?.hour() === 16
            ? newValue.utc().add(newValue.utcOffset(), 'minutes').toDate()
            : newValue?.toDate() ?? null;
        onChange(selectedDate);
    }

    return (
        <DatePicker
            label={label}
            sx={{ mt: 1, width: "100%", bgcolor: "white" }}
            minDate={dayjs(minSelectableDate)}
            maxDate={dayjs(maxSelectableDate)}
            value={value ? dayjs(value) : null}
            onChange={handleDateChange}
            slotProps={{
                actionBar: { actions: ['today'] },
                textField: { ...textFieldProps }
            }}
            views={['year', 'month', 'day']}
        />
    );
}

export default DatePickerInput;