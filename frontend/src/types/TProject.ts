/**
 * Represents a project in the system
 * Each project can have multiple tasks
 */
export interface TProject {
  name: string;                  // Project name (e.g., "Website Rebuild")
  description?: string;          // Optional description
  status: 'active' | 'completed' | 'on-hold';  // Current status
  taskCount: number;             // Total number of tasks in this project
  createdAt: Date;              // When project was created
  updatedAt: Date;              // Last modified date
}

/**
 * Type for project status - used in filters
 */
export type TProjectStatus = 'active' | 'completed' | 'on-hold' | 'all';