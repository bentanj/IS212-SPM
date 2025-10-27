// src/services/excel/LoggedTimeReportExcel.ts
import { Dayjs } from 'dayjs';
import { LoggedTimeEntry, UserTimeStats } from '@/types/report.types';
import { generateExcel } from './ExcelGenerator';

/**
 * Export Logged Time Report to Excel
 */
export function exportLoggedTimeToExcel(
  allEntries: LoggedTimeEntry[],
  startDate: Dayjs,
  endDate: Dayjs,
  filterType: 'department' | 'project',
  filterValue: string
): void {
  // 1. Filter entries
  const filteredEntries = filterEntries(allEntries, startDate, endDate, filterType, filterValue);
  
  if (filteredEntries.length === 0) {
    alert(`No data found for ${filterType}: ${filterValue}`);
    return;
  }

  // 2. Calculate statistics
  const userStats = calculateUserStats(filteredEntries);
  const totalHours = userStats.reduce((sum, user) => sum + user.totalHours, 0);
  const totalSessions = userStats.reduce((sum, user) => sum + user.totalSessions, 0);

  // 3. Build array of objects (vertical layout with users as columns)
  const excelData = [];

  // Summary Statistics section header
  excelData.push({ section_header: 'Summary Statistics', metric: '', value: '' });
  
  // Summary Statistics data
  excelData.push({ section_header: '', metric: 'Total Users', value: userStats.length.toString() });
  excelData.push({ section_header: '', metric: 'Total Hours Logged', value: `${totalHours.toFixed(1)} hours` });
  excelData.push({ section_header: '', metric: 'Total Sessions', value: totalSessions.toString() });
  excelData.push({ section_header: '', metric: 'Average Hours per User', value: `${(totalHours / userStats.length).toFixed(1)} hours` });
  excelData.push({ section_header: '', metric: 'Average Hours per Session', value: `${(totalHours / totalSessions).toFixed(1)} hours` });
  
  // Blank row
  excelData.push({ section_header: '', metric: '', value: '' });
  
  // User breakdown section header
  excelData.push({ section_header: 'Time Investment by User', metric: '', value: '' });
  
  // User breakdown - put users directly in columns C, D, E, etc.
  // Create base row structure
  const userNameRow: any = { section_header: '', metric: 'User Name' };
  const sessionsRow: any = { section_header: '', metric: 'Sessions' };
  const hoursRow: any = { section_header: '', metric: 'Total Hours' };
  const percentageRow: any = { section_header: '', metric: 'Percentage Of Total' };
  
  // Add each user's data starting from 'value' column (column C)
  if (userStats.length > 0) {
    userNameRow.value = userStats[0].userName;
    sessionsRow.value = userStats[0].totalSessions;
    hoursRow.value = userStats[0].totalHours.toFixed(1);
    percentageRow.value = `${((userStats[0].totalHours / totalHours) * 100).toFixed(1)}%`;
  }
  
  // Add remaining users in subsequent columns
  for (let i = 1; i < userStats.length; i++) {
    const colName = `col_${i}`;
    userNameRow[colName] = userStats[i].userName;
    sessionsRow[colName] = userStats[i].totalSessions;
    hoursRow[colName] = userStats[i].totalHours.toFixed(1);
    percentageRow[colName] = `${((userStats[i].totalHours / totalHours) * 100).toFixed(1)}%`;
  }
  
  excelData.push(userNameRow);
  excelData.push(sessionsRow);
  excelData.push(hoursRow);
  excelData.push(percentageRow);

  // 4. Generate Excel
  const fileName = `Logged-Time-Report-${filterType}-${filterValue.replace(/\s+/g, '-')}-${Date.now()}`;
  generateExcel(excelData, { fileName, sheetName: 'Logged Time Report' });
}

/**
 * Filter entries by date range and filter criteria
 */
function filterEntries(
  allEntries: LoggedTimeEntry[],
  startDate: Dayjs,
  endDate: Dayjs,
  filterType: 'department' | 'project',
  filterValue: string
): LoggedTimeEntry[] {
  return allEntries.filter(entry => {
    const isInDateRange = entry.logoutTime.isBetween(
      startDate.startOf('day'),
      endDate.endOf('day'),
      'day',
      '[]'
    );
    const matchesFilter = filterType === 'department'
      ? entry.department === filterValue
      : entry.projectName === filterValue;
    return isInDateRange && matchesFilter;
  });
}

/**
 * Calculate aggregated statistics per user
 */
function calculateUserStats(entries: LoggedTimeEntry[]): UserTimeStats[] {
  const userMap = new Map<string, { totalHours: number; totalSessions: number }>();

  entries.forEach(entry => {
    const hours = entry.logoutTime.diff(entry.loginTime, 'hour', true);
    const existing = userMap.get(entry.userName) || { totalHours: 0, totalSessions: 0 };
    userMap.set(entry.userName, {
      totalHours: existing.totalHours + hours,
      totalSessions: existing.totalSessions + 1,
    });
  });

  return Array.from(userMap.entries())
    .map(([userName, stats]) => ({
      userName,
      totalHours: stats.totalHours,
      totalSessions: stats.totalSessions,
    }))
    .sort((a, b) => b.totalHours - a.totalHours);
}