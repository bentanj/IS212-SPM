import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
    label,
    value,
    onChange,
    // Default values for optional props
    minSelectableDate = new Date(),
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
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <DatePicker
                label={label}
                sx={{ mt: 1, width: "100%", bgcolor: "white" }}
                minDate={dayjs(minSelectableDate)}
                value={value ? dayjs(value) : null}
                onChange={handleDateChange}
                slotProps={{
                    actionBar: { actions: ['today'] },
                }}
                views={['year', 'month', 'day']}
            />
        </LocalizationProvider>
    );
}

export default DatePickerInput;
