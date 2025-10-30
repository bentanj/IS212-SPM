// src/services/excel/ProjectPerformanceExcel.ts
import type { ProjectPerformanceReport } from '@/types/report.types';
import { generateExcel } from './ExcelGenerator';

/**
 * Export Project Performance Report to Excel
 */
export function exportProjectPerformanceToExcel(
  report: ProjectPerformanceReport
): void {
  // Get projects data (handle empty case)
  const projects = report.data.projects || [];

  // Sort projects by total tasks (descending) only if there are projects
  const sortedProjects = projects.length > 0
    ? [...projects].sort((a, b) => b.total_tasks - a.total_tasks)
    : [];

  // Build array of objects
  const excelData = [];

  // Summary Statistics section
  excelData.push({ section_header: 'Summary Statistics', metric: '', value: '' });
  excelData.push({ section_header: '', metric: 'Total Projects', value: (report.summary.total_projects || 0).toString() });
  excelData.push({ section_header: '', metric: 'Total Tasks', value: (report.summary.total_tasks || 0).toString() });
  excelData.push({ section_header: '', metric: 'Total Completed', value: (report.summary.total_completed || 0).toString() });
  excelData.push({ section_header: '', metric: 'Average Completion Rate', value: `${(report.summary.average_completion_rate || 0).toFixed(1)}%` });

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
  
  // Add project data rows (will be empty if no projects)
  sortedProjects.forEach(project => {
    excelData.push({
      section_header: '',
      metric: project.project_name || 'Unnamed Project',
      value: project.total_tasks || 0,
      value_1: project.completed || 0,
      value_2: project.to_do || 0,
      value_3: project.in_progress || 0,
      value_4: project.blocked || 0,
      value_5: `${(project.completion_rate || 0).toFixed(1)}%`,
    });
  });

  // Generate Excel
  const fileName = `Project-Performance-Report-${Date.now()}`;
  generateExcel(excelData, { fileName, sheetName: 'Project Performance' });
}