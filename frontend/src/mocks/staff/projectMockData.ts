import { TProject } from '@/types/TProject';

/**
 * Mock data for projects
 * 
 * IMPORTANT: The 'name' field here MUST match the 'projectName' 
 * field in your taskMockData.ts so we can link tasks to projects
 * 
 * This is simulating what your backend API will return
 */
export const projectMockData: TProject[] = [
  {
    name: 'Website Rebuild',
    description: 'Complete overhaul of company website with modern design',
    status: 'active',
    taskCount: 12,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    name: 'Mobile App Development',
    description: 'iOS and Android app for customer portal',
    status: 'active',
    taskCount: 8,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-10-03'),
  },
  {
    name: 'Q4 Marketing Campaign',
    description: 'Social media and email marketing for Q4',
    status: 'completed',
    taskCount: 5,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-09-28'),
  },
  {
    name: 'Infrastructure Upgrade',
    description: 'Server migration and security improvements',
    status: 'on-hold',
    taskCount: 15,
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-09-20'),
  },
  {
    name: 'Customer Portal',
    description: 'Self-service portal for customers',
    status: 'active',
    taskCount: 10,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-10-07'),
  },
];

/**
 * Helper function to get a single project by ID
 * This simulates a backend endpoint like: GET /api/projects/:id
 */
export function getProjectById(id: string): TProject | undefined {
  return projectMockData.find(project => project.name === id);
}

/**
 * Helper function to get a project by name
 * Useful if your tasks reference projects by name instead of ID
 */
export function getProjectByName(name: string): TProject | undefined {
  return projectMockData.find(
    project => project.name.toLowerCase() === name.toLowerCase()
  );
}