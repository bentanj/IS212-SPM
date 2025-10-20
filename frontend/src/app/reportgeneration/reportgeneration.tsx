// src/app/reportgeneration/reportgeneration.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { Assessment } from '@mui/icons-material';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import dayjs, { Dayjs } from 'dayjs';

// Import API service and types
import { reportService, ReportServiceError } from '@/services/reportService';
import type {
  ProjectPerformanceReport,
  TeamProductivityReport,
} from '@/types/report.types';

// Import components
import { ReportCard } from './_components/ReportCard';
import { ReportHeader } from './_components/ReportHeader';
import { ErrorNotification } from './_components/ErrorNotification';
import { LoadingIndicator } from './_components/LoadingIndicator';
import { ReportFooter } from './_components/ReportFooter';
import { DateRangePicker } from './_components/DateRangePicker';
import { ReportTypeSelector } from './_components/ReportTypeSelector';

// Import PDF services
import {
  ProjectPerformancePDF,
  TeamProductivityPDF,
} from './services/pdf';

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
  const [teamReport, setTeamProductivityReport] = useState<TeamProductivityReport | null>(null);

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const currentDate = useMemo(() => new Date().toLocaleDateString(), []);

  // Check if date range is valid - FIXED: Better validation
  const isDateRangeValid = useMemo(() => {
    // Check if both dates exist and are valid Dayjs objects
    const isStartValid = startDate && dayjs(startDate).isValid();
    const isEndValid = endDate && dayjs(endDate).isValid();
    
    console.log('Date validation:', { 
      startDate: startDate?.format('YYYY-MM-DD'), 
      endDate: endDate?.format('YYYY-MM-DD'),
      isStartValid,
      isEndValid
    });
    
    return isStartValid && isEndValid;
  }, [startDate, endDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from backend with date range
  const fetchReportData = async (
    subType: ReportSubType
  ): Promise<ProjectPerformanceReport | TeamProductivityReport> => {
    setIsLoading(true);
    setError(null);

    try {
      // Format dates for API call
      const startDateStr = startDate!.format('YYYY-MM-DD');
      const endDateStr = endDate!.format('YYYY-MM-DD');
      
      let data;
      
      if (subType === 'per-project') {
        data = await reportService.getProjectPerformanceReport(startDateStr, endDateStr);
        setProjectReport(data);
        return data;
      } else if (subType === 'per-user') {
        data = await reportService.getTeamProductivityReport(startDateStr, endDateStr);
        setTeamProductivityReport(data);
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
  ];

  // Generate date range string for PDF
  const getDateRangeString = (): string => {
    if (!startDate || !endDate) return '';
    return `Filtered: ${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')}`;
  };

  // Handle Report Type Selection
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
          console.log('5. Calling TeamProductivityPDF.generate...');
          await TeamProductivityPDF.generate(
            reportData as TeamProductivityReport,
            currentDate,
            dateRangeStr
          );
        }
        console.log('6. PDF generated successfully!');
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


  // Handle export button click - validate date range first
  const handleExportClick = (type: 'pdf' | 'excel') => {
    console.log('Export clicked. Date range valid:', isDateRangeValid);
    
    // Validate date range
    if (!isDateRangeValid) {
      setShowDateValidation(true);
      setError('Please select both start and end dates before generating a report.');
      setShowError(true);
      
      // Scroll to date picker
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Reset validation state
    setShowDateValidation(false);
    
    // Proceed with export
    setPendingExportType(type);
    setShowReportTypeDialog(true);
  };

  // Helper function for category colors
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Task Analytics': 'primary',
    };
    return colors[category] || 'default';
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        {/* Error Notification */}
        <ErrorNotification
          error={error}
          showError={showError}
          onClose={() => {
            setShowError(false);
            setShowDateValidation(false);
          }}
        />

        {/* Header Section */}
        <ReportHeader />

        {/* Date Range Picker */}
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

        {/* Loading Indicator */}
        <LoadingIndicator
          selectedReport={selectedReport}
          exportType={exportType}
          isLoading={isLoading}
        />

        {/* Reports Section */}
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
                onExportPDF={() => handleExportClick('pdf')}
                onExportExcel={() => handleExportClick('excel')}
                getCategoryColor={getCategoryColor}
                hasDateFilter={isDateRangeValid || false}
                isDisabled={!isDateRangeValid}
              />
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
        <ReportFooter
          totalTasks={displayData.totalTasks}
          uniqueProjects={displayData.uniqueProjects}
          uniqueDepartments={displayData.uniqueDepartments}
          currentDate={currentDate}
        />

        {/* Report Type Selection Dialog */}
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
