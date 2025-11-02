import { Task } from '@/types';
import { TProject } from '@/types/TProject';
import { projectMockData } from '@/mocks/allProjects';

/**
 * Extracts unique projects from a task array and enriches with mock project details
 * @param tasks - Array of tasks from API
 * @returns Array of TProject objects with actual task counts
 */
export function getProjectsByTasks(tasks: Task[]): TProject[] {
  // Extract unique project names from tasks
  const projectNames = new Set<string>();
  tasks.forEach(task => {
    if (task.project_name) {
      projectNames.add(task.project_name);
    }
  });

  // Create enriched projects array
  const projects: TProject[] = [];

  projectNames.forEach(projectName => {
    // Find matching project in mock data
    const mockProject = projectMockData.find(
      p => p.name.toLowerCase() === projectName.toLowerCase()
    );

    // Count actual tasks for this project (including subtasks)
    const taskCount = tasks.filter(
      task => task.project_name?.toLowerCase() === projectName.toLowerCase()
    ).length;

    if (mockProject) {
      // Use mock data but with real task count
      projects.push({
        ...mockProject,
        taskCount: taskCount,
        updatedAt: new Date(), // Update to current date since we have new task data
      });
    } else {
      // Project exists in tasks but not in mock data - create basic entry
      projects.push({
        name: projectName,
        description: `Project: ${projectName}`,
        status: 'active',
        taskCount: taskCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return projects;
}

/**
 * Filters tasks by project name
 * @param projectName - Name of the project
 * @param tasks - All tasks array
 * @returns Tasks belonging to the specified project
 */
export function getTasksByProject(projectName: string, tasks: Task[]): Task[] {
  return tasks.filter(
    task => task.project_name?.toLowerCase() === projectName.toLowerCase()
  );
}


