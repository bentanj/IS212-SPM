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

  // Project Statistics section
  excelData.push({ section_header: 'Detailed Project Statistics', metric: '', value: '' });
  sortedProjects.forEach(project => {
    excelData.push({
      project_name: project.project_name || 'Unnamed Project',
      total_tasks: project.total_tasks,
      completed: project.completed,
      to_do: project.to_do,
      in_progress: project.in_progress,
      blocked: project.blocked,
      completion_rate: `${project.completion_rate}%`,
    });
  });

  // Generate Excel
  const fileName = `Project-Performance-Report-${Date.now()}`;
  generateExcel(excelData, { fileName, sheetName: 'Project Performance' });
}