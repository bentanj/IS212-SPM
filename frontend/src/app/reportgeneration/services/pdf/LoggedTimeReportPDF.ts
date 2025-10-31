// src/app/reportgeneration/services/pdf/LoggedTimeReportPDF.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartGenerator } from './ChartGenerator';
import { Dayjs } from 'dayjs';
import { LoggedTimeEntry, UserTimeStats } from '@/types/report.types';

export class LoggedTimeReportPDF {
  /**
   * Calculate total hours worked for a single entry
   */
  private static calculateHours(entry: LoggedTimeEntry): number {
    return entry.logoutTime.diff(entry.loginTime, 'hour', true);
  }

  /**
   * Filter logged time entries by date range and filter criteria
   */
  private static filterEntries(
    allEntries: LoggedTimeEntry[],
    startDate: Dayjs,
    endDate: Dayjs,
    filterType: 'department' | 'project',
    filterValue: string
  ): LoggedTimeEntry[] {
    return allEntries.filter(entry => {
      // Check if logout time is within date range (inclusive)
      const isInDateRange = entry.logoutTime.isBetween(
        startDate.startOf('day'),
        endDate.endOf('day'),
        'day',
        '[]'
      );

      // Check if matches filter criteria
      const matchesFilter = filterType === 'department'
        ? entry.department === filterValue
        : entry.projectName === filterValue;

      return isInDateRange && matchesFilter;
    });
  }

  /**
   * Calculate aggregated statistics per user
   */
  private static calculateUserStats(entries: LoggedTimeEntry[]): UserTimeStats[] {
    const userMap = new Map<string, { totalHours: number; totalSessions: number }>();

    entries.forEach(entry => {
      const hours = this.calculateHours(entry);
      const existing = userMap.get(entry.userName) || { totalHours: 0, totalSessions: 0 };
      
      userMap.set(entry.userName, {
        totalHours: existing.totalHours + hours,
        totalSessions: existing.totalSessions + 1,
      });
    });

    // Convert map to array and sort by total hours (descending)
    return Array.from(userMap.entries())
      .map(([userName, stats]) => ({
        userName,
        totalHours: stats.totalHours,
        totalSessions: stats.totalSessions,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }

  /**
   * Main function to generate the PDF report
   */
  static async generate(
    allEntries: LoggedTimeEntry[],
    startDate: Dayjs,
    endDate: Dayjs,
    filterType: 'department' | 'project',
    filterValue: string,
    currentDate: string
  ): Promise<void> {
    // Filter and process data
    const filteredEntries = this.filterEntries(allEntries, startDate, endDate, filterType, filterValue);
    const userStats = this.calculateUserStats(filteredEntries);
    const totalHours = userStats.reduce((sum, user) => sum + user.totalHours, 0);
    const totalSessions = userStats.reduce((sum, user) => sum + user.totalSessions, 0);

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // ============================================================================
    // HEADER SECTION
    // ============================================================================
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Logged Time Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const dateRangeStr = `Period: ${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')}`;
    doc.text(dateRangeStr, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    const filterStr = `Filter: ${filterType === 'department' ? 'Department' : 'Project'} - ${filterValue}`;
    doc.text(filterStr, pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    yPos += 20;

    // ============================================================================
    // CHART SECTION
    // ============================================================================
    if (userStats.length > 0) {
      try {
        const chartConfig = this.createUserTimeChart(userStats);
        const chartHeight = Math.max(400, userStats.length * 40);
        const chartImage = await ChartGenerator.createChartImage(chartConfig, 700, chartHeight);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Time Investment Overview', 14, yPos);
        yPos += 10;
        
        const imageWidth = 180;
        const imageHeight = (chartHeight / 700) * imageWidth;
        doc.addImage(chartImage, 'PNG', 15, yPos, imageWidth, Math.min(imageHeight, 150));
        yPos += Math.min(imageHeight, 150) + 10;
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }

    // Add new page if needed
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // ============================================================================
    // SUMMARY STATISTICS
    // ============================================================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    const summaryStats = [
      ['Total Users', userStats.length.toString()],
      ['Total Hours Logged', `${totalHours.toFixed(1)} hours`],
      ['Total Sessions', totalSessions.toString()],
      ['Average Hours per User', `${(totalHours / userStats.length).toFixed(1)} hours`],
      ['Average Hours per Session', `${(totalHours / totalSessions).toFixed(1)} hours`],
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

    // Add new page if needed
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // ============================================================================
    // USER TIME BREAKDOWN TABLE
    // ============================================================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Time Investment by User', 14, yPos);
    yPos += 10;

    const tableData = userStats.map((user) => [
      user.userName,
      user.totalSessions.toString(),
      `${user.totalHours.toFixed(1)} hours`,
      `${((user.totalHours / totalHours) * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['User Name', 'Sessions', 'Total Hours', '% of Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, halign: 'center', cellPadding: 3 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 70 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40, fillColor: [227, 242, 253] },
        3: { cellWidth: 30, fontStyle: 'bold', fillColor: [232, 245, 233] },
      },
      margin: { left: 14, right: 14 },
    });

    // ============================================================================
    // SAVE PDF
    // ============================================================================
    const fileName = `Logged-Time-Report-${filterType}-${filterValue.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Create a horizontal bar chart showing time per user
   */
  private static createUserTimeChart(userStats: UserTimeStats[]): any {
    // Sort by total hours and take top 15 users
    const topUsers = [...userStats].sort((a, b) => b.totalHours - a.totalHours).slice(0, 15);

    return {
      type: 'bar',
      data: {
        labels: topUsers.map(u => {
          // Truncate long names
          const name = u.userName;
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),
        datasets: [{
          label: 'Hours Logged',
          data: topUsers.map(u => parseFloat(u.totalHours.toFixed(1))),
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        animation: { duration: 0 },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value: number) => `${value}h`,
              font: { size: 11 },
            },
            grid: { display: true },
          },
          y: {
            ticks: { font: { size: 10 } },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Time Logged per User',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 15 },
          },
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'end',
            color: '#424242',
            font: { weight: 'bold', size: 10 },
            formatter: (value: number) => `${value}h`,
          },
        },
      },
    };
  }
}