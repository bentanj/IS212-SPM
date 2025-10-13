import { Task, taskMockData } from '@/mocks/staff/taskMockData';

/**
 * Get all tasks for a specific project (by project name)
 * 
 * MOCK IMPLEMENTATION: Filters taskMockData by projectName
 * REAL IMPLEMENTATION: Will call backend API
 */
// this functions returns all the task for 1 project that you asked for
export async function getTasksByProject(projectName: string): Promise<Task[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // MOCK: Filter tasks by project name (case-insensitive)
  const projectTasks = taskMockData.tasks.filter(task => 
    task.projectName.toLowerCase() === projectName.toLowerCase()
  );
  
  return projectTasks;
}

/**
 * Get task count for a project
 */
export async function getTaskCountForProject(projectName: string): Promise<number> {
  const tasks = await getTasksByProject(projectName);
  return tasks.length;
}

/**
 * Get only parent tasks (no subtasks) for a project
 * Useful if you want to show a cleaner list
 */
export async function getParentTasksByProject(projectName: string): Promise<Task[]> {
  const allTasks = await getTasksByProject(projectName);
  return allTasks.filter(task => !task.parentTaskId);
}