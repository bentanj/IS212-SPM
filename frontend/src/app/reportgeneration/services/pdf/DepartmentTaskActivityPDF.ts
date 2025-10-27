// src/app/reportgeneration/services/pdf/DepartmentTaskActivityPDF.ts

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartGenerator } from './ChartGenerator';
import type { DepartmentTaskActivityReport } from '@/types/report.types';

export class DepartmentTaskActivityPDF {
  static async generate(
    report: DepartmentTaskActivityReport,
    currentDate: string,
    dateRange: string = ''
  ): Promise<void> {
    console.log('Generating Department Task Activity PDF with report:', report);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Department Task Activity Report', pageWidth / 2, yPos, { align: 'center' });
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

    yPos += 15;

    const data = report.data;
    const summary = report.summary;

    // Department and Aggregation Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Department: ${data.department}`, 14, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Aggregation: ${data.aggregation === 'weekly' ? 'Weekly' : 'Monthly'}`, 14, yPos);  
    yPos += 10;

    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    const summaryStats = [
      ['Total Tasks', summary.total_tasks.toString()],
      ['To Do', summary.status_totals.to_do.toString()],
      ['In Progress', summary.status_totals.in_progress.toString()],
      ['Blocked', summary.status_totals.blocked.toString()],
      ['Completed', summary.status_totals.completed.toString()],
      ['Overdue', summary.status_totals.overdue.toString()],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Count']],
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

      if (data.users && data.users.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Department Team Members', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Users: ${data.users.length}`, 14, yPos);
    yPos += 10;
    
    const usersTableData = data.users.map((user, index) => [
      (index + 1).toString(),
      user.full_name,
      user.email || 'N/A'
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Name', 'Email']],
      body: usersTableData,
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80], fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 70 },
        2: { halign: 'left', cellWidth: 90 },
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Continue with chart generation...
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

    // Create Chart
    if (data.aggregation === 'weekly' && data.weekly_data && data.weekly_data.length > 0) {
      try {
        const chartConfig = ChartGenerator.createDepartmentTaskActivityChart(
          data.weekly_data.map(w => ({
            label: `${new Date(w.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(w.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            ...w
          })),
          'Weekly Task Activity'
        );
        const chartImage = await ChartGenerator.createChartImage(chartConfig, 700, 400);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Weekly Task Activity Visualization', 14, yPos);
        yPos += 10;

        const imageWidth = 180;
        const imageHeight = 100;
        doc.addImage(chartImage, 'PNG', 15, yPos, imageWidth, imageHeight);
        yPos += imageHeight + 10;
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    } else if (data.aggregation === 'monthly' && data.monthly_data && data.monthly_data.length > 0) {
      try {
        const chartConfig = ChartGenerator.createDepartmentTaskActivityChart(
          data.monthly_data.map(m => ({
            label: m.month_name,
            ...m
          })),
          'Monthly Task Activity'
        );
        const chartImage = await ChartGenerator.createChartImage(chartConfig, 700, 400);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Task Activity Visualization', 14, yPos);
        yPos += 10;

        const imageWidth = 180;
        const imageHeight = 100;
        doc.addImage(chartImage, 'PNG', 15, yPos, imageWidth, imageHeight);
        yPos += imageHeight + 10;
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }

    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    

    // Detailed Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Detailed ${data.aggregation === 'weekly' ? 'Weekly' : 'Monthly'} Breakdown`, 14, yPos);
    yPos += 10;

    if (data.aggregation === 'weekly' && data.weekly_data) {
      const tableData = data.weekly_data.map(w => [
        `${new Date(w.week_start).toLocaleDateString()} - ${new Date(w.week_end).toLocaleDateString()}`,
        w.to_do.toString(),
        w.in_progress.toString(),
        w.blocked.toString(),
        w.completed.toString(),
        w.overdue.toString(),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Week', 'To Do', 'In Progress', 'Blocked', 'Completed', 'Overdue']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243], fontSize: 9 },
        styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
        columnStyles: {
          0: { halign: 'left', cellWidth: 50 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20, fillColor: [232, 245, 233] },
          5: { cellWidth: 20, fillColor: [255, 235, 238] },
        },
        margin: { left: 14, right: 14 },
      });
    } else if (data.aggregation === 'monthly' && data.monthly_data) {
      const tableData = data.monthly_data.map(m => [
        m.month_name,
        m.to_do.toString(),
        m.in_progress.toString(),
        m.blocked.toString(),
        m.completed.toString(),
        m.overdue.toString(),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Month', 'To Do', 'In Progress', 'Blocked', 'Completed', 'Overdue']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243], fontSize: 9 },
        styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
        columnStyles: {
          0: { halign: 'left', cellWidth: 50 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20, fillColor: [232, 245, 233] },
          5: { cellWidth: 20, fillColor: [255, 235, 238] },
        },
        margin: { left: 14, right: 14 },
      });
    }

    // Save PDF
    doc.save(`Department-Task-Activity-${data.department}-${Date.now()}.pdf`);  
    console.log('PDF generated successfully!');
  }
}
