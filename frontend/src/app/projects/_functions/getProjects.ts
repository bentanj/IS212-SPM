import { TProject } from '@/types/TProject';
import { projectMockData } from '@/mocks/staff/projectMockData';

/**
 * Returns all projects
 * 
 * MOCK IMPLEMENTATION: Returns all projects from mock data
 * REAL IMPLEMENTATION: Will call backend API
 */
// function to get a list of all the projects including details
export async function getAllProjects(): Promise<TProject[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return projectMockData;
  
  // REAL (later):
  // const response = await fetch('/api/projects');
  // return response.json();
}

/**
 * Get a single project by name icluding details
 */
export async function getProjectByName(projectName: string): Promise<TProject | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const project = projectMockData.find(
    p => p.name.toLowerCase() === projectName.toLowerCase()
  );
  return project || null;
  
  // REAL (later):
  // const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}`);
  // if (!response.ok) return null;
  // return response.json();
}

/**
 * Requirement 1: Return projects where staff is assignee of at least one task/subtask
 * TODO: Implement once we integrate with task data
 */
export async function getProjectsForStaff(staffId: string): Promise<TProject[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // MOCK: For now, return all projects
  return projectMockData;
  
  // REAL (later):
  // const response = await fetch(`/api/projects/staff/${staffId}`);
  // return response.json();
}

/**
 * Requirement 2: Return projects where staff's department colleagues are assignees
 * TODO: Implement once we integrate with staff/task data
 */
export async function getProjectsForDepartment(staffId: string): Promise<TProject[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // MOCK: For now, return all projects
  return projectMockData;
  
  // REAL (later):
  // const response = await fetch(`/api/projects/department/${staffId}`);
  // return response.json();
}