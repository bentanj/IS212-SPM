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
    console.log(`[Project Performance] Starting report generation: ${startDate} to ${endDate}`);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: FETCH AND FILTER TASKS
    // ═══════════════════════════════════════════════════════════════════
    const allTasks = await fetchAllTasks();
    console.log(`[Project Performance] Fetched ${allTasks.length} total tasks from API`);
    
    const filteredTasks = filterTasksByDateRange(allTasks, startDate, endDate);
    console.log(`[Project Performance] Filtered to ${filteredTasks.length} tasks in date range`);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: GROUP TASKS BY PROJECT NAME
    // ═══════════════════════════════════════════════════════════════════
    const projectMap = new Map<string, any>();
    
    filteredTasks.forEach(task => {
      // Use project_name as the key (supports both camelCase and snake_case)
      const projectName = task.project_name || task.projectName;
      
      // Skip tasks without a project name
      if (!projectName) {
        console.warn(`[Project Performance] Task has no project name:`, task.id || task.taskId || task.task_id);
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

    console.log(`[Project Performance] Projects found: ${projectMap.size}`);
    console.log(`[Project Performance] Project names:`, Array.from(projectMap.keys()).slice(0, 5));

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: CALCULATE PROJECT STATISTICS
    // ═══════════════════════════════════════════════════════════════════
    const projects: ProjectStatistics[] = Array.from(projectMap.values()).map(project => {
      const totalTasks = project.tasks.length;
      
      // Count tasks by status (case-insensitive, trimmed)
      const completed = project.tasks.filter((t: any) => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'completed';
      }).length;

      const inProgress = project.tasks.filter((t: any) => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'in progress';
      }).length;

      const toDo = project.tasks.filter((t: any) => {
        const status = (t.status || '').toLowerCase().trim();
        return status === 'to do';
      }).length;

      const blocked = project.tasks.filter((t: any) => {
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

    // ═══════════════════════════════════════════════════════════════════
    // ✨ STEP 4: SORT BY COMPLETION RATE (DESCENDING)
    // ═══════════════════════════════════════════════════════════════════
    projects.sort((a, b) => {
      // Primary sort: completion_rate descending
      if (b.completion_rate !== a.completion_rate) {
        return b.completion_rate - a.completion_rate;
      }
      // Secondary sort: total_tasks descending (tie-breaker)
      if (b.total_tasks !== a.total_tasks) {
        return b.total_tasks - a.total_tasks;
      }
      // Tertiary sort: alphabetical by project name (tie-breaker)
      return (a.project_name || '').localeCompare(b.project_name || '');
    });

    console.log(`[Project Performance] Sorted ${projects.length} projects by completion rate (descending)`);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 5: CALCULATE SUMMARY STATISTICS
    // ═══════════════════════════════════════════════════════════════════
    const totalProjects = projects.length;
    const totalTasks = projects.reduce((sum, p) => sum + p.total_tasks, 0);
    const totalCompleted = projects.reduce((sum, p) => sum + p.completed, 0);
    const avgCompletion = totalProjects > 0 ?
      Math.round((projects.reduce((sum, p) => sum + p.completion_rate, 0) / totalProjects) * 10) / 10 : 0;

    console.log(`[Project Performance] Summary calculated:`, {
      totalProjects,
      totalTasks,
      totalCompleted,
      avgCompletion: `${avgCompletion}%`
    });

    // Log top performing projects
    if (projects.length > 0) {
      const topProjects = projects
        .slice(0, 3)
        .map(p => `${p.project_name} (${p.completion_rate}%)`)
        .join(', ');
      console.log(`[Project Performance] Top projects: ${topProjects}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 6: BUILD AND RETURN REPORT
    // ═══════════════════════════════════════════════════════════════════
    const report: ProjectPerformanceReport = {
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

    console.log(`[Project Performance] Report generation complete`);
    return report;

  } catch (error) {
    console.error('[Project Performance] Error generating report:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('[Project Performance] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
};


/**
 * Generate User Productivity Report
 * @param startDate - Report start date (YYYY-MM-DD)
 * @param endDate - Report end date (YYYY-MM-DD)
 * @returns UserProductivityReport with team member statistics
 * 
 * This function:
 * 1. Fetches all tasks from the Task Service
 * 2. Filters tasks by date range
 * 3. Groups tasks by assigned users
 * 4. Fetches user details in batch
 * 5. Calculates productivity metrics per user
 * 6. Returns comprehensive report with summary
 */
export const generateUserProductivityReport = async (
  startDate: string,
  endDate: string
): Promise<UserProductivityReport> => {
  try {
    console.log(`[User Productivity] Starting report generation: ${startDate} to ${endDate}`);
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: FETCH AND FILTER TASKS
    // ═══════════════════════════════════════════════════════════════════
    const allTasks = await fetchAllTasks();
    console.log(`[User Productivity] Fetched ${allTasks.length} total tasks from API`);
    
    const filteredTasks = filterTasksByDateRange(allTasks, startDate, endDate);
    console.log(`[User Productivity] Filtered to ${filteredTasks.length} tasks in date range`);
    
    if (filteredTasks.length === 0) {
      console.warn(`[User Productivity] No tasks found in date range`);
      return createEmptyReport(startDate, endDate, allTasks.length);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: GROUP TASKS BY USER
    // ═══════════════════════════════════════════════════════════════════
    const userTaskMap = new Map<number, any[]>();
    
    filteredTasks.forEach((task, taskIndex) => {
      // Support both camelCase and snake_case
      const assignedUsers = task.assignedUsers || task.assigned_users || [];
      
      if (!Array.isArray(assignedUsers)) {
        console.warn(`[User Productivity] Task ${task.taskId || taskIndex} has invalid assignedUsers format:`, typeof assignedUsers);
        return;
      }
      
      assignedUsers.forEach((user: any) => {
        // Extract userId from both object and primitive formats
        // Supports: {userId: 1}, {user_id: 1}, or raw number 1
        let userId: number | undefined;
        
        if (typeof user === 'object' && user !== null) {
          userId = user.userId || user.user_id;
        } else if (typeof user === 'number' || typeof user === 'string') {
          userId = Number(user);
        }
        
        if (!userId || isNaN(userId)) {
          console.warn(`[User Productivity] Could not extract valid userId from:`, user);
          return;
        }
        
        const numericUserId = Number(userId);
        
        // Initialize array if first task for this user
        if (!userTaskMap.has(numericUserId)) {
          userTaskMap.set(numericUserId, []);
        }
        
        userTaskMap.get(numericUserId)!.push(task);
      });
    });
    
    console.log(`[User Productivity] Grouped tasks for ${userTaskMap.size} unique users`);
    
    // Log user distribution for debugging
    if (userTaskMap.size > 0) {
      const distribution = Array.from(userTaskMap.entries())
        .map(([userId, tasks]) => `User ${userId}: ${tasks.length} tasks`)
        .slice(0, 5)
        .join(', ');
      console.log(`[User Productivity] Sample distribution: ${distribution}${userTaskMap.size > 5 ? ', ...' : ''}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: BATCH FETCH USER DETAILS
    // ═══════════════════════════════════════════════════════════════════
    const userIds = Array.from(userTaskMap.keys());
    console.log(`[User Productivity] Fetching details for ${userIds.length} users`);
    
    const users = await fetchUsersBatch(userIds);
    console.log(`[User Productivity] Received ${users.length} user records from API`);
    
    // Create lookup map for O(1) access
    const userInfoMap = new Map(
      users.map((u: any) => [
        u.userId || u.user_id || u.id,
        u
      ])
    );
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 4: CALCULATE USER PRODUCTIVITY METRICS
    // ═══════════════════════════════════════════════════════════════════
    console.log(`[User Productivity] Calculating metrics for each user`);
    
    const teamMembers: TeamMemberStats[] = Array.from(userTaskMap.entries()).map(([userId, userTasks]) => {
      const userInfo = userInfoMap.get(userId);
      const totalTasks = userTasks.length;
      
      // Count tasks by status (case-insensitive, trimmed)
      const completed = userTasks.filter(task => {
        const status = (task.status || '').toLowerCase().trim();
        return status === 'completed';
      }).length;
      
      const inProgress = userTasks.filter(task => {
        const status = (task.status || '').toLowerCase().trim();
        return status === 'in progress';
      }).length;
      
      const toDo = userTasks.filter(task => {
        const status = (task.status || '').toLowerCase().trim();
        return status === 'to do';
      }).length;
      
      const blocked = userTasks.filter(task => {
        const status = (task.status || '').toLowerCase().trim();
        return status === 'blocked';
      }).length;
      
      // Calculate completion rate (rounded to 1 decimal)
      const completionRate = totalTasks > 0 
        ? Math.round((completed / totalTasks) * 100 * 10) / 10 
        : 0;
      
      // Extract user name (support multiple field names)
      const userName = userInfo?.name || userInfo?.full_name || userInfo?.fullname || `User ${userId}`;
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
        completion_rate: completionRate
      };
    });

    teamMembers.sort((a, b) => {
      // Primary sort: completion_rate descending
      if (b.completion_rate !== a.completion_rate) {
        return b.completion_rate - a.completion_rate;
      }
      // Secondary sort: total_tasks descending (tie-breaker)
      if (b.total_tasks !== a.total_tasks) {
        return b.total_tasks - a.total_tasks;
      }
      // Tertiary sort: alphabetical by name (tie-breaker)
      return (a.full_name || '').localeCompare(b.full_name || '');
    });
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 5: CALCULATE SUMMARY METRICS
    // ═══════════════════════════════════════════════════════════════════
    const totalUsers = teamMembers.length;
    const totalTasksAssigned = teamMembers.reduce((sum, user) => sum + user.total_tasks, 0);
    const totalCompleted = teamMembers.reduce((sum, user) => sum + user.completed, 0);
    const totalInProgress = teamMembers.reduce((sum, user) => sum + user.in_progress, 0);
    const totalToDo = teamMembers.reduce((sum, user) => sum + user.todo, 0);
    const totalBlocked = teamMembers.reduce((sum, user) => sum + user.blocked, 0);
    
    // Average completion rate across all users
    const avgCompletionRate = totalUsers > 0
      ? teamMembers.reduce((sum, user) => sum + user.completion_rate, 0) / totalUsers
      : 0;
    
    console.log(`[User Productivity] Summary calculated:`);
    console.log(`  - Total Users: ${totalUsers}`);
    console.log(`  - Total Tasks Assigned: ${totalTasksAssigned}`);
    console.log(`  - Total Completed: ${totalCompleted}`);
    console.log(`  - Total In Progress: ${totalInProgress}`);
    console.log(`  - Total To-Do: ${totalToDo}`);
    console.log(`  - Total Blocked: ${totalBlocked}`);
    console.log(`  - Avg Completion Rate: ${avgCompletionRate.toFixed(1)}%`);
    
    // ═══════════════════════════════════════════════════════════════════
    // STEP 6: BUILD AND RETURN REPORT
    // ═══════════════════════════════════════════════════════════════════
    const report: UserProductivityReport = {
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
        total_tasks_assigned: totalTasksAssigned,
        total_completed: totalCompleted,
        average_completion_rate: Math.round(avgCompletionRate * 10) / 10
      },
      data: {
        team_members: teamMembers
      }
    };
    
    console.log(`[User Productivity] Report generation complete`);
    return report;
    
  } catch (error) {
    console.error('[User Productivity] Error generating report:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('[User Productivity] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
};

/**
 * Helper: Create empty report when no tasks found
 * @private
 */
function createEmptyReport(
  startDate: string, 
  endDate: string, 
  totalTasks: number
): UserProductivityReport {
  return {
    metadata: {
      report_id: `user-${Date.now()}`,
      report_type: 'user_productivity',
      generated_at: new Date().toISOString(),
      generated_by: 'frontend',
      parameters: {
        start_date: startDate,
        end_date: endDate,
        tasks_in_range: 0,
        total_tasks: totalTasks
      }
    },
    summary: {
      total_users: 0,
      total_tasks_assigned: 0,
      total_completed: 0,
      average_completion_rate: 0
    },
    data: {
      team_members: []
    }
  };
}


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
