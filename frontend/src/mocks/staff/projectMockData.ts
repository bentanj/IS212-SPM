// to import the project object structure to be used later
import { TProject } from '@/types/TProject';

/**
 * Mock data for projects, before we implement API call, the projectName here does not match that of taskMockData.ts
 * data is stored in the array which is represnted using a constant
 * ensures that the data inside matches that of the project object
 * export allows it to be used by other files
 */
export const projectMockData: TProject[] = [
  {
    name: 'Website Rebuild',
    description: 'Complete overhaul of company website with modern design and improved user experience',
    status: 'active',
    taskCount: 12,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    name: 'Mobile App Development',
    description: 'iOS and Android app for customer portal with real-time notifications',
    status: 'active',
    taskCount: 8,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-10-03'),
  },
  {
    name: 'Q4 Marketing Campaign',
    description: 'Social media and email marketing initiatives for Q4 product launch',
    status: 'completed',
    taskCount: 5,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-09-28'),
  },
  {
    name: 'Infrastructure Upgrade',
    description: 'Server migration and security improvements for production environment',
    status: 'on-hold',
    taskCount: 15,
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-09-20'),
  },
  {
    name: 'Customer Portal',
    description: 'Self-service portal for customers to manage accounts and view analytics',
    status: 'active',
    taskCount: 10,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-10-07'),
  },
  {
    name: 'Data Analytics Dashboard',
    description: 'Internal dashboard for tracking KPIs and business metrics',
    status: 'active',
    taskCount: 7,
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-10-08'),
  },
];

/**
 * Helper function to get a single project by name, different from filterhelpers that is just meant for display filtering through search bar
 * this is used after they click on an item from the filtered list
 */
export function getProjectByName(name: string): TProject | undefined {
  return projectMockData.find(
    project => project.name.toLowerCase() === name.toLowerCase()
  );
}