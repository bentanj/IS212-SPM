// to import the project object structure to be used later
import { TProject } from '@/types/TProject';

/**
 * Mock data for projects. Names and task counts are now synced with taskMockData.ts
 * to allow for a complete user flow from project to task details.
 */
export const projectMockData: TProject[] = [
  {
    name: 'E-Commerce Platform',
    description: 'Building a full-featured online shopping platform with user authentication and a secure database.',
    status: 'active',
    taskCount: 11, // Calculated from taskMockData
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-10-10'),
  },
  {
    name: 'API Gateway Project',
    description: 'Centralizing and managing all public-facing APIs with rate limiting and security features.',
    status: 'active',
    taskCount: 5, // Calculated from taskMockData
    createdAt: new Date('2025-08-15'),
    updatedAt: new Date('2025-10-12'),
  },
  {
    name: 'Quality Assurance',
    description: 'Establishing infrastructure and processes for automated load testing and integration testing.',
    status: 'active',
    taskCount: 9, // Calculated from taskMockData
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-10-14'),
  },
  {
    name: 'Development Process Improvement',
    description: 'Defining and documenting new engineering workflows and code review best practices.',
    status: 'on-hold',
    taskCount: 1, // Calculated from taskMockData
    createdAt: new Date('2025-09-05'),
    updatedAt: new Date('2025-09-12'),
  },
  {
    name: 'Performance Enhancement',
    description: 'Researching and identifying opportunities to optimize application performance.',
    status: 'completed',
    taskCount: 1, // Calculated from taskMockData
    createdAt: new Date('2025-09-02'),
    updatedAt: new Date('2025-09-14'),
  },
  {
    name: 'Security Enhancement',
    description: 'Implementing automated security testing tools and penetration testing scripts.',
    status: 'active',
    taskCount: 1, // Calculated from taskMockData
    createdAt: new Date('2025-09-10'),
    updatedAt: new Date('2025-10-05'),
  },
  {
    name: 'Documentation Initiative',
    description: 'Automating the generation of API documentation for all public endpoints.',
    status: 'on-hold',
    taskCount: 1, // Calculated from taskMockData
    createdAt: new Date('2025-09-18'),
    updatedAt: new Date('2025-09-20'),
  },
];

/**
 * Helper function to get a single project by name.
 */
export function getProjectByName(name: string): TProject | undefined {
  return projectMockData.find(
    project => project.name.toLowerCase() === name.toLowerCase()
  );
}