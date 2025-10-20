// src/types/report.types.ts

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

// Team Productivity Report Types (Per User)
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

// Combined Task Completion Report Type
export type TaskCompletionReport = ProjectPerformanceReport | TeamProductivityReport;

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
