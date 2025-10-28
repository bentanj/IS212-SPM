// src/app/reportgeneration/services/pdf/ProjectPerformancePDF.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartGenerator } from './ChartGenerator';
import type { ProjectPerformanceReport } from '@/types/report.types';

export class ProjectPerformancePDF {
  static async generate(
    report: ProjectPerformanceReport,
    currentDate: string,
    dateRange: string = ''
  ): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Performance Analytics', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
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

    const sortedProjects = [...report.data.projects].sort((a, b) => b.total_tasks - a.total_tasks);

    // Create Chart
    try {
      const chartConfig = ChartGenerator.createProjectPerformanceChart(sortedProjects);
      const chartHeight = Math.max(400, sortedProjects.length * 40);
      const chartImage = await ChartGenerator.createChartImage(chartConfig, 700, chartHeight);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Performance Overview', 14, yPos);
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

    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    const summaryStats = [
      ['Total Projects', report.summary.total_projects.toString()],
      ['Total Tasks', report.summary.total_tasks.toString()],
      ['Total Completed', report.summary.total_completed.toString()],
      ['Average Completion Rate', `${report.summary.average_completion_rate.toFixed(1)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryStats,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80], fontSize: 11 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Project Statistics Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Project Statistics', 14, yPos);
    yPos += 10;

    const tableData = sortedProjects.map((p) => [
      p.project_name || 'Unnamed Project',
      p.total_tasks.toString(),
      p.completed.toString(),
      p.to_do.toString(),
      p.in_progress.toString(),
      p.blocked.toString(),
      `${p.completion_rate}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Project Name', 'Total', 'Completed', 'To Do', 'In Progress', 'Blocked', 'Rate']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80], fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 },
        1: { cellWidth: 15 },
        2: { cellWidth: 20, fillColor: [232, 245, 233] },
        3: { cellWidth: 22, fillColor: [255, 248, 225] }, 
        4: { cellWidth: 15, fillColor: [227, 242, 253] },
        5: { cellWidth: 17, fillColor: [255, 235, 238] },
        6: { cellWidth: 18, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`Project-Performance-Report-${Date.now()}.pdf`);
  }
}
