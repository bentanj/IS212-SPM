// src/utils/ReportGenerationFunction.ts

import { 
  ReportMetadata, 
  ProjectPerformanceReport,
  UserProductivityReport,
  DepartmentTaskActivityReport,
  ProjectStatistics,
  TeamMemberStats,
  DepartmentUser,
  WeeklyData,
  MonthlyData,
  TaskStatusCount
} from '@/types/report.types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


// ==================== HELPER FUNCTIONS ====================

/**
 * Fetch all tasks from Task Service
 */
const fetchAllTasks = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Batch fetch users by IDs (uses filter endpoint)
 */
const fetchUsersBatch = async (userIds: number[]): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds })
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Filter tasks by date range
 */
const filterTasksByDateRange = (
  tasks: any[], 
  startDate: string, 
  endDate: string
): any[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return tasks.filter(task => {
    const dueDate = task.dueDate || task.due_date;
    if (!dueDate) return false;
    
    const taskDueDate = new Date(dueDate);
    return taskDueDate >= start && taskDueDate <= end;
  });
};

/**
 * Get unique user IDs from tasks
 */
const getUniqueUserIds = (tasks: any[]): number[] => {
  const userIds = new Set<number>();
  tasks.forEach(task => {
    const assignedUsers = task.assignedUsers || task.assigned_users || [];
    if (Array.isArray(assignedUsers)) {
      assignedUsers.forEach((user: any) => {
        const userId = typeof user === 'object' ? (user.userId || user.user_id) : user;
        if (userId) userIds.add(Number(userId));
      });
    }
  });
  return Array.from(userIds);
};

// ==================== REPORT GENERATORS ====================

/**
 * Generate Project Performance Report
 * Migrated from: ReportService.generate_project_performance_report()
 */

export const generateProjectPerformanceReport = async (
  startDate: string,
  endDate: string
): Promise<ProjectPerformanceReport> => {
  try {
    console.log(`Generating project performance report: ${startDate} to ${endDate}`);

    // 1. Fetch and filter tasks
    const allTasks = await fetchAllTasks();
    console.log('All tasks fetched:', allTasks.length);
    
    const filteredTasks = filterTasksByDateRange(allTasks, startDate, endDate);
    console.log('Filtered tasks:', filteredTasks.length);

    // 2. Group tasks by PROJECT NAME (not ID)
    const projectMap = new Map<string, any>();
    
    filteredTasks.forEach(task => {
      // ✅ Use project_name as the key
      const projectName = task.project_name || task.projectName;
      
      // Skip tasks without a project name
      if (!projectName) {
        console.warn('Task has no project name:', task.id || task.taskId || task.task_id);
        return;
      }
      
      // Create project entry if it doesn't exist
      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, {
          project_name: projectName,
          tasks: []
        });
      }
      
      // Add task to the project
      projectMap.get(projectName)!.tasks.push(task);
    });

    console.log('Projects found:', projectMap.size);
    console.log('Project names:', Array.from(projectMap.keys()));

    // 3. Calculate project statistics
    const projects: ProjectStatistics[] = Array.from(projectMap.values()).map(project => {
      const totalTasks = project.tasks.length;
      
      // Count tasks by status (case-insensitive)
      const completed = project.tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'completed';
      }).length;
      
      const inProgress = project.tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'in progress';
      }).length;
      
      const toDo = project.tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'to do';
      }).length;
      
      const blocked = project.tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'blocked';
      }).length;

      const completionRate = totalTasks > 0 ?
        Math.round((completed / totalTasks) * 100 * 10) / 10 : 0;

      return {
        project_name: project.project_name,
        total_tasks: totalTasks,
        completed,
        in_progress: inProgress,
        to_do: toDo,
        blocked,
        completion_rate: completionRate
      };
    });

    // Sort projects by total tasks (descending)
    projects.sort((a, b) => b.total_tasks - a.total_tasks);

    // 4. Calculate summary statistics
    const totalProjects = projects.length;
    const totalTasks = projects.reduce((sum, p) => sum + p.total_tasks, 0);
    const totalCompleted = projects.reduce((sum, p) => sum + p.completed, 0);
    const avgCompletion = totalProjects > 0 ?
      Math.round((projects.reduce((sum, p) => sum + p.completion_rate, 0) / totalProjects) * 10) / 10 : 0;

    console.log('Report summary:', {
      totalProjects,
      totalTasks,
      totalCompleted,
      avgCompletion
    });

    return {
      metadata: {
        report_id: `project-${Date.now()}`,
        report_type: 'project_performance',
        generated_at: new Date().toISOString(),
        generated_by: 'frontend',
        parameters: {
          start_date: startDate,
          end_date: endDate,
          tasks_in_range: filteredTasks.length,
          total_tasks: allTasks.length
        }
      },
      summary: {
        total_projects: totalProjects,
        total_tasks: totalTasks,
        total_completed: totalCompleted,
        average_completion_rate: avgCompletion
      },
      data: { projects }
    };
  } catch (error) {
    console.error('Error generating project performance report:', error);
    throw error;
  }
};

/**
 * Generate User Productivity Report
 * Migrated from: ReportService.generate_user_productivity_report()
 */
export const generateUserProductivityReport = async (
  startDate: string,
  endDate: string
): Promise<UserProductivityReport> => {
  try {
    console.log(`Generating user productivity report: ${startDate} to ${endDate}`);
    
    // 1. Fetch and filter tasks
    const allTasks = await fetchAllTasks();
    const filteredTasks = filterTasksByDateRange(allTasks, startDate, endDate);
    
    // 2. Group tasks by user
    const userMap = new Map<number, any[]>();
    filteredTasks.forEach(task => {
      const assignedUsers = task.assignedUsers || task.assigned_users || [];
      if (Array.isArray(assignedUsers)) {
        assignedUsers.forEach((user: any) => {
          const userId = typeof user === 'object' ? (user.userId || user.user_id) : user;
          if (userId) {
            const numericUserId = Number(userId);
            if (!userMap.has(numericUserId)) userMap.set(numericUserId, []);
            userMap.get(numericUserId)!.push(task);
          }
        });
      }
    });
    
    // 3. Batch fetch user details
    const userIds = Array.from(userMap.keys());
    const users = await fetchUsersBatch(userIds);
    const userInfoMap = new Map(users.map((u: any) => [u.userId || u.user_id || u.id, u]));
    
    // 4. Calculate user productivity
    const teamMembers: TeamMemberStats[] = Array.from(userMap.entries()).map(([userId, tasks]) => {
      const userInfo = userInfoMap.get(userId);
      const totalTasks = tasks.length;
        const completed = tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'completed';
      }).length;
      
      const inProgress = tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'in progress';
      }).length;
      
      const toDo = tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'to do';
      }).length;
      
      const blocked = tasks.filter(t => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'blocked';
      }).length;

      
      // Extract name from user info
      const userName = userInfo?.name || userInfo?.full_name || `User ${userId}`;
      const nameParts = userName.split(' ', 2);
      
      return {
        user_id: String(userId),
        first_name: nameParts[0] || 'User',
        last_name: nameParts[1] || String(userId),
        full_name: userName,
        total_tasks: totalTasks,
        completed,
        in_progress: inProgress,
        todo: toDo,
        blocked,
        completion_rate: totalTasks > 0 ? 
          Math.round((completed / totalTasks) * 100 * 10) / 10 : 0
      };
    });
    
    // 5. Calculate summary
    const totalUsers = teamMembers.length;
    const totalTasks = teamMembers.reduce((sum, u) => sum + u.total_tasks, 0);
    const totalCompleted = teamMembers.reduce((sum, u) => sum + u.completed, 0);
    const avgCompletion = totalUsers > 0 ?
      teamMembers.reduce((sum, u) => sum + u.completion_rate, 0) / totalUsers : 0;
    
    return {
      metadata: {
        report_id: `user-${Date.now()}`,
        report_type: 'user_productivity',
        generated_at: new Date().toISOString(),
        generated_by: 'frontend',
        parameters: {
          start_date: startDate,
          end_date: endDate,
          tasks_in_range: filteredTasks.length,
          total_tasks: allTasks.length
        }
      },
      summary: {
        total_users: totalUsers,
        total_tasks_assigned: totalTasks,
        total_completed: totalCompleted,
        average_completion_rate: Math.round(avgCompletion * 10) / 10
      },
      data: { team_members: teamMembers }
    };
    
  } catch (error) {
    console.error('Error generating user productivity report:', error);
    throw error;
  }
};

/**
 * Generate Department Activity Report
 * Migrated from: ReportService.generate_department_activity_report()
 */
export const generateDepartmentActivityReport = async (
  department: string,
  aggregation: 'weekly' | 'monthly',
  startDate: string,
  endDate: string
): Promise<DepartmentTaskActivityReport> => {
  try {
    console.log(`Generating department activity report for: ${department}`);
    
    // 1. Fetch and filter tasks
    const allTasks = await fetchAllTasks();
    const filteredTasks = filterTasksByDateRange(allTasks, startDate, endDate);
    
    // 2. Filter by department
    const departmentTasks = filteredTasks.filter(task => {
      const taskDepts = task.departments || [];
      return taskDepts.some((d: string) => d.toLowerCase() === department.toLowerCase());
    });
    
    // 3. Aggregate by time period
    const aggregatedData = aggregation === 'weekly' ?
      aggregateByWeek(departmentTasks, startDate, endDate) :
      aggregateByMonth(departmentTasks, startDate, endDate);
    
    // 4. Get department users
    const userIds = getUniqueUserIds(departmentTasks);
    const users = await fetchUsersBatch(userIds);
    const departmentUsers: DepartmentUser[] = users.map((u: any) => {
      const userName = u.name || u.full_name || `User ${u.userId || u.user_id}`;
      const nameParts = userName.split(' ', 2);
      
      return {
        user_id: String(u.userId || u.user_id || u.id),
        full_name: userName,
        first_name: nameParts[0] || 'User',
        last_name: nameParts[1] || String(u.userId || u.user_id),
        email: u.email || ''
      };
    });
    
    // 5. Calculate status totals
    const statusTotals: TaskStatusCount = {
      to_do: 0,
      in_progress: 0,
      blocked: 0,
      completed: 0,
      overdue: 0
    };
    
    aggregatedData.forEach((period: any) => {
      statusTotals.to_do += period.to_do || 0;
      statusTotals.in_progress += period.in_progress || 0;
      statusTotals.blocked += period.blocked || 0;
      statusTotals.completed += period.completed || 0;
      statusTotals.overdue += period.overdue || 0;
    });
    
    return {
      metadata: {
        report_id: `dept-${Date.now()}`,
        report_type: 'department_activity',
        generated_at: new Date().toISOString(),
        generated_by: 'frontend',
        parameters: {
          department,
          aggregation,
          start_date: startDate,
          end_date: endDate
        }
      },
      summary: {
        department,
        date_range: {
          start_date: startDate,
          end_date: endDate
        },
        total_tasks: departmentTasks.length,
        status_totals: statusTotals,
        aggregation_type: aggregation,
        total_users: departmentUsers.length
      },
      data: {
        department,
        aggregation,
        [aggregation === 'weekly' ? 'weekly_data' : 'monthly_data']: aggregatedData,
        total_tasks: departmentTasks.length,
        users: departmentUsers
      }
    };
    
  } catch (error) {
    console.error('Error generating department activity report:', error);
    throw error;
  }
};

/**
 * Aggregate tasks by week
 */
const aggregateByWeek = (tasks: any[], startDate: string, endDate: string): WeeklyData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const weeklyData: WeeklyData[] = [];
  
  let current = new Date(start);
  while (current <= end) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const actualEnd = weekEnd > end ? end : weekEnd;
    
    const weekTasks = tasks.filter(task => {
      const dueDate = task.dueDate || task.due_date;
      if (!dueDate) return false;
      const taskDueDate = new Date(dueDate);
      return taskDueDate >= current && taskDueDate <= actualEnd;
    });
    
    weeklyData.push({
      week_start: current.toISOString().split('T')[0],
      week_end: actualEnd.toISOString().split('T')[0],
      ...countByStatus(weekTasks)
    });
    
    current = new Date(actualEnd);
    current.setDate(current.getDate() + 1);
  }
  
  return weeklyData;
};

/**
 * Aggregate tasks by month
 */
const aggregateByMonth = (tasks: any[], startDate: string, endDate: string): MonthlyData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const monthlyData: MonthlyData[] = [];
  
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const actualEnd = monthEnd > end ? end : monthEnd;
    
    const monthTasks = tasks.filter(task => {
      const dueDate = task.dueDate || task.due_date;
      if (!dueDate) return false;
      const taskDueDate = new Date(dueDate);
      return taskDueDate >= current && taskDueDate <= actualEnd;
    });
    
    monthlyData.push({
      month: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
      month_name: current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      ...countByStatus(monthTasks)
    });
    
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
  
  return monthlyData;
};

/**
 * Count tasks by status
 */
const countByStatus = (tasks: any[]): TaskStatusCount => {
  const now = new Date();
  const counts: TaskStatusCount = {
    to_do: 0,
    in_progress: 0,
    blocked: 0,
    completed: 0,
    overdue: 0
  };
  
  tasks.forEach(task => {
    const status = (task.status || '').toLowerCase();
    const dueDate = task.dueDate || task.due_date;
    const taskDueDate = dueDate ? new Date(dueDate) : null;
    
    if (status !== 'completed' && taskDueDate && taskDueDate < now) {
      counts.overdue++;
    } else if (status === 'to do' || status === 'todo') {
      counts.to_do++;
    } else if (status === 'in progress') {
      counts.in_progress++;
    } else if (status === 'blocked') {
      counts.blocked++;
    } else if (status === 'completed') {
      counts.completed++;
    }
  });
  
  return counts;
};

/**
 * Get list of unique departments
 * Migrated from: ReportService.get_unique_departments()
 */
export const getUniqueDepartments = async (): Promise<string[]> => {
  try {
    const tasks = await fetchAllTasks();
    const departments = new Set<string>();
    
    tasks.forEach(task => {
      const taskDepts = task.departments || [];
      taskDepts.forEach((dept: string) => {
        if (dept && dept.trim()) departments.add(dept.trim());
      });
    });
    
    return Array.from(departments).sort();
  } catch (error) {
    console.error('Error getting unique departments:', error);
    return [];
  }
};
