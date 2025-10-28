// src/services/excel/ProjectPerformanceExcel.ts
import type { ProjectPerformanceReport } from '@/types/report.types';
import { generateExcel } from './ExcelGenerator';

/**
 * Export Project Performance Report to Excel
 */
export function exportProjectPerformanceToExcel(
  report: ProjectPerformanceReport
): void {
  // Validate data
  if (!report.data.projects || report.data.projects.length === 0) {
    alert('No project data available to export');
    return;
  }

  // Sort projects by total tasks (descending)
  const sortedProjects = [...report.data.projects].sort((a, b) => b.total_tasks - a.total_tasks);

  // Build array of objects
  const excelData = [];

  // Summary Statistics section
  excelData.push({ section_header: 'Summary Statistics', metric: '', value: '' });
  excelData.push({ section_header: '', metric: 'Total Projects', value: report.summary.total_projects.toString() });
  excelData.push({ section_header: '', metric: 'Total Tasks', value: report.summary.total_tasks.toString() });
  excelData.push({ section_header: '', metric: 'Total Completed', value: report.summary.total_completed.toString() });
  excelData.push({ section_header: '', metric: 'Average Completion Rate', value: `${report.summary.average_completion_rate.toFixed(1)}%` });

  // Blank row
  excelData.push({ section_header: '', metric: '', value: '' });

  // Project Statistics section header
  excelData.push({ section_header: 'Detailed Project Statistics', metric: '', value: '' });
  
  // Column headers - using metric and value columns
  excelData.push({ 
    section_header: '', 
    metric: 'Project Name', 
    value: 'Total Tasks',
    value_1: 'Completed',
    value_2: 'To Do', 
    value_3: 'In Progress',
    value_4: 'Blocked',
    value_5: 'Completion Rate'
  });
  
  // Add project data rows
  sortedProjects.forEach(project => {
    excelData.push({
      section_header: '',
      metric: project.project_name || 'Unnamed Project',
      value: project.total_tasks,
      value_1: project.completed,
      value_2: project.to_do,
      value_3: project.in_progress,
      value_4: project.blocked,
      value_5: `${project.completion_rate}%`,
    });
  });

  // Generate Excel
  const fileName = `Project-Performance-Report-${Date.now()}`;
  generateExcel(excelData, { fileName, sheetName: 'Project Performance' });
}