import { TProject, TProjectStatus } from '@/types/TProject';

/**
 * Filters projects by search term (searches in name and description) can be changed to just name
 */
export function searchProjects(
  projects: TProject[],
  searchTerm: string
): TProject[] {
  if (!searchTerm.trim()) {
    return projects;
  }

  const lowerSearch = searchTerm.toLowerCase();
  
  return projects.filter(project => 
    project.name.toLowerCase().includes(lowerSearch) ||
    project.description?.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Filters projects by status
 */
export function filterProjectsByStatus(
  projects: TProject[],
  status: TProjectStatus
): TProject[] {
  // Make the 'All' check case-insensitive
  if (status.toLowerCase() === 'all') {
    return projects;
  }
  
  // Convert BOTH the project's status AND the filter status to lowercase
  // This makes the comparison case-insensitive and very safe.
  return projects.filter(project => 
    project.status.toLowerCase() === status.toLowerCase()
  );
}
/**
 * Sorts projects by a field
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