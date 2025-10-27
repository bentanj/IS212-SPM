// src/services/excel/TeamProductivityExcel.ts
import type { TeamProductivityReport } from '@/types/report.types';
import { generateExcel } from './ExcelGenerator';

/**
 * Export Team Productivity Report to Excel
 */
export function exportTeamProductivityToExcel(
  report: TeamProductivityReport
): void {
  // Validate data
  const teamMembers = report.data?.team_members || [];
  
  if (teamMembers.length === 0) {
    alert('No user productivity data available to export');
    return;
  }

  // Sort by completion rate (descending)
  const sortedMembers = [...teamMembers].sort((a, b) => b.completion_rate - a.completion_rate);

  // Build array of objects
  const excelData = [];

  // Summary Statistics section
  excelData.push({ section_header: 'Summary Statistics', metric: '', value: '' });
  excelData.push({ section_header: '', metric: 'Total Users', value: (report.summary.total_team_members || 0).toString() });
  excelData.push({ section_header: '', metric: 'Total Tasks Assigned', value: (report.summary.total_tasks_assigned || 0).toString() });
  excelData.push({ section_header: '', metric: 'Total Completed', value: (report.summary.total_completed || 0).toString() });
  excelData.push({ section_header: '', metric: 'Average Completion Rate', value: `${(report.summary.average_completion_rate || 0).toFixed(1)}%` });

  // Blank row
  excelData.push({ section_header: '', metric: '', value: '' });

  // Team Member Statistics section
  excelData.push({ section_header: 'Detailed Team Member Statistics', metric: '', value: '' });
  sortedMembers.forEach(member => {
    const fullName = member.full_name || 
                     `${member.first_name || ''} ${member.last_name || ''}`.trim() || 
                     `User ${member.user_id}`;
    
    excelData.push({
      name: fullName,
      total_tasks: member.total_tasks || 0,
      completed: member.completed || 0,
      to_do: member.todo || 0,
      in_progress: member.in_progress || 0,
      blocked: member.blocked || 0,
      completion_rate: `${(member.completion_rate || 0).toFixed(1)}%`,
    });
  });

  // Generate Excel
  const fileName = `Team-Productivity-Report-${Date.now()}`;
  generateExcel(excelData, { fileName, sheetName: 'Team Productivity' });
}