// src/app/reportgeneration/reportgeneration.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { Assessment, Business } from '@mui/icons-material';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import dayjs, { Dayjs } from 'dayjs';

// Import API service and types
import { reportService, ReportServiceError } from '@/services/reportService';
import type {
  ProjectPerformanceReport,
  UserProductivityReport,
  DepartmentTaskActivityReport,
} from '@/types/report.types';

// Import components
import { ReportCard } from './_components/ReportCard';
import { ReportHeader } from './_components/ReportHeader';
import { ErrorNotification } from './_components/ErrorNotification';
import { LoadingIndicator } from './_components/LoadingIndicator';
import { ReportFooter } from './_components/ReportFooter';
import { DateRangePicker } from './_components/DateRangePicker';
import { ReportTypeSelector } from './_components/ReportTypeSelector';
import { LoggedTimeReportCard } from './_components/LoggedTimeReportCard';

// Import PDF services
import {
  ProjectPerformancePDF,
  UserProductivityPDF,
  DepartmentTaskActivityPDF,
} from './services/pdf';
import { LoggedTimeReportPDF } from './services/pdf/LoggedTimeReportPDF';

// Import mock logged time data
import { mockLoggedTimeData } from '../../mocks/report/loggedTimeMockData'

// Import organization departments
import { ALL_DEPARTMENTS } from '../../constants/Organisation';

// Import excel generator adapter functions
import { exportLoggedTimeToExcel } from './services/excel/LoggedTimeReportExcel'
import { exportProjectPerformanceToExcel } from './services/excel/ProjectPerformanceExcel';
import { exportUserProductivityToExcel } from './services/excel/UserProductivityExcel';
import { exportDepartmentTaskActivityToExcel } from './services/excel/DepartmentSummaryExcel';

// Register Chart.js components
Chart.register(...registerables, ChartDataLabels);

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  estimatedTime: string;
  dataPoints: number;
  hasSubTypes?: boolean;
}

type ReportSubType = 'per-user' | 'per-project' | null;

export default function ReportGeneration() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showReportTypeDialog, setShowReportTypeDialog] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<'pdf' | 'excel' | null>(null);
  const [showDateValidation, setShowDateValidation] = useState(false);

  // Date filter state
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // API Data States
  const [projectReport, setProjectReport] = useState<ProjectPerformanceReport | null>(null);
  const [userReport, setUserProductivityReport] = useState<UserProductivityReport | null>(null);
  const [departmentReport, setDepartmentReport] = useState<DepartmentTaskActivityReport | null>(null);

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const currentDate = useMemo(() => new Date().toLocaleDateString(), []);

  // Check if date range is valid
  const isDateRangeValid = useMemo(() => {
    const isStartValid = startDate && dayjs(startDate).isValid();
    const isEndValid = endDate && dayjs(endDate).isValid();

    console.log('Date validation:', {
      startDate: startDate?.format('YYYY-MM-DD'),
      endDate: endDate?.format('YYYY-MM-DD'),
      isStartValid,
      isEndValid,
    });

    return isStartValid && isEndValid;
  }, [startDate, endDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from backend with date range (for task-completion reports)
  const fetchReportData = async (
    subType: ReportSubType
  ): Promise<ProjectPerformanceReport | UserProductivityReport> => {
    setIsLoading(true);
    setError(null);

    try {
      const startDateStr = startDate!.format('YYYY-MM-DD');
      const endDateStr = endDate!.format('YYYY-MM-DD');

      let data;

      if (subType === 'per-project') {
        data = await reportService.getProjectPerformanceReport(startDateStr, endDateStr);
        setProjectReport(data);
        return data;
      } else if (subType === 'per-user') {
        data = await reportService.getUserProductivityReport(startDateStr, endDateStr);
        setUserProductivityReport(data);
        return data;
      }

      throw new Error('Invalid report sub-type');
    } catch (err) {
      const errorMessage =
        err instanceof ReportServiceError
          ? err.message
          : 'Failed to connect to reports service. Please ensure the backend is running.';
      setError(errorMessage);
      setShowError(true);
      console.error('Error fetching report data:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch department report
  const fetchDepartmentReport = async (
    department: string,
    aggregation: string
  ): Promise<DepartmentTaskActivityReport> => {
    setIsLoading(true);
    setError(null);

    try {
      const startDateStr = startDate!.format('YYYY-MM-DD');
      const endDateStr = endDate!.format('YYYY-MM-DD');

      const data = await reportService.getDepartmentTaskActivityReport(
        department,
        aggregation as 'weekly' | 'monthly',
        startDateStr,
        endDateStr
      );

      setDepartmentReport(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof ReportServiceError
          ? err.message
          : 'Failed to fetch department report. Please ensure the backend is running.';
      setError(errorMessage);
      setShowError(true);
      console.error('Error fetching department report:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate display data
  const displayData = useMemo(() => {
    if (projectReport) {
      return {
        totalTasks: projectReport.summary.total_tasks,
        uniqueProjects: projectReport.summary.total_projects,
        uniqueDepartments: 5,
      };
    }

    return {
      totalTasks: 16,
      uniqueProjects: 3,
      uniqueDepartments: 5,
    };
  }, [projectReport]);

  // Report types configuration
  const reportTypes: ReportType[] = [
    {
      id: 'task-completion',
      title: 'Task Completion Report',
      description:
        'Comprehensive task completion analytics with options for per-user productivity tracking or per-project performance analysis. Select your preferred view when exporting.',
      icon: <Assessment sx={{ fontSize: 28 }} />,
      category: 'Task Analytics',
      estimatedTime: '2-4 minutes',
      dataPoints: displayData.totalTasks,
      hasSubTypes: true,
    },
    {
      id: 'department-activity',
      title: 'Department Task Activity',
      description:
        'Track department task activity with weekly or monthly aggregation. View task status breakdowns including To Do, In Progress, Blocked, Completed, and Overdue counts.',
      icon: <Business sx={{ fontSize: 28 }} />,
      category: 'Department Analytics',
      estimatedTime: '2-3 minutes',
      dataPoints: 1500,
      hasSubTypes: false,
    },
  ];

  // Generate date range string for PDF
  const getDateRangeString = (): string => {
    if (!startDate || !endDate) return '';
    return `Filtered: ${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')}`;
  };

  // Handle Report Type Selection (for task-completion)
  const handleReportTypeSelection = async (subType: ReportSubType) => {
    console.log('1. Report type selected:', subType);

    if (!subType || !pendingExportType) return;

    setSelectedReport('task-completion');
    setExportType(pendingExportType);

    try {
      console.log('2. Fetching report data...');
      const reportData = await fetchReportData(subType);
      console.log('3. Report data received:', reportData);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate PDF
      if (pendingExportType === 'pdf') {
        const dateRangeStr = getDateRangeString();
        console.log('4. Generating PDF...', { subType, dateRangeStr });

        if (subType === 'per-project') {
          await ProjectPerformancePDF.generate(
            reportData as ProjectPerformanceReport,
            currentDate,
            dateRangeStr
          );
        } else if (subType === 'per-user') {
          console.log('5. Calling UserProductivityPDF.generate...');
          await UserProductivityPDF.generate(
            reportData as UserProductivityReport,
            currentDate,
            dateRangeStr
          );
        }
        console.log('6. PDF generated successfully!');
      }
      
      // Generate Excel
      if (pendingExportType === 'excel') {
        console.log('4. Generating Excel...', { subType });
        
        if (subType === 'per-project') {
          exportProjectPerformanceToExcel(reportData as ProjectPerformanceReport);
        } else if (subType === 'per-user') {
          exportUserProductivityToExcel(reportData as UserProductivityReport);
        }
        console.log('5. Excel generated successfully!');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSelectedReport(null);
      setExportType(null);
      setPendingExportType(null);
      setShowDateValidation(false);
    }
  };

  // Handle export button click for task-completion (opens dialog)
  const handleExportClick = (type: 'pdf' | 'excel') => {
    console.log('Export clicked. Date range valid:', isDateRangeValid);

    if (!isDateRangeValid) {
      setShowDateValidation(true);
      setError('Please select both start and end dates before generating a report.');
      setShowError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setShowDateValidation(false);
    setPendingExportType(type);
    setShowReportTypeDialog(true);
  };

  // Handle department export
  const handleDepartmentExport = async (
    type: 'pdf' | 'excel',
    params: { department: string; aggregation: string }
  ) => {
    console.log('Department export:', { type, params });

    if (!isDateRangeValid) {
      setError('Please select both start and end dates before generating a report.');
      setShowError(true);
      return;
    }

    setSelectedReport('department-activity');
    setExportType(type);

    try {
      const reportData = await fetchDepartmentReport(params.department, params.aggregation);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (type === 'pdf') {
        const dateRangeStr = getDateRangeString();
        await DepartmentTaskActivityPDF.generate(reportData, currentDate, dateRangeStr);
      } else if (type === 'excel') {
        exportDepartmentTaskActivityToExcel(reportData);
      }
    } catch (err) {
      console.error('Department export failed:', err);
    } finally {
      setSelectedReport(null);
      setExportType(null);
    }
  };

  // Get unique projects from mock logged time data
  const getProjects = (): string[] => {
    const projects = Array.from(new Set(mockLoggedTimeData.map(entry => entry.projectName))).sort();
    return projects;
  };

  // Get unique departments
  const getDepartments = (): string[] => {
    return ALL_DEPARTMENTS;
  };

  // Handle Logged Time Report PDF export
  const handleLoggedTimeExportPDF = async (
    filterType: 'department' | 'project',
    filterValue: string
  ) => {
    console.log('Exporting Logged Time Report PDF:', { filterType, filterValue });
    
    if (!isDateRangeValid) {
      setError('Please select both start and end dates before generating a report.');
      setShowError(true);
      return;
    }

    setSelectedReport('logged-time');
    setExportType('pdf');
    
    try {
      await LoggedTimeReportPDF.generate(
        mockLoggedTimeData,
        startDate!,
        endDate!,
        filterType,
        filterValue,
        currentDate
      );
      
      console.log('Logged Time PDF generated successfully!');
    } catch (err) {
      console.error('Logged Time PDF export failed:', err);
      setError(`Failed to export PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setShowError(true);
    } finally {
      setSelectedReport(null);
      setExportType(null);
    }
  };

  // Handle Logged Time Report Excel export
  const handleLoggedTimeExportExcel = async (
    filterType: 'department' | 'project',
    filterValue: string
  ) => {
    console.log('Exporting Logged Time Report Excel:', { filterType, filterValue });
    
    if (!isDateRangeValid) {
      setError('Please select both start and end dates before generating a report.');
      setShowError(true);
      return;
    }

    setSelectedReport('logged-time');
    setExportType('excel');
    
    try {
      exportLoggedTimeToExcel(
        mockLoggedTimeData,
        startDate!,
        endDate!,
        filterType,
        filterValue
      );
      
      console.log('Logged Time Excel generated successfully!');
    } catch (err) {
      console.error('Logged Time Excel export failed:', err);
      setError(`Failed to export Excel: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setShowError(true);
    } finally {
      setSelectedReport(null);
      setExportType(null);
    }
  };

  // Helper function for category colors
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Task Analytics': 'primary',
      'Department Analytics': 'secondary',
    };
    return colors[category] || 'default';
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        <ErrorNotification
          error={error}
          showError={showError}
          onClose={() => {
            setShowError(false);
            setShowDateValidation(false);
          }}
        />

        <ReportHeader />

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(date) => {
            console.log('Start date changed:', date?.format('YYYY-MM-DD'));
            setStartDate(date);
            setShowDateValidation(false);
          }}
          onEndDateChange={(date) => {
            console.log('End date changed:', date?.format('YYYY-MM-DD'));
            setEndDate(date);
            setShowDateValidation(false);
          }}
          showValidation={showDateValidation}
        />

        <LoadingIndicator
          selectedReport={selectedReport}
          exportType={exportType}
          isLoading={isLoading}
        />

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            mb: 3,
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          Available Reports
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {reportTypes.map((report) => (
            <Grid size={{ xs: 12 }} key={report.id}>
              <ReportCard
                report={report}
                isExportingPDF={selectedReport === report.id && exportType === 'pdf'}
                isExportingExcel={selectedReport === report.id && exportType === 'excel'}
                onExportPDF={(params?: { department: string; aggregation: string }) => {
                  if (report.id === 'department-activity' && params) {
                    handleDepartmentExport('pdf', params);
                  } else {
                    handleExportClick('pdf');
                  }
                }}
                onExportExcel={(params?: { department: string; aggregation: string }) => {
                  if (report.id === 'department-activity' && params) {
                    handleDepartmentExport('excel', params);
                  } else {
                    handleExportClick('excel');
                  }
                }}
                getCategoryColor={getCategoryColor}
                hasDateFilter={isDateRangeValid || false}
                isDisabled={!isDateRangeValid}
                reportType={report.id}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12 }}>
            <LoggedTimeReportCard
              startDate={startDate}
              endDate={endDate}
              onExportPDF={handleLoggedTimeExportPDF}
              onExportExcel={handleLoggedTimeExportExcel}
              getProjects={getProjects}
              getDepartments={getDepartments}
              isExportingPDF={selectedReport === 'logged-time' && exportType === 'pdf'}
              isExportingExcel={selectedReport === 'logged-time' && exportType === 'excel'}
            />
          </Grid>
        </Grid>

        <ReportFooter
          totalTasks={displayData.totalTasks}
          uniqueProjects={displayData.uniqueProjects}
          uniqueDepartments={displayData.uniqueDepartments}
          currentDate={currentDate}
        />

        <ReportTypeSelector
          open={showReportTypeDialog}
          onClose={() => {
            setShowReportTypeDialog(false);
            setPendingExportType(null);
          }}
          onSelectType={handleReportTypeSelection}
        />
      </Container>
    </Box>
  );
}