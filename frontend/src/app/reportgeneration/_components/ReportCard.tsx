// src/app/reportgeneration/components/ReportCard.tsx

import React, { useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Timer,
  LockOutlined,
} from '@mui/icons-material';

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    estimatedTime: string;
    dataPoints: number;
    hasSubTypes?: boolean;
  };
  isExportingPDF: boolean;
  isExportingExcel: boolean;
  onExportPDF: (params?: { department?: string; aggregation?: string }) => void;
  onExportExcel: (params?: { department?: string; aggregation?: string }) => void;
  getCategoryColor: (category: string) => string;
  hasDateFilter?: boolean;
  isDisabled?: boolean;
  reportType?: string; // NEW: To identify department reports
}

// Department list - In production, fetch from API
const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
  'Product',
  'Design',
  'Legal',
];

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isExportingPDF,
  isExportingExcel,
  onExportPDF,
  onExportExcel,
  getCategoryColor,
  hasDateFilter = false,
  isDisabled = false,
  reportType, // NEW
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // NEW: State for Department Task Activity Report
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedAggregation, setSelectedAggregation] = useState<string>('weekly');

  // NEW: Check if this is a department report
  const isDepartmentReport = reportType === 'department-activity' || report.id === 'department-activity';

  // NEW: Handle department dropdown change
  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setSelectedDepartment(event.target.value);
  };

  // NEW: Handle aggregation dropdown change
  const handleAggregationChange = (event: SelectChangeEvent<string>) => {
    setSelectedAggregation(event.target.value);
  };

  // MODIFIED: Enhanced button rendering with department validation
  const renderButton = (
    button: React.ReactNode,
    tooltipText: string,
    disabled: boolean
  ) => {
    // Check if department report needs department selection
    const needsDepartment = isDepartmentReport && !selectedDepartment;
    const finalDisabled = disabled || needsDepartment;
    const finalTooltip = needsDepartment ? 'Please select a department' : tooltipText;

    if (finalDisabled && (isDisabled || needsDepartment)) {
      return (
        <Tooltip title={finalTooltip} arrow>
          <span style={{ width: isMobile ? '100%' : 'auto' }}>{button}</span>
        </Tooltip>
      );
    }
    return button;
  };

  // MODIFIED: Handle export with department params
  const handleExportPDF = () => {
    if (isDepartmentReport) {
      if (!selectedDepartment) {
        return; // Validation handled by button disabled state
      }
      onExportPDF({
        department: selectedDepartment,
        aggregation: selectedAggregation,
      });
    } else {
      onExportPDF();
    }
  };

  const handleExportExcel = () => {
    if (isDepartmentReport) {
      if (!selectedDepartment) {
        return; // Validation handled by button disabled state
      }
      onExportExcel({
        department: selectedDepartment,
        aggregation: selectedAggregation,
      });
    } else {
      onExportExcel();
    }
  };

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
            {isDisabled ? <LockOutlined sx={{ fontSize: 28 }} /> : report.icon}
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
              color={getCategoryColor(report.category) as any}
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
          <Chip icon={<Timer />} label={report.estimatedTime} size="small" variant="outlined" />
          <Typography variant="caption" color="text.secondary" sx={{ pt: 0.75 }}>
            {report.dataPoints} data points
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          {hasDateFilter && (
            <Chip label="Date Filtered" color="success" size="small" variant="outlined" />
          )}

          {report.hasSubTypes && (
            <Chip label="Multiple Options" color="secondary" size="small" variant="outlined" />
          )}

          {isDisabled && (
            <Chip label="Date Range Required" color="warning" size="small" variant="filled" />
          )}
        </Stack>

        {/* NEW: Department Report Dropdowns */}
        {isDepartmentReport && !isDisabled && (
          <Box sx={{ mt: 2 }}>
            {/* Department Dropdown */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="department-select-label">Department *</InputLabel>
              <Select
                labelId="department-select-label"
                id="department-select"
                value={selectedDepartment}
                label="Department *"
                onChange={handleDepartmentChange}
                disabled={isExportingPDF || isExportingExcel}
                required
              >
                <MenuItem value="">
                  <em>Select Department</em>
                </MenuItem>
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Aggregation Dropdown */}
            <FormControl fullWidth size="small">
              <InputLabel id="aggregation-select-label">Aggregation</InputLabel>
              <Select
                labelId="aggregation-select-label"
                id="aggregation-select"
                value={selectedAggregation}
                label="Aggregation"
                onChange={handleAggregationChange}
                disabled={isExportingPDF || isExportingExcel}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            {/* Department Selection Indicator */}
            {!selectedDepartment && (
              <Chip
                label="Select department to enable export"
                color="info"
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
          {renderButton(
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              disabled={
                isExportingPDF || isDisabled || (isDepartmentReport && !selectedDepartment)
              }
              fullWidth={isMobile}
              sx={{
                py: { xs: 1, sm: 1.25 },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                minWidth: { sm: 140 },
              }}
            >
              {isExportingPDF ? 'Exporting...' : 'Export to PDF'}
            </Button>,
            'Please select a date range first',
            isDisabled || (isDepartmentReport && !selectedDepartment)
          )}

          {renderButton(
            <Button
              variant="outlined"
              startIcon={<TableChart />}
              onClick={handleExportExcel}
              disabled={
                isExportingExcel || isDisabled || (isDepartmentReport && !selectedDepartment)
              }
              fullWidth={isMobile}
              sx={{
                py: { xs: 1, sm: 1.25 },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                minWidth: { sm: 140 },
              }}
            >
              {isExportingExcel ? 'Exporting...' : 'Export to Excel'}
            </Button>,
            'Please select a date range first',
            isDisabled || (isDepartmentReport && !selectedDepartment)
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};
