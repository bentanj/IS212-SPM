/**
 * Report Type Definitions
 * Matches backend API response structure
 */

export interface ReportMetadata {
  report_id: string;
  report_type: string;
  generated_at: string;
  generated_by: string | null;
  parameters: Record<string, any>;
}

export interface TaskDetail {
  id: number;
  title: string;
  status: 'Completed' | 'In Progress' | 'To Do' | 'Blocked';
  priority: 'High' | 'Medium' | 'Low';
  projectName: string | null;  // ✅ CHANGED: Allow null
  startDate: string | null;
  completedDate: string | null;
  dueDate: string | null;
  description: string;
  assignedUsers: AssignedUser[] | null;  // ✅ CHANGED: Allow null
}

export interface AssignedUser {
  id: string;
  name: string;
  department: string;
  role: string;
}

export interface TaskCompletionSummary {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  to_do_tasks: number;
  blocked_tasks: number;
  completion_rate: number;
  by_priority: Record<string, number>;
  unique_projects: number;
  unique_departments: number;
}

export interface TaskCompletionData {
  tasks: TaskDetail[];
}

export interface TaskCompletionReport {
  metadata: ReportMetadata;
  data: TaskCompletionData;
  summary: TaskCompletionSummary;
}

export interface ProjectStatistics {
  project_name: string | null;  // ✅ CHANGED: Allow null
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

export interface TeamMemberStats {
  user_id: string;
  total_tasks: number;
  completed: number;
  in_progress: number;
  completion_rate: number;
}

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

export interface ReportsSummary {
  total_tasks: number;
  completion_rate: number;
  total_projects: number;
  total_team_members: number;
  generated_at: string;
}

export interface AvailableReport {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}
