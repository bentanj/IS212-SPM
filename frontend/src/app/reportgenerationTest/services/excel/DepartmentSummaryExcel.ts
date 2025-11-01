// src/services/excel/DepartmentTaskActivityExcel.ts
import type { DepartmentTaskActivityReport } from '@/types/report.types';
import { generateExcel } from './ExcelGenerator';

/**
 * Export Department Task Activity Report to Excel
 */
export function exportDepartmentTaskActivityToExcel(
  report: DepartmentTaskActivityReport
): void {
  // Validate data
  const data = report.data;
  const summary = report.summary;
  
  if (!data) {
    alert('No department data available to export');
    return;
  }

  // Build array of objects
  const excelData = [];

  // Department Info section
  excelData.push({ section_header: 'Department Information', metric: '', value: '' });
  excelData.push({ section_header: '', metric: 'Department', value: data.department });
  excelData.push({ section_header: '', metric: 'Aggregation', value: data.aggregation === 'weekly' ? 'Weekly' : 'Monthly' });
  
  // Get date range from metadata.parameters if summary doesn't have it
  const startDate = summary.date_range?.start_date || report.metadata.parameters?.start_date || 'N/A';
  const endDate = summary.date_range?.end_date || report.metadata.parameters?.end_date || 'N/A';
  excelData.push({ section_header: '', metric: 'Date Range', value: `${startDate} to ${endDate}` });

  // Blank row
  excelData.push({ section_header: '', metric: '', value: '' });

  // Summary Statistics section
  excelData.push({ section_header: 'Summary Statistics', metric: '', value: '' });
  excelData.push({ section_header: '', metric: 'Total Tasks', value: summary.total_tasks.toString() });
  excelData.push({ section_header: '', metric: 'To Do', value: summary.status_totals.to_do.toString() });
  excelData.push({ section_header: '', metric: 'In Progress', value: summary.status_totals.in_progress.toString() });
  excelData.push({ section_header: '', metric: 'Blocked', value: summary.status_totals.blocked.toString() });
  excelData.push({ section_header: '', metric: 'Completed', value: summary.status_totals.completed.toString() });
  excelData.push({ section_header: '', metric: 'Overdue', value: summary.status_totals.overdue.toString() });

  // Blank row
  excelData.push({ section_header: '', metric: '', value: '' });

  // Detailed breakdown section
  if (data.aggregation === 'weekly' && data.weekly_data && data.weekly_data.length > 0) {
    excelData.push({ section_header: 'Detailed Weekly Breakdown', metric: '', value: '' });
    
    // Column headers
    excelData.push({
      section_header: '',
      metric: 'Week',
      value: 'To Do',
      value_1: 'In Progress',
      value_2: 'Blocked',
      value_3: 'Completed',
      value_4: 'Overdue',
    });

    // Weekly data rows
    data.weekly_data.forEach(week => {
      const weekLabel = `${new Date(week.week_start).toLocaleDateString()} - ${new Date(week.week_end).toLocaleDateString()}`;
      excelData.push({
        section_header: '',
        metric: weekLabel,
        value: week.to_do,
        value_1: week.in_progress,
        value_2: week.blocked,
        value_3: week.completed,
        value_4: week.overdue,
      });
    });
  } else if (data.aggregation === 'monthly' && data.monthly_data && data.monthly_data.length > 0) {
    excelData.push({ section_header: 'Detailed Monthly Breakdown', metric: '', value: '' });
    
    // Column headers
    excelData.push({
      section_header: '',
      metric: 'Month',
      value: 'To Do',
      value_1: 'In Progress',
      value_2: 'Blocked',
      value_3: 'Completed',
      value_4: 'Overdue',
    });

    // Monthly data rows
    data.monthly_data.forEach(month => {
      excelData.push({
        section_header: '',
        metric: month.month_name,
        value: month.to_do,
        value_1: month.in_progress,
        value_2: month.blocked,
        value_3: month.completed,
        value_4: month.overdue,
      });
    });
  }

  // Optional: Department Team Members section
  if (data.users && data.users.length > 0) {
    // Blank row
    excelData.push({ section_header: '', metric: '', value: '' });
    
    excelData.push({ section_header: 'Department Team Members', metric: '', value: '' });
    excelData.push({ section_header: '', metric: 'Total Users', value: data.users.length.toString() });
    
    // // Blank row
    // excelData.push({ section_header: '', metric: '', value: '' });
    
    // Column headers for users
    excelData.push({
      section_header: '',
      metric: '#',
      value: 'Name',
      value_1: 'Email',
    });

    // User data rows
    data.users.forEach((user, index) => {
      excelData.push({
        section_header: '',
        metric: (index + 1).toString(),
        value: user.full_name,
        value_1: user.email || 'N/A',
      });
    });
  }

  // Generate Excel
  const fileName = `Department-Task-Activity-${data.department.replace(/\s+/g, '-')}-${Date.now()}`;
  generateExcel(excelData, { fileName, sheetName: 'Department Activity' });
}