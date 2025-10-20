// src/app/reportgeneration/components/DateRangePicker.tsx
import React from 'react';
import { Box, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangePickerProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={onStartDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
            maxDate={endDate || undefined}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={onEndDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
            minDate={startDate || undefined}
          />
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
