// src/app/projects/_functions/getProjects.ts

import { TProject } from '@/types/TProject';
import { projectMockData } from '@/mocks/staff/projectMockData';
// LATER: import your task mock data when implementing requirements
// import { taskMockData } from '@/mocks/staff/taskMockData';

/**
 * Returns all projects
 * 
 * MOCK IMPLEMENTATION: Returns all projects from mock data
 * REAL IMPLEMENTATION: Will call backend API
 * 
 * @returns Promise<TProject[]> - List of all projects
 */
export async function getAllProjects(): Promise<TProject[]> {
  // Simulate API delay (remove this later)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // MOCK: Return all projects
  return projectMockData;
  
  // REAL (later): 
  // const response = await fetch('/api/projects');
  // return response.json();
}

/**
 * Requirement 1: Return projects where staff is assignee of at least one task/subtask
 * 
 * MOCK IMPLEMENTATION: Filters mock data
 * REAL IMPLEMENTATION: Backend will do this filtering
 * 
 * @param staffId - The ID of the staff member
 * @returns Promise<TProject[]> - Projects where staff is assigned
 */
export async function getProjectsForStaff(staffId: string): Promise<TProject[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // MOCK: For now, return all projects
  // TODO: Implement filtering logic once we see your task data structure
  return projectMockData;
  
  // REAL (later):
  // const response = await fetch(`/api/projects/staff/${staffId}`);
  // return response.json();
}

/**
 * Requirement 2: Return projects where staff's department colleagues are assignees
 * 
 * MOCK IMPLEMENTATION: Filters mock data
 * REAL IMPLEMENTATION: Backend will do this filtering
 * 
 * @param staffId - The ID of the staff member
 * @returns Promise<TProject[]> - Projects where department colleagues are assigned
 */
export async function getProjectsForDepartment(staffId: string): Promise<TProject[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // MOCK: For now, return all projects
  // TODO: Implement filtering logic once we see your staff/task data structure
  return projectMockData;
  
  // REAL (later):
  // const response = await fetch(`/api/projects/department/${staffId}`);
  // return response.json();
}

/**
 * Get a single project by ID
 * 
 * @param projectId - The project ID
 * @returns Promise<TProject | null> - The project or null if not found
 */
export async function getProjectById(projectId: string): Promise<TProject | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // MOCK: Find in mock data
  const project = projectMockData.find(p => p.name === projectId);
  return project || null;
  
  // REAL (later):
  // const response = await fetch(`/api/projects/${projectId}`);
  // if (!response.ok) return null;
  // return response.json();
}