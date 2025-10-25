// src/app/reportgeneration/_components/ReportCard.tsx
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
import { ReportService } from '@/services/reportService';

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
  reportType?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  isExportingPDF,
  isExportingExcel,
  onExportPDF,
  onExportExcel,
  getCategoryColor,
  hasDateFilter = false,
  isDisabled = false,
  reportType,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for Department Task Activity Report
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAggregation, setSelectedAggregation] = useState('weekly');
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Check if this is a department report
  const isDepartmentReport = reportType === 'department-activity' || report.id === 'department-activity';

  // Fetch departments when component mounts and is department report
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!isDepartmentReport) return;

      setLoadingDepartments(true);
      try {
        const reportService = new ReportService();
        const fetchedDepartments = await reportService.getDepartments();
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error('Failed to load departments:', error);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [isDepartmentReport]);

  // Handle department dropdown change
  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setSelectedDepartment(event.target.value);
  };

  // Handle aggregation dropdown change
  const handleAggregationChange = (event: SelectChangeEvent) => {
    setSelectedAggregation(event.target.value);
  };

  // Enhanced button rendering with department validation
  const renderButton = (
    button: React.ReactElement,
    tooltipText: string,
    disabled: boolean
  ) => {
    const needsDepartment = isDepartmentReport && !selectedDepartment;
    const finalDisabled = disabled || needsDepartment;
    const finalTooltip = needsDepartment ? 'Please select a department' : tooltipText;

    if (finalDisabled && (isDisabled || needsDepartment)) {
      return (
        <Tooltip title={finalTooltip} arrow>
          <span>{button}</span>
        </Tooltip>
      );
    }

    return button;
  };

  // Handle export with department params
  const handleExportPDF = () => {
    if (isDepartmentReport) {
      if (!selectedDepartment) {
        return;
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
        return;
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
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        opacity: isDisabled ? 0.6 : 1,
        '&:hover': {
          boxShadow: isDisabled ? 3 : 6,
          transform: isDisabled ? 'none' : 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: `${getCategoryColor(report.category)}15`,
                color: getCategoryColor(report.category),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDisabled ? <LockOutlined fontSize="large" /> : report.icon}
            </Box>
            <Box flex={1}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 0.5 }}>
                {report.title}
              </Typography>
              <Chip
                label={report.category}
                size="small"
                sx={{
                  bgcolor: `${getCategoryColor(report.category)}15`,
                  color: getCategoryColor(report.category),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {report.description.length > 120 ? (
              <Tooltip title={report.description} arrow>
                <span>{report.description.substring(0, 120)}...</span>
              </Tooltip>
            ) : (
              report.description
            )}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip icon={<Timer />} label={report.estimatedTime} size="small" variant="outlined" />
            {hasDateFilter && (
              <Chip label="Date Range Available" size="small" color="primary" variant="outlined" />
            )}
            {report.hasSubTypes && (
              <Chip label="Multiple Types" size="small" color="secondary" variant="outlined" />
            )}
          </Stack>

          {/* Department Report Dropdowns */}
          {isDepartmentReport && !isDisabled && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Department Dropdown */}
              <FormControl fullWidth size="small" required>
                <InputLabel>Department *</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  label="Department *"
                  disabled={loadingDepartments}
                >
                  {loadingDepartments ? (
                    <MenuItem disabled>Loading departments...</MenuItem>
                  ) : departments.length === 0 ? (
                    <MenuItem disabled>No departments found</MenuItem>
                  ) : (
                    [
                      <MenuItem key="empty" value="">Select Department</MenuItem>,
                      ...departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))
                    ]
                  )}
                </Select>
              </FormControl>

              {/* Aggregation Dropdown */}
              <FormControl fullWidth size="small">
                <InputLabel>Aggregation</InputLabel>
                <Select
                  value={selectedAggregation}
                  onChange={handleAggregationChange}
                  label="Aggregation"
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>

              {/* Department Selection Indicator */}
              {!selectedDepartment && (
                <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                  Please select a department to enable export
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
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
