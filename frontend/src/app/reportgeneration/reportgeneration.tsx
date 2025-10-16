'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Container,
  Typography,
  Button,
  Chip,
  Paper,
  Alert,
  Stack,
  CircularProgress,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  People,
  CheckCircle,
  PictureAsPdf,
  TableChart,
  Timer,
  ErrorOutline,
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import html2canvas from 'html2canvas';

// Import API service and types
import { reportService, ReportServiceError } from '@/services/reportService';
import type {
  TaskCompletionReport,
  ProjectPerformanceReport,
  TeamProductivityReport,
  TaskDetail,
} from '@/types/report.types';

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
}

export default function ReportGeneration() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // API Data States
  const [taskReport, setTaskReport] = useState<TaskCompletionReport | null>(null);
  const [projectReport, setProjectReport] = useState<ProjectPerformanceReport | null>(null);
  const [teamReport, setTeamProductivityReport] = useState<TeamProductivityReport | null>(null);
  
  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const currentDate = useMemo(() => new Date().toLocaleDateString(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data from backend and return the report data
  const fetchReportData = async (reportId: string): Promise<TaskCompletionReport | ProjectPerformanceReport | TeamProductivityReport> => {
    setIsLoading(true);
    setError(null);

    try {
      if (reportId === 'task-completion-status') {
        if (taskReport) return taskReport;
        const data = await reportService.getTaskCompletionReport();
        setTaskReport(data);
        return data;
      } else if (reportId === 'project-performance') {
        if (projectReport) return projectReport;
        const data = await reportService.getProjectPerformanceReport();
        setProjectReport(data);
        return data;
      } else if (reportId === 'team-productivity') {
        if (teamReport) return teamReport;
        const data = await reportService.getTeamProductivityReport();
        setTeamProductivityReport(data);
        return data;
      }
      throw new Error('Invalid report ID');
    } catch (err) {
      const errorMessage = err instanceof ReportServiceError 
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

  // Calculate display data from API response or show placeholder
  const displayData = useMemo(() => {
    if (taskReport) {
      return {
        totalTasks: taskReport.summary.total_tasks,
        completedTasks: taskReport.summary.completed_tasks,
        inProgressTasks: taskReport.summary.in_progress_tasks,
        toDoTasks: taskReport.summary.to_do_tasks,
        blockedTasks: taskReport.summary.blocked_tasks,
        uniqueProjects: taskReport.summary.unique_projects,
        uniqueDepartments: taskReport.summary.unique_departments,
      };
    }
    
    return {
      totalTasks: 16,
      completedTasks: 0,
      inProgressTasks: 0,
      toDoTasks: 0,
      blockedTasks: 0,
      uniqueProjects: 3,
      uniqueDepartments: 5,
    };
  }, [taskReport]);

  const reportTypes: ReportType[] = [
    {
      id: 'task-completion-status',
      title: 'Task Completion/Status Report',
      description:
        'Comprehensive overview of task completion rates, status distribution, and progress tracking across all projects. Includes breakdown by priority, department, and timeline analysis.',
      icon: <CheckCircle fontSize="large" />,
      category: 'Task Management',
      estimatedTime: '2-3 minutes',
      dataPoints: displayData.totalTasks,
    },
    {
      id: 'project-performance',
      title: 'Project Performance Analytics',
      description:
        'Detailed analysis of project performance metrics including task distribution, completion rates, team efficiency, and milestone tracking. Provides insights into project health and bottlenecks.',
      icon: <TrendingUp fontSize="large" />,
      category: 'Project Analytics',
      estimatedTime: '3-4 minutes',
      dataPoints: displayData.uniqueProjects,
    },
    {
      id: 'team-productivity',
      title: 'Team Productivity Report',
      description:
        'In-depth productivity analysis covering individual and team performance, workload distribution, task assignment patterns, and collaboration metrics across departments.',
      icon: <People fontSize="large" />,
      category: 'Team Analytics',
      estimatedTime: '2-3 minutes',
      dataPoints: displayData.uniqueDepartments,
    },
  ];

  // Helper function to create chart and return image
  const createChartImageFromDiv = async (
    chartConfig: ChartConfiguration,
    width: number = 500,
    height: number = 500
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = `${width}px`;
      tempDiv.style.height = `${height}px`;
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '20px';

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      tempDiv.appendChild(canvas);
      document.body.appendChild(tempDiv);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        document.body.removeChild(tempDiv);
        reject('Could not get canvas context');
        return;
      }

      const chart = new Chart(ctx, chartConfig);

      setTimeout(async () => {
        try {
          const capturedCanvas = await html2canvas(tempDiv, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
          });
          const imageData = capturedCanvas.toDataURL('image/png', 1.0);
          chart.destroy();
          document.body.removeChild(tempDiv);
          resolve(imageData);
        } catch (error) {
          chart.destroy();
          document.body.removeChild(tempDiv);
          reject(error);
        }
      }, 1000);
    });
  };

  const generateTaskCompletionPDF = async (report: TaskCompletionReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Task Completion Status Report', pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Summary Statistics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, yPos);
  yPos += 10;

  const summaryStats = [
    ['Total Tasks', report.summary.total_tasks.toString()],
    ['Completed', report.summary.completed_tasks.toString()],
    ['In Progress', report.summary.in_progress_tasks.toString()],
    ['To Do', report.summary.to_do_tasks.toString()],
    ['Blocked', report.summary.blocked_tasks.toString()],
    ['Completion Rate', `${report.summary.completion_rate.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryStats,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80], fontSize: 11 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Create Status Distribution Pie Chart
  const chartConfig: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Completed', 'In Progress', 'To Do', 'Blocked'],
      datasets: [{
        data: [
          report.summary.completed_tasks,
          report.summary.in_progress_tasks,
          report.summary.to_do_tasks,
          report.summary.blocked_tasks
        ],
        backgroundColor: [
          '#4CAF50',  // Completed - Green
          '#2196F3',  // In Progress - Blue
          '#FFC107',  // To Do - Yellow
          '#F44336',  // Blocked - Red
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 0 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 14 },
            padding: 15,
            boxWidth: 18,
          },
        },
        title: {
          display: true,
          text: 'Task Status Distribution',
          font: { size: 18, weight: 'bold' },
          padding: { bottom: 15 },
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 16,
          },
          formatter: (value: number, context: any) => {
            const dataset = context.chart.data.datasets[0];
            const total = dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`;
          },
        },
      },
    },
  };

  try {
    const chartImage = await createChartImageFromDiv(chartConfig, 500, 500);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Task Status Distribution', 14, yPos);
    yPos += 10;

    doc.addImage(chartImage, 'PNG', 50, yPos, 110, 110);
    yPos += 120;
  } catch (error) {
    console.error('Error creating chart:', error);
    doc.setFontSize(10);
    doc.text('Chart generation failed', 14, yPos);
    yPos += 10;
  }

  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  // Detailed Task List
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Task List', 14, yPos);
  yPos += 10;

  const tableData = report.data.tasks.map((task) => [
    task.id?.toString() || 'N/A',
    task.title?.length > 30 ? task.title.substring(0, 30) + '...' : (task.title || 'Untitled'),
    task.status || 'Unknown',
    task.priority || 'N/A',
    // NULL-SAFE: Check if projectName exists before accessing .length
    (task.projectName && task.projectName.length > 20) 
      ? task.projectName.substring(0, 20) + '...' 
      : (task.projectName || 'No Project'),
    // NULL-SAFE: Check if assignedUsers array exists and has items
    (task.assignedUsers && task.assignedUsers.length > 0)
      ? task.assignedUsers[0].name 
      : 'Unassigned',
    task.completedDate || 'N/A',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['ID', 'Title', 'Status', 'Priority', 'Project', 'Assigned To', 'Completed']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [76, 175, 80], fontSize: 9 },
    styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 50, halign: 'left' },
      2: { cellWidth: 20 },
      3: { cellWidth: 15 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`Task-Completion-Report-${Date.now()}.pdf`);
  };

  const generateProjectPerformancePDF = async (report: ProjectPerformanceReport) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Performance Analytics', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    const projectData = report.data.projects;

    // Sort by total tasks (descending)
    const sortedProjects = [...projectData].sort((a, b) => b.total_tasks - a.total_tasks);

    // Create Horizontal Stacked Bar Chart
    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: sortedProjects.map((p) => {
          // NULL-SAFE: Provide fallback for null project names
          const projectName = p.project_name || 'Unnamed Project';
          const name = projectName.length > 25 
            ? projectName.substring(0, 25) + '...' 
            : projectName;
          return name;
        }),
        datasets: [
          {
            label: 'Completed',
            data: sortedProjects.map((p) => p.completed),
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            borderWidth: 1,
          },
          {
            label: 'In Progress',
            data: sortedProjects.map((p) => p.in_progress),
            backgroundColor: '#2196F3',
            borderColor: '#2196F3',
            borderWidth: 1,
          },
          {
            label: 'To Do',
            data: sortedProjects.map((p) => p.to_do),
            backgroundColor: '#FFC107',
            borderColor: '#FFC107',
            borderWidth: 1,
          },
          {
            label: 'Blocked',
            data: sortedProjects.map((p) => p.blocked),
            backgroundColor: '#F44336',
            borderColor: '#F44336',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        animation: { duration: 0 },
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
            },
            grid: { display: true },
          },
          y: {
            stacked: true,
            ticks: {
              font: { size: 10 },
            },
            grid: { display: false },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 12 },
              padding: 10,
              boxWidth: 15,
            },
          },
          title: {
            display: true,
            text: 'Project Task Status Distribution',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 15 },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              footer: (tooltipItems: any) => {
                let total = 0;
                tooltipItems.forEach((item: any) => {
                  total += item.parsed.x;
                });
                return `Total: ${total} tasks`;
              },
            },
          },
          datalabels: {
            display: true,
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 10,
            },
            formatter: (value: number) => {
              return value > 0 ? value : '';
            },
          },
        },
      },
    };

    try {
      const chartHeight = Math.max(400, sortedProjects.length * 40);
      const chartImage = await createChartImageFromDiv(chartConfig, 700, chartHeight);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Performance Overview', 14, yPos);
      yPos += 10;

      const imageWidth = 180;
      const imageHeight = (chartHeight / 700) * imageWidth;

      doc.addImage(chartImage, 'PNG', 15, yPos, imageWidth, Math.min(imageHeight, 150));
      yPos += Math.min(imageHeight, 150) + 10;
    } catch (error) {
      console.error('Error creating chart:', error);
      doc.setFontSize(10);
      doc.text('Chart generation failed', 14, yPos);
      yPos += 10;
    }

    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    const summaryStats = [
      ['Total Projects', report.summary.total_projects.toString()],
      ['Total Tasks', report.summary.total_tasks.toString()],
      ['Total Completed', report.summary.total_completed.toString()],
      ['Average Completion Rate', `${report.summary.average_completion_rate.toFixed(1)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryStats,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80], fontSize: 11 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Project Statistics Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Project Statistics', 14, yPos);
    yPos += 10;

    const tableData = sortedProjects.map((p) => [
      p.project_name || 'Unnamed Project', // NULL-SAFE: Fallback for null project names
      p.total_tasks.toString(),
      p.completed.toString(),
      p.in_progress.toString(),
      p.to_do.toString(),
      p.blocked.toString(),
      `${p.completion_rate}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Project Name', 'Total', 'Completed', 'In Progress', 'To Do', 'Blocked', 'Rate']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [76, 175, 80],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        halign: 'center',
        cellPadding: 2,
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 },
        1: { cellWidth: 15 },
        2: { cellWidth: 20, fillColor: [232, 245, 233] },
        3: { cellWidth: 22, fillColor: [227, 242, 253] },
        4: { cellWidth: 15, fillColor: [255, 248, 225] },
        5: { cellWidth: 17, fillColor: [255, 235, 238] },
        6: { cellWidth: 18, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`Project-Performance-Report-${Date.now()}.pdf`);
  };

  const generateTeamProductivityPDF = async (report: TeamProductivityReport) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Team Productivity Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    const userData = report.data.team_members;
    
    // Sort by completion rate and take top 10
    const topUsers = [...userData]
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 10);

    // Create Team Productivity Chart
    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topUsers.map((u) => {
          const userId = u.user_id.length > 12 ? u.user_id.substring(0, 12) + '...' : u.user_id;
          return userId;
        }),
        datasets: [{
          label: 'Completion Rate (%)',
          data: topUsers.map((u) => u.completion_rate),
          backgroundColor: '#2196F3',
          borderColor: '#2196F3',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 0 },
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              },
              font: { size: 11 }
            },
            grid: { display: true }
          },
          y: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Top 10 Team Members by Completion Rate',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 15 }
          },
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'end',
            color: '#424242',
            font: { weight: 'bold', size: 10 },
            formatter: (value: number) => {
              return `${value.toFixed(1)}%`;
            }
          },
        },
      },
    };

    try {
      const chartHeight = Math.max(400, topUsers.length * 40);
      const chartImage = await createChartImageFromDiv(chartConfig, 700, chartHeight);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Team Productivity Visualization', 14, yPos);
      yPos += 10;
      
      const imageWidth = 180;
      const imageHeight = (chartHeight / 700) * imageWidth;
      doc.addImage(chartImage, 'PNG', 15, yPos, imageWidth, Math.min(imageHeight, 150));
      yPos += Math.min(imageHeight, 150) + 10;
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Add new page if needed
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    const summaryStats = [
      ['Total Team Members', report.summary.total_team_members.toString()],
      ['Total Tasks Assigned', report.summary.total_tasks_assigned.toString()],
      ['Total Completed', report.summary.total_completed.toString()],
      ['Average Completion Rate', `${report.summary.average_completion_rate.toFixed(1)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryStats,
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243], fontSize: 11 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Detailed User Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Team Member Statistics', 14, yPos);
    yPos += 10;

    const tableData = userData.map((u) => [
      u.user_id,
      u.total_tasks.toString(),
      u.completed.toString(),
      u.in_progress.toString(),
      `${u.completion_rate.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['User ID', 'Total Tasks', 'Completed', 'In Progress', 'Completion Rate']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [33, 150, 243], fontSize: 9 },
      styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25, fillColor: [232, 245, 233] },
        3: { cellWidth: 25, fillColor: [227, 242, 253] },
        4: { cellWidth: 30, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`Team-Productivity-Report-${Date.now()}.pdf`);
  };


  const handleExportReport = async (reportId: string, type: 'pdf' | 'excel') => {
    setSelectedReport(reportId);
    setExportType(type);

    try {
      // Fetch data from backend and wait for response
      const reportData = await fetchReportData(reportId);
      
      // Small delay for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (type === 'pdf') {
        switch (reportId) {
          case 'task-completion-status':
            await generateTaskCompletionPDF(reportData as TaskCompletionReport);
            break;
          case 'project-performance':
            await generateProjectPerformancePDF(reportData as ProjectPerformanceReport);
            break;
          case 'team-productivity':
            await generateTeamProductivityPDF(reportData as TeamProductivityReport);
            break;
        }
      } else {
        console.log('Excel export for:', reportId);
        alert('Excel export will be implemented next!');
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setSelectedReport(null);
      setExportType(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Task Management': 'primary',
      'Project Analytics': 'success',
      'Team Analytics': 'info',
    };
    return colors[category] || 'default';
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Error Snackbar */}
        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowError(false)} 
            severity="error" 
            sx={{ width: '100%' }}
            icon={<ErrorOutline />}
          >
            {error}
          </Alert>
        </Snackbar>

        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: '#ffffff',
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: 2, 
            mb: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Typography 
            variant={isMobile ? 'h4' : isTablet ? 'h3' : 'h3'} 
            sx={{ 
              color: '#667eea', 
              fontWeight: 'bold', 
              mb: { xs: 0.5, sm: 1 }
            }}
          >
            Reports Dashboard
          </Typography>
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            sx={{ 
              color: '#424242', 
              mb: { xs: 1, sm: 2 },
              fontWeight: 500
            }}
          >
            Welcome, Sarah Davis (Admin)
          </Typography>
          <Typography 
            variant={isMobile ? 'body2' : 'body1'} 
            sx={{ color: 'text.secondary' }}
          >
            Generate comprehensive reports and analytics to gain insights into task management,
            team performance, and organizational productivity.
          </Typography>
        </Paper>

        {/* Loading Alert */}
        {selectedReport && exportType && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            {isLoading ? (
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center"
                sx={{ width: '100%' }}
              >
                <CircularProgress size={20} />
                <Typography variant="body2">Loading data from backend...</Typography>
              </Stack>
            ) : (
              <Typography variant="body2">
                Exporting to {exportType === 'pdf' ? 'PDF' : 'Excel'}... This may take a few moments.
              </Typography>
            )}
          </Alert>
        )}

        {/* Reports Section */}
        <Typography 
          variant={isMobile ? 'h6' : 'h5'} 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            fontWeight: 600, 
            color: '#424242' 
          }}
        >
          Available Reports
        </Typography>

        <Stack spacing={{ xs: 2, sm: 3 }}>
          {reportTypes.map((report) => (
            <Card 
              key={report.id} 
              elevation={1}
              sx={{ 
                bgcolor: '#ffffff',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { 
                  boxShadow: 4,
                  borderColor: 'primary.light'
                }, 
                transition: 'all 0.3s'
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 2, sm: 2 }} 
                  alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      bgcolor: `${getCategoryColor(report.category)}.50`, 
                      color: `${getCategoryColor(report.category)}.main`,
                      display: 'inline-flex',
                      alignSelf: { xs: 'flex-start', sm: 'flex-start' }
                    }}
                  >
                    {report.icon}
                  </Paper>

                  <Stack flex={1} spacing={{ xs: 1, sm: 1.5 }} sx={{ width: '100%' }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      justifyContent="space-between" 
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                    >
                      <Typography 
                        variant={isMobile ? 'subtitle1' : 'h6'} 
                        fontWeight="600"
                        sx={{ wordBreak: 'break-word' }}
                      >
                        {report.title}
                      </Typography>
                      <Chip 
                        label={report.category} 
                        color={getCategoryColor(report.category) as any} 
                        size="small"
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      />
                    </Stack>

                    <Typography 
                      variant={isMobile ? 'body2' : 'body2'} 
                      color="text.secondary"
                      sx={{ 
                        display: { xs: 'none', sm: 'block' },
                        lineHeight: 1.6
                      }}
                    >
                      {report.description}
                    </Typography>

                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: { xs: 'block', sm: 'none' },
                        lineHeight: 1.5
                      }}
                    >
                      {report.description.substring(0, 120)}...
                    </Typography>

                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={{ xs: 1, sm: 2 }} 
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Chip 
                        icon={<Timer fontSize="small" />} 
                        label={report.estimatedTime} 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {report.dataPoints} data points
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>

              <CardActions 
                sx={{ 
                  justifyContent: { xs: 'stretch', sm: 'flex-end' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 },
                  px: { xs: 2, sm: 2 }, 
                  pb: { xs: 2, sm: 2 }
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdf />}
                  onClick={() => handleExportReport(report.id, 'pdf')}
                  disabled={selectedReport === report.id && exportType === 'pdf'}
                  fullWidth={isMobile}
                  sx={{ 
                    py: { xs: 1, sm: 1.25 }, 
                    fontSize: { xs: '0.875rem', sm: '0.938rem' },
                    minWidth: { sm: 140 }
                  }}
                >
                  {selectedReport === report.id && exportType === 'pdf' ? 'Exporting...' : 'Export to PDF'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TableChart />}
                  onClick={() => handleExportReport(report.id, 'excel')}
                  disabled={selectedReport === report.id && exportType === 'excel'}
                  fullWidth={isMobile}
                  sx={{ 
                    py: { xs: 1, sm: 1.25 }, 
                    fontSize: { xs: '0.875rem', sm: '0.938rem' },
                    minWidth: { sm: 140 }
                  }}
                >
                  {selectedReport === report.id && exportType === 'excel' ? 'Exporting...' : 'Export to Excel'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>

        {/* Footer Info */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: { xs: 3, sm: 4 }, 
            p: { xs: 2, sm: 2 }, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography 
            variant={isMobile ? 'caption' : 'body2'} 
            color="text.secondary" 
            textAlign="center"
            sx={{ lineHeight: 1.6 }}
          >
            Reports are generated based on current task data ({displayData.totalTasks} tasks, {displayData.uniqueProjects}{' '}
            projects, {displayData.uniqueDepartments} departments). All data is current as of {currentDate}.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
