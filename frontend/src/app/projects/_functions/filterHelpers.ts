// src/app/projects/_functions/filterHelpers.ts

import { TProject, TProjectStatus } from '@/types/TProject';

/**
 * Filters projects by search term (searches in name and description)
 * 
 * @param projects - Array of projects to search
 * @param searchTerm - The search string
 * @returns Filtered array of projects
 */
export function searchProjects(
  projects: TProject[],
  searchTerm: string
): TProject[] {
  if (!searchTerm.trim()) {
    return projects; // No search term, return all
  }

  const lowerSearch = searchTerm.toLowerCase();
  
  return projects.filter(project => 
    project.name.toLowerCase().includes(lowerSearch) ||
    project.description?.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Filters projects by status
 * 
 * @param projects - Array of projects to filter
 * @param status - Status to filter by ('all' returns everything)
 * @returns Filtered array of projects
 */
export function filterProjectsByStatus(
  projects: TProject[],
  status: TProjectStatus
): TProject[] {
  if (status === 'all') {
    return projects;
  }
  
  return projects.filter(project => project.status === status);
}

/**
 * Sorts projects by a field
 * 
 * @param projects - Array of projects to sort
 * @param field - Field to sort by
 * @param direction - 'asc' or 'desc'
 * @returns Sorted array of projects
 */
export function sortProjects(
  projects: TProject[],
  field: keyof TProject,
  direction: 'asc' | 'desc' = 'asc'
): TProject[] {
  return [...projects].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return direction === 'asc' 
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }
    
    // Handle strings
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
}

/**
 * Combines search and filter operations
 * This is what you'll call from your page component
 * 
 * @param projects - Array of projects
 * @param searchTerm - Search string
 * @param status - Status filter
 * @returns Filtered and searched projects
 */
export function applyProjectFilters(
  projects: TProject[],
  searchTerm: string,
  status: TProjectStatus
): TProject[] {
  let result = projects;
  
  // Apply search
  result = searchProjects(result, searchTerm);
  
  // Apply status filter
  result = filterProjectsByStatus(result, status);
  
  return result;
}