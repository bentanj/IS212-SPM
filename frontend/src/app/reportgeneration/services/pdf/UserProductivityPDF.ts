// src/app/reportgeneration/_lib/UserProductivityPDF.ts

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartGenerator } from './ChartGenerator';
import type { UserProductivityReport } from '@/types/report.types';

export class UserProductivityPDF {
  static async generate(
    report: UserProductivityReport,
    currentDate: string,
    dateRange: string = ''
  ): Promise<void> {
    console.log('Generating User Productivity PDF with report:', report);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('User Productivity Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Generated date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    // Add date range if provided
    if (dateRange) {
      yPos += 6;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(dateRange, pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    yPos += 20;

    // Extract Data from backend
    const teamMembers = report.data?.team_members || [];
    const summary = report.summary || {
      total_team_members: 0,
      total_tasks_assigned: 0,
      total_completed: 0,
      average_completion_rate: 0
    };

    console.log('Team members:', teamMembers);
    console.log('Summary:', summary);

    // Validate we have data
    if (!teamMembers || teamMembers.length === 0) {
      doc.setFontSize(12);
      doc.text('No user productivity data available for the selected date range.', 14, yPos);
      doc.save(`User-Productivity-Report-${Date.now()}.pdf`);
      return;
    }

    const topUsers = [...teamMembers]
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 10);

    // Create Chart
    try {
      const chartConfig = ChartGenerator.createUserProductivityChart(topUsers);
      const chartHeight = Math.max(400, topUsers.length * 40);
      const chartImage = await ChartGenerator.createChartImage(chartConfig, 700, chartHeight);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('User Productivity Visualization', 14, yPos);
      yPos += 10;

      const imageWidth = 180;
      const imageHeight = (chartHeight / 700) * imageWidth;
      doc.addImage(chartImage, 'PNG', 15, yPos, imageWidth, Math.min(imageHeight, 150));
      yPos += Math.min(imageHeight, 150) + 10;
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Summar Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    const summaryStats = [
      ['Total Users', summary.total_users?.toString() || '0'],
      ['Total Tasks Assigned', summary.total_tasks_assigned?.toString() || '0'],
      ['Total Completed', summary.total_completed?.toString() || '0'],
      ['Average Completion Rate', `${(summary.average_completion_rate || 0).toFixed(1)}%`],
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

    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Detailed User Statistics - CORRECTED COLUMN ORDER
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Team Member Statistics', 14, yPos);
    yPos += 10;

    // data order to match headers
    const tableData = teamMembers.map((u) => [
      u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || `User ${u.user_id}`,
      u.total_tasks?.toString() || '0',      // Total tasks
      u.completed?.toString() || '0',        // Completed
      u.todo?.toString() || '0',             // To-Do
      u.in_progress?.toString() || '0',      // In Progress
      u.blocked?.toString() || '0',          // Blocked
      `${(u.completion_rate || 0).toFixed(1)}%`, // Completion Rate
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Total Tasks', 'Completed', 'To-Do', 'In Progress', 'Blocked', 'Completion Rate']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [33, 150, 243], fontSize: 9 },
      styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 45 },  // Name
        1: { cellWidth: 20, fontStyle: 'bold' }, // Total Tasks (bold)
        2: { cellWidth: 20, fillColor: [232, 245, 233] }, // Completed (green tint)
        3: { cellWidth: 20, fillColor: [255, 243, 224] }, // To-Do (orange tint)
        4: { cellWidth: 20, fillColor: [227, 242, 253] }, // In Progress (blue tint)
        5: { cellWidth: 20, fillColor: [255, 235, 238] }, // Blocked (red tint)
        6: { cellWidth: 25, fontStyle: 'bold' }, // Completion Rate
      },
      margin: { left: 14, right: 14 },
    });

    // Save PDF
    doc.save(`User-Productivity-Report-${Date.now()}.pdf`);
    console.log('PDF generated successfully!');
  }
}
