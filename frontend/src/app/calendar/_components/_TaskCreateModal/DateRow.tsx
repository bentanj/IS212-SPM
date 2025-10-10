import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Stack } from '@mui/material'
import dayjs from 'dayjs'
import CustomDatePicker from '@/components/DatePickerInput'
import IFormData from "@/types/IFormData";
import { Task } from '@/mocks/staff/taskMockData';

interface DateRowProps {
    formData: IFormData
    setFormData: React.Dispatch<React.SetStateAction<IFormData>>
    errors: Record<string, string>
    parentTask?: Task | null
}

const DateRow: React.FC<DateRowProps> = ({
    formData, setFormData, errors, parentTask = null
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <CustomDatePicker label="Start Date"
                    value={formData.startDate ? formData.startDate.toDate() : null}
                    onChange={(date) => setFormData(prev => ({ ...prev, startDate: date ? dayjs(date) : null }))}
                    minSelectableDate={dayjs(parentTask?.startDate).toDate()}
                    textFieldProps={{
                        required: true,
                        error: !!errors.startDate,
                        helperText: errors.startDate,
                    }}
                />

                <CustomDatePicker label="Due Date"
                    value={formData.dueDate ? formData.dueDate.toDate() : null}
                    onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date ? dayjs(date) : null }))}
                    minSelectableDate={formData.startDate ? formData.startDate.toDate() : null}
                    maxSelectableDate={parentTask
                        ? dayjs(parentTask.dueDate).toDate()
                        : undefined}
                    textFieldProps={{
                        required: true,
                        error: !!errors.dueDate,
                        helperText: errors.dueDate,
                    }}
                />

                <CustomDatePicker label="Completed Date"
                    value={formData.completedDate ? formData.completedDate.toDate() : null}
                    onChange={(date) => setFormData(prev => ({ ...prev, completedDate: date ? dayjs(date) : null }))}
                    minSelectableDate={formData.startDate ? formData.startDate.toDate() : null}
                    textFieldProps={{
                        error: !!errors.completedDate,
                        helperText: errors.completedDate,
                    }}
                />
            </Stack>
        </LocalizationProvider>
    )
}

export default DateRow;