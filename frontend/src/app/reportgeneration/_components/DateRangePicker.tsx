// src/app/reportgeneration/components/DateRangePicker.tsx
import React from 'react';
import { Box, Stack, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangePickerProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
  showValidation?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showValidation = false,
}) => {
  const isDateRangeComplete = startDate && endDate;
  const showWarning = showValidation && !isDateRangeComplete;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 3 }}>
        {showWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please select both start and end dates to generate reports
          </Alert>
        )}
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <DatePicker
            label="Start Date *"
            value={startDate}
            onChange={onStartDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                required: true,
                error: showValidation && !startDate,
                helperText: showValidation && !startDate ? 'Start date is required' : '',
              },
            }}
            maxDate={endDate || undefined}
          />
          <DatePicker
            label="End Date *"
            value={endDate}
            onChange={onEndDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                required: true,
                error: showValidation && !endDate,
                helperText: showValidation && !endDate ? 'End date is required' : '',
              },
            }}
            minDate={startDate || undefined}
          />
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
