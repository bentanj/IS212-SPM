// src/app/reportgeneration/services/pdf/ChartGenerator.ts
import { Chart, ChartConfiguration } from 'chart.js';
import html2canvas from 'html2canvas';

export class ChartGenerator {
  static async createChartImage(
    chartConfig: ChartConfiguration,
    width: number = 500,
    height: number = 500
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = `${width}px`;
      tempDiv.style.height = `${height}px`;
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '20px';

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      tempDiv.appendChild(canvas);
      document.body.appendChild(tempDiv);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        document.body.removeChild(tempDiv);
        reject('Could not get canvas context');
        return;
      }

      const chart = new Chart(ctx, chartConfig);

      setTimeout(async () => {
        try {
          const capturedCanvas = await html2canvas(tempDiv, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
          });

          const imageData = capturedCanvas.toDataURL('image/png', 1.0);
          chart.destroy();
          document.body.removeChild(tempDiv);
          resolve(imageData);
        } catch (error) {
          chart.destroy();
          document.body.removeChild(tempDiv);
          reject(error);
        }
      }, 1000);
    });
  }

  static createTaskStatusPieChart(
    completed: number,
    inProgress: number,
    toDo: number,
    blocked: number
  ): ChartConfiguration {
    return {
      type: 'pie',
      data: {
        labels: ['Completed', 'In Progress', 'To Do', 'Blocked'],
        datasets: [{
          data: [completed, inProgress, toDo, blocked],
          backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336'],
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 0 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 14 }, padding: 15, boxWidth: 18 },
          },
          title: {
            display: true,
            text: 'Task Status Distribution',
            font: { size: 18, weight: 'bold' },
            padding: { bottom: 15 },
          },
          datalabels: {
            color: '#ffffff',
            font: { weight: 'bold', size: 16 },
            formatter: (value: number, context: any) => {
              const dataset = context.chart.data.datasets[0];
              const total = dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
              return `${((value / total) * 100).toFixed(1)}%`;
            },
          },
        },
      },
    };
  }

  static createProjectPerformanceChart(projects: any[]): ChartConfiguration {
    const sortedProjects = [...projects].sort((a, b) => b.total_tasks - a.total_tasks);
    return {
      type: 'bar',
      data: {
        labels: sortedProjects.map((p) => {
          const name = p.project_name || 'Unnamed Project';
          return name.length > 25 ? name.substring(0, 25) + '...' : name;
        }),
        datasets: [
          { label: 'Completed', data: sortedProjects.map(p => p.completed), backgroundColor: '#4CAF50', borderWidth: 1 },
          { label: 'In Progress', data: sortedProjects.map(p => p.in_progress), backgroundColor: '#2196F3', borderWidth: 1 },
          { label: 'To Do', data: sortedProjects.map(p => p.to_do), backgroundColor: '#FFC107', borderWidth: 1 },
          { label: 'Blocked', data: sortedProjects.map(p => p.blocked), backgroundColor: '#F44336', borderWidth: 1 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        animation: { duration: 0 },
        scales: {
          x: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { display: true } },
          y: { stacked: true, ticks: { font: { size: 10 } }, grid: { display: false } },
        },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 12 }, padding: 10, boxWidth: 15 } },
          title: { display: true, text: 'Project Task Status Distribution', font: { size: 16, weight: 'bold' }, padding: { bottom: 15 } },
          datalabels: { display: true, color: '#ffffff', font: { weight: 'bold', size: 10 }, formatter: (v: number) => v > 0 ? v : '' },
        },
      },
    };
  }

  static createUserProductivityChart(teamMembers: any[]): ChartConfiguration {
    const topUsers = [...teamMembers].sort((a, b) => b.completion_rate - a.completion_rate).slice(0, 10);
    return {
      type: 'bar',
      data: {
        labels: topUsers.map(u => {
          const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || `User ${u.user_id}`;
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),

        datasets: [{
          label: 'Completion Rate (%)',
          data: topUsers.map(u => u.completion_rate),
          backgroundColor: '#2196F3',
          borderColor: '#2196F3',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 0 },
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%', font: { size: 11 } }, grid: { display: true } },
          y: { ticks: { font: { size: 10 } }, grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Top 10 Users by Completion Rate', font: { size: 16, weight: 'bold' }, padding: { bottom: 15 } },
          datalabels: { display: true, anchor: 'end', align: 'end', color: '#424242', font: { weight: 'bold', size: 10 }, formatter: (v: number) => `${v.toFixed(1)}%` },
        },
      },
    };
  }


  static createDepartmentTaskActivityChart(data: any[], title: string): ChartConfiguration {
  // ✅ Filter out weeks/months where ALL values are 0
  const filteredData = data.filter(d => {
    const total = (d.to_do || 0) + (d.in_progress || 0) + (d.blocked || 0) + (d.completed || 0) + (d.overdue || 0);
    return total > 0; // Only include if there's at least 1 task
  });

  return {
    type: 'bar',
    data: {
      labels: filteredData.map(d => d.label), // Use filtered data
      datasets: [
        {
          label: 'To Do',
          data: filteredData.map(d => d.to_do || 0),
          backgroundColor: '#9E9E9E',
        },
        {
          label: 'In Progress',
          data: filteredData.map(d => d.in_progress || 0),
          backgroundColor: '#2196F3',
        },
        {
          label: 'Blocked',
          data: filteredData.map(d => d.blocked || 0),
          backgroundColor: '#FF9800',
        },
        {
          label: 'Completed',
          data: filteredData.map(d => d.completed || 0),
          backgroundColor: '#4CAF50',
        },
        {
          label: 'Overdue',
          data: filteredData.map(d => d.overdue || 0),
          backgroundColor: '#F44336',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 0 },
      scales: {
        x: { stacked: true, ticks: { font: { size: 9 } } },
        y: { stacked: true, beginAtZero: true, ticks: { font: { size: 10 } } },
      },
      plugins: {
        legend: { display: true, position: 'bottom' },
        title: { display: true, text: title, font: { size: 14, weight: 'bold' } },
        // ✅ FIX: Hide data labels or only show non-zero values
        datalabels: {
          display: true,
          color: '#ffffff',
          font: { weight: 'bold', size: 10 },
          formatter: (value: number) => {
            // Only show label if value > 0
            return value > 0 ? value : '';
          },
        },
      },
    },
  };
  }

}
