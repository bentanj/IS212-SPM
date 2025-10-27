// src/types/report.types.ts

/**
 * Report Type Definitions
 * Matches backend API response structure
 */

import { Dayjs } from 'dayjs';

export interface ReportMetadata {
  report_id: string;
  report_type: string;
  generated_at: string;
  generated_by: string | null;
  parameters: Record<string, any>;
}

// Project Performance Report Types (Per Project)
export interface ProjectStatistics {
  project_name: string | null;
  total_tasks: number;
  completed: number;
  in_progress: number;
  to_do: number;
  blocked: number;
  completion_rate: number;
}

export interface ProjectPerformanceData {
  projects: ProjectStatistics[];
}

export interface ProjectPerformanceSummary {
  total_projects: number;
  total_tasks: number;
  total_completed: number;
  average_completion_rate: number;
}

export interface ProjectPerformanceReport {
  metadata: ReportMetadata;
  data: ProjectPerformanceData;
  summary: ProjectPerformanceSummary;
}

// User Productivity Report Types (Per User)
export interface TeamMemberStats {
  user_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  total_tasks: number;
  completed: number;
  in_progress: number;
  todo: number;
  blocked: number;
  completion_rate: number;
}

export interface UserProductivityData {
  team_members: TeamMemberStats[];
}

export interface UserProductivitySummary {
  total_users: number;
  total_tasks_assigned: number;
  total_completed: number;
  average_completion_rate: number;
}

export interface UserProductivityReport {
  metadata: ReportMetadata;
  data: UserProductivityData;
  summary: UserProductivitySummary;
}

// Team Productivity Report Types (Alternative naming - same as UserProductivityReport)
export interface TeamProductivityData {
  team_members: TeamMemberStats[];
}

export interface TeamProductivitySummary {
  total_team_members: number;
  total_tasks_assigned: number;
  total_completed: number;
  average_completion_rate: number;
}

export interface TeamProductivityReport {
  metadata: ReportMetadata;
  data: TeamProductivityData;
  summary: TeamProductivitySummary;
}

// Department Task Activity Report Types
export interface TaskStatusCount {
  to_do: number;
  in_progress: number;
  blocked: number;
  completed: number;
  overdue: number;
}

export interface WeeklyData extends TaskStatusCount {
  week_start: string;  // ISO date string
  week_end: string;
}

export interface MonthlyData extends TaskStatusCount {
  month: string;  // e.g., "2025-10"
  month_name: string;  // e.g., "October 2025"
}

export interface DepartmentTaskActivityData {
  department: string;
  aggregation: 'weekly' | 'monthly';
  weekly_data?: WeeklyData[];
  monthly_data?: MonthlyData[];
  total_tasks: number;
}

export interface DepartmentTaskActivitySummary {
  department: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  total_tasks: number;
  status_totals: TaskStatusCount;
  aggregation_type: 'weekly' | 'monthly';
}

export interface DepartmentTaskActivityReport {
  metadata: ReportMetadata;
  data: DepartmentTaskActivityData;
  summary: DepartmentTaskActivitySummary;
}

// Combined Task Completion Report Type
export type TaskCompletionReport = ProjectPerformanceReport | UserProductivityReport | TeamProductivityReport | DepartmentTaskActivityReport;

// Reports Summary
export interface ReportsSummary {
  total_tasks: number;
  completion_rate: number;
  total_projects: number;
  total_team_members: number;
  generated_at: string;
}

// Available Report
export interface AvailableReport {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
}

// Error handling
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

// Report Sub-Type identifier
export type ReportSubType = 'per-user' | 'per-project';

// Logged Time Report Types
export interface LoggedTimeEntry {
  userName: string;           // Name of the user who logged the time
  loginTime: Dayjs;           // Dayjs object for easy date manipulation
  logoutTime: Dayjs;          // Dayjs object for easy date manipulation
  projectName: string;        // Name of the project worked on
  department: string;         // User's department (e.g., "Engineering", "Design")
}

// Aggregated time statistics for a single user
export interface UserTimeStats {
  userName: string;           // Name of the user
  totalHours: number;         // Total hours worked (calculated from all entries)
  totalSessions: number;      // Number of logged time sessions
}