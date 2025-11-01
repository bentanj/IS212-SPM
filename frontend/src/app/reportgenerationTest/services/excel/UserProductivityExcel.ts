// src/services/excel/UserProductivityExcel.ts
import type { UserProductivityReport } from '@/types/report.types';
import { generateExcel } from './ExcelGenerator';

/**
 * Export User Productivity Report to Excel
 */
export function exportUserProductivityToExcel(
  report: UserProductivityReport
): void {
  // Get team members data (handle empty case)
  const teamMembers = report.data?.team_members || [];

  // Sort by completion rate (descending) only if there are members
  const sortedMembers = teamMembers.length > 0 
    ? [...teamMembers].sort((a, b) => b.completion_rate - a.completion_rate)
    : [];

  // Build array of objects
  const excelData = [];

  // Summary Statistics section
  excelData.push({ section_header: 'Summary Statistics', metric: '', value: '' });
  excelData.push({ section_header: '', metric: 'Total Users', value: (report.summary.total_users || 0).toString() });
  excelData.push({ section_header: '', metric: 'Total Tasks Assigned', value: (report.summary.total_tasks_assigned || 0).toString() });
  excelData.push({ section_header: '', metric: 'Total Completed', value: (report.summary.total_completed || 0).toString() });
  excelData.push({ section_header: '', metric: 'Average Completion Rate', value: `${(report.summary.average_completion_rate || 0).toFixed(1)}%` });

  // Blank row
  excelData.push({ section_header: '', metric: '', value: '' });

  // User Statistics section
  excelData.push({ section_header: 'Detailed User Statistics', metric: '', value: '' });

  // Column headers
  excelData.push({
    section_header: '',
    metric: 'Name',
    value: 'Total Tasks',
    value_1: 'Completed',
    value_2: 'To Do',
    value_3: 'In Progress',
    value_4: 'Blocked',
    value_5: 'Completion Rate',
  });

  // User data rows (will be empty if no team members)
  sortedMembers.forEach(member => {
    const fullName = member.full_name || 
                    `${member.first_name || ''} ${member.last_name || ''}`.trim() || 
                    `User ${member.user_id}`;
    
    excelData.push({
      section_header: '',
      metric: fullName,
      value: member.total_tasks || 0,
      value_1: member.completed || 0,
      value_2: member.todo || 0,
      value_3: member.in_progress || 0,
      value_4: member.blocked || 0,
      value_5: `${(member.completion_rate || 0).toFixed(1)}%`,
    });
  });

  // Generate Excel
  const fileName = `User-Productivity-Report-${Date.now()}`;
  generateExcel(excelData, { fileName, sheetName: 'User Productivity' });
}