// src/app/reportgeneration/components/LoggedTimeReportCard.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { PictureAsPdf, TableChart, Timer, LockOutlined, AccessTime } from '@mui/icons-material';
import { Dayjs } from 'dayjs';

interface LoggedTimeReportCardProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onExportPDF: (filterType: 'department' | 'project', filterValue: string) => void;
  onExportExcel: (filterType: 'department' | 'project', filterValue: string) => void;
  getProjects: () => string[];
  getDepartments: () => string[];
  isExportingPDF: boolean;
  isExportingExcel: boolean;
}

export const LoggedTimeReportCard: React.FC<LoggedTimeReportCardProps> = ({
  startDate,
  endDate,
  onExportPDF,
  onExportExcel,
  getProjects,
  getDepartments,
  isExportingPDF,
  isExportingExcel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filterType, setFilterType] = useState<'department' | 'project'>('project');
  const [filterValue, setFilterValue] = useState<string>('');
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);

  const isDisabled = !startDate || !endDate;
  const isExportDisabled = isDisabled || !filterValue;

  // Update available options when filter type changes
  useEffect(() => {
    const options = filterType === 'project' ? getProjects() : getDepartments();
    setAvailableOptions(options);
    setFilterValue(''); // Reset selection when type changes
  }, [filterType, getProjects, getDepartments]);

  const handleFilterTypeChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value as 'department' | 'project');
  };

  const handleFilterValueChange = (event: SelectChangeEvent) => {
    setFilterValue(event.target.value);
  };

  const handleExportPDF = () => {
    if (filterValue) {
      onExportPDF(filterType, filterValue);
    }
  };

  const handleExportExcel = () => {
    if (filterValue) {
      onExportExcel(filterType, filterValue);
    }
  };

  const renderButton = (
    button: React.ReactNode,
    tooltipText: string,
    disabled: boolean
  ) => {
    if (disabled) {
      return (
        <Tooltip title={tooltipText} arrow>
          <span style={{ width: isMobile ? '100%' : 'auto' }}>{button}</span>
        </Tooltip>
      );
    }
    return button;
  };

  const report = {
    title: 'Logged Time Report',
    description: 'Comprehensive time tracking analysis capturing effort spent on projects or by departments over a given period. Track total hours invested by each user.',
    category: 'Time Tracking',
    estimatedTime: '2-4 minutes',
    dataPoints: 'Variable',
  };

  const getCategoryColor = () => 'info';

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        opacity: isDisabled ? 0.7 : 1,
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-4px)',
          boxShadow: isDisabled ? theme.shadows[2] : theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              mr: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: isDisabled ? 'action.disabledBackground' : 'primary.lighter',
              display: 'flex',
              color: isDisabled ? 'action.disabled' : 'primary.main',
            }}
          >
            {isDisabled ? <LockOutlined sx={{ fontSize: 28 }} /> : <AccessTime sx={{ fontSize: 28 }} />}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {report.title}
            </Typography>
            <Chip
              label={report.category}
              color={getCategoryColor() as any}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: { xs: 'none', sm: 'block' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {report.description}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {report.description.substring(0, 120)}...
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 'auto', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<Timer />}
            label={report.estimatedTime}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Date Filtered"
            color="success"
            size="small"
            variant="outlined"
          />
          {isDisabled && (
            <Chip
              label="Date Range Required"
              color="warning"
              size="small"
              variant="filled"
            />
          )}
        </Stack>

        {/* Filter Dropdowns */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <FormControl fullWidth size="small" disabled={isDisabled}>
            <InputLabel id="filter-type-label">Filter By</InputLabel>
            <Select
              labelId="filter-type-label"
              id="filter-type-select"
              value={filterType}
              label="Filter By"
              onChange={handleFilterTypeChange}
            >
              <MenuItem value="project">Project</MenuItem>
              <MenuItem value="department">Department</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={isDisabled || availableOptions.length === 0}>
            <InputLabel id="filter-value-label">
              Select {filterType === 'project' ? 'Project' : 'Department'}
            </InputLabel>
            <Select
              labelId="filter-value-label"
              id="filter-value-select"
              value={filterValue}
              label={`Select ${filterType === 'project' ? 'Project' : 'Department'}`}
              onChange={handleFilterValueChange}
            >
              {availableOptions.length === 0 ? (
                <MenuItem value="" disabled>
                  No {filterType === 'project' ? 'projects' : 'departments'} available
                </MenuItem>
              ) : (
                availableOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: '100%' }}
        >
          {renderButton(
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              disabled={isExportingPDF || isExportDisabled}
              fullWidth={isMobile}
              sx={{
                py: { xs: 1, sm: 1.25 },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                minWidth: { sm: 140 },
              }}
            >
              {isExportingPDF ? 'Exporting...' : 'Export to PDF'}
            </Button>,
            isDisabled 
              ? 'Please select a date range first' 
              : 'Please select a filter option',
            isExportDisabled
          )}

          {renderButton(
            <Button
              variant="outlined"
              startIcon={<TableChart />}
              onClick={handleExportExcel}
              disabled={isExportingExcel || isExportDisabled}
              fullWidth={isMobile}
              sx={{
                py: { xs: 1, sm: 1.25 },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                minWidth: { sm: 140 },
              }}
            >
              {isExportingExcel ? 'Exporting...' : 'Export to Excel'}
            </Button>,
            isDisabled 
              ? 'Please select a date range first' 
              : 'Please select a filter option',
            isExportDisabled
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};