// src/data/mockLoggedTimeData.ts
import dayjs from 'dayjs';
import { LoggedTimeEntry } from '@/types/report.types';

/**
 * Mock Logged Time Data
 * Represents work sessions over a 2-week period (Oct 14-25, 2025)
 * Uses real users, departments, and projects from the system
 */

export const mockLoggedTimeData: LoggedTimeEntry[] = [
  // Week 1: Oct 14-18, 2025
  
  // John Smith - Engineering Operation Division
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-14 08:00'),
    logoutTime: dayjs('2025-10-14 12:00'),
    projectName: "E-Commerce Platform",
    department: "Engineering Operation Division"
  },
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-14 13:00'),
    logoutTime: dayjs('2025-10-14 17:30'),
    projectName: "E-Commerce Platform",
    department: "Engineering Operation Division"
  },
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-15 08:30'),
    logoutTime: dayjs('2025-10-15 17:00'),
    projectName: "Performance Enhancement",
    department: "Engineering Operation Division"
  },
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-16 09:00'),
    logoutTime: dayjs('2025-10-16 18:00'),
    projectName: "E-Commerce Platform",
    department: "Engineering Operation Division"
  },
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-17 08:00'),
    logoutTime: dayjs('2025-10-17 16:30'),
    projectName: "Quality Assurance",
    department: "Engineering Operation Division"
  },

  // Sarah Davis - Senior Engineers
  {
    userName: "Sarah Davis",
    loginTime: dayjs('2025-10-14 09:00'),
    logoutTime: dayjs('2025-10-14 17:30'),
    projectName: "API Gateway Project",
    department: "Senior Engineers"
  },
  {
    userName: "Sarah Davis",
    loginTime: dayjs('2025-10-15 08:30'),
    logoutTime: dayjs('2025-10-15 12:30'),
    projectName: "API Gateway Project",
    department: "Senior Engineers"
  },
  {
    userName: "Sarah Davis",
    loginTime: dayjs('2025-10-15 13:30'),
    logoutTime: dayjs('2025-10-15 18:00'),
    projectName: "Security Enhancement",
    department: "Senior Engineers"
  },
  {
    userName: "Sarah Davis",
    loginTime: dayjs('2025-10-16 08:00'),
    logoutTime: dayjs('2025-10-16 17:00'),
    projectName: "API Gateway Project",
    department: "Senior Engineers"
  },

  // Alice Johnson - Engineering Operation Division (Manager)
  {
    userName: "Alice Johnson",
    loginTime: dayjs('2025-10-14 08:00'),
    logoutTime: dayjs('2025-10-14 11:00'),
    projectName: "Development Process Improvement",
    department: "Engineering Operation Division"
  },
  {
    userName: "Alice Johnson",
    loginTime: dayjs('2025-10-14 13:00'),
    logoutTime: dayjs('2025-10-14 16:00'),
    projectName: "Performance Enhancement",
    department: "Engineering Operation Division"
  },
  {
    userName: "Alice Johnson",
    loginTime: dayjs('2025-10-15 09:00'),
    logoutTime: dayjs('2025-10-15 17:30'),
    projectName: "Development Process Improvement",
    department: "Engineering Operation Division"
  },
  {
    userName: "Alice Johnson",
    loginTime: dayjs('2025-10-17 08:30'),
    logoutTime: dayjs('2025-10-17 12:00'),
    projectName: "Quality Assurance",
    department: "Engineering Operation Division"
  },

  // Mike Wilson - Operation Planning Team (Manager)
  {
    userName: "Mike Wilson",
    loginTime: dayjs('2025-10-14 09:00'),
    logoutTime: dayjs('2025-10-14 13:00'),
    projectName: "Customer Experience Enhancement",
    department: "Operation Planning Team"
  },
  {
    userName: "Mike Wilson",
    loginTime: dayjs('2025-10-14 14:00'),
    logoutTime: dayjs('2025-10-14 18:00'),
    projectName: "Product Strategy Tools",
    department: "Operation Planning Team"
  },
  {
    userName: "Mike Wilson",
    loginTime: dayjs('2025-10-15 08:00'),
    logoutTime: dayjs('2025-10-15 16:30'),
    projectName: "Customer Experience Enhancement",
    department: "Operation Planning Team"
  },

  // Emma Thompson - Engineering Operation Division
  {
    userName: "Emma Thompson",
    loginTime: dayjs('2025-10-14 08:30'),
    logoutTime: dayjs('2025-10-14 17:00'),
    projectName: "Mobile App Redesign",
    department: "Engineering Operation Division"
  },
  {
    userName: "Emma Thompson",
    loginTime: dayjs('2025-10-15 09:00'),
    logoutTime: dayjs('2025-10-15 18:00'),
    projectName: "Mobile App Redesign",
    department: "Engineering Operation Division"
  },
  {
    userName: "Emma Thompson",
    loginTime: dayjs('2025-10-16 08:00'),
    logoutTime: dayjs('2025-10-16 12:00'),
    projectName: "Performance Enhancement",
    department: "Engineering Operation Division"
  },
  {
    userName: "Emma Thompson",
    loginTime: dayjs('2025-10-16 13:00'),
    logoutTime: dayjs('2025-10-16 17:30'),
    projectName: "Mobile App Redesign",
    department: "Engineering Operation Division"
  },

  // David Chen - Operation Planning Team
  {
    userName: "David Chen",
    loginTime: dayjs('2025-10-14 09:00'),
    logoutTime: dayjs('2025-10-14 17:30'),
    projectName: "Financial Process Optimization",
    department: "Operation Planning Team"
  },
  {
    userName: "David Chen",
    loginTime: dayjs('2025-10-15 08:30'),
    logoutTime: dayjs('2025-10-15 17:00'),
    projectName: "Financial Process Optimization",
    department: "Operation Planning Team"
  },
  {
    userName: "David Chen",
    loginTime: dayjs('2025-10-16 09:00'),
    logoutTime: dayjs('2025-10-16 16:00'),
    projectName: "Product Strategy Tools",
    department: "Operation Planning Team"
  },

  // Rachel Green - IT Division (Manager)
  {
    userName: "Rachel Green",
    loginTime: dayjs('2025-10-14 08:00'),
    logoutTime: dayjs('2025-10-14 12:30'),
    projectName: "Security Enhancement",
    department: "IT Division"
  },
  {
    userName: "Rachel Green",
    loginTime: dayjs('2025-10-14 13:30'),
    logoutTime: dayjs('2025-10-14 17:00'),
    projectName: "Identity Management",
    department: "IT Division"
  },
  {
    userName: "Rachel Green",
    loginTime: dayjs('2025-10-15 09:00'),
    logoutTime: dayjs('2025-10-15 18:00'),
    projectName: "Security Enhancement",
    department: "IT Division"
  },
  {
    userName: "Rachel Green",
    loginTime: dayjs('2025-10-16 08:30'),
    logoutTime: dayjs('2025-10-16 17:30'),
    projectName: "Identity Management",
    department: "IT Division"
  },

  // James Rodriguez - IT Division
  {
    userName: "James Rodriguez",
    loginTime: dayjs('2025-10-14 09:00'),
    logoutTime: dayjs('2025-10-14 17:00'),
    projectName: "API Gateway Project",
    department: "IT Division"
  },
  {
    userName: "James Rodriguez",
    loginTime: dayjs('2025-10-15 08:00'),
    logoutTime: dayjs('2025-10-15 16:30'),
    projectName: "Security Enhancement",
    department: "IT Division"
  },
  {
    userName: "James Rodriguez",
    loginTime: dayjs('2025-10-16 09:00'),
    logoutTime: dayjs('2025-10-16 18:00'),
    projectName: "API Gateway Project",
    department: "IT Division"
  },
  {
    userName: "James Rodriguez",
    loginTime: dayjs('2025-10-17 08:30'),
    logoutTime: dayjs('2025-10-17 17:00'),
    projectName: "Identity Management",
    department: "IT Division"
  },

  // Kevin Park - L&D Team (Manager)
  {
    userName: "Kevin Park",
    loginTime: dayjs('2025-10-14 08:30'),
    logoutTime: dayjs('2025-10-14 16:00'),
    projectName: "HR Digitization",
    department: "L&D Team"
  },
  {
    userName: "Kevin Park",
    loginTime: dayjs('2025-10-15 09:00'),
    logoutTime: dayjs('2025-10-15 17:30'),
    projectName: "HR Digitization",
    department: "L&D Team"
  },
  {
    userName: "Kevin Park",
    loginTime: dayjs('2025-10-16 08:00'),
    logoutTime: dayjs('2025-10-16 12:00'),
    projectName: "Compliance Management",
    department: "L&D Team"
  },

  // Lisa Wang - L&D Team
  {
    userName: "Lisa Wang",
    loginTime: dayjs('2025-10-14 09:00'),
    logoutTime: dayjs('2025-10-14 17:00'),
    projectName: "HR Digitization",
    department: "L&D Team"
  },
  {
    userName: "Lisa Wang",
    loginTime: dayjs('2025-10-15 08:30'),
    logoutTime: dayjs('2025-10-15 16:30'),
    projectName: "HR Digitization",
    department: "L&D Team"
  },

  // Week 2: Oct 21-25, 2025

  // John Smith - Engineering Operation Division
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-21 08:00'),
    logoutTime: dayjs('2025-10-21 17:00'),
    projectName: "E-Commerce Platform",
    department: "Engineering Operation Division"
  },
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-22 08:30'),
    logoutTime: dayjs('2025-10-22 17:30'),
    projectName: "E-Commerce Platform",
    department: "Engineering Operation Division"
  },
  {
    userName: "John Smith",
    loginTime: dayjs('2025-10-23 09:00'),
    logoutTime: dayjs('2025-10-23 18:00'),
    projectName: "Performance Enhancement",
    department: "Engineering Operation Division"
  },

  // Sarah Davis - Senior Engineers
  {
    userName: "Sarah Davis",
    loginTime: dayjs('2025-10-21 08:00'),
    logoutTime: dayjs('2025-10-21 17:00'),
    projectName: "API Gateway Project",
    department: "Senior Engineers"
  },
  {
    userName: "Sarah Davis",
    loginTime: dayjs('2025-10-22 09:00'),
    logoutTime: dayjs('2025-10-22 18:00'),
    projectName: "Security Enhancement",
    department: "Senior Engineers"
  },
  {
    userName: "Sarah Davis",
    loginTime: dayjs('2025-10-23 08:30'),
    logoutTime: dayjs('2025-10-23 17:30'),
    projectName: "API Gateway Project",
    department: "Senior Engineers"
  },

  // Emma Thompson - Engineering Operation Division
  {
    userName: "Emma Thompson",
    loginTime: dayjs('2025-10-21 08:00'),
    logoutTime: dayjs('2025-10-21 16:30'),
    projectName: "Mobile App Redesign",
    department: "Engineering Operation Division"
  },
  {
    userName: "Emma Thompson",
    loginTime: dayjs('2025-10-22 09:00'),
    logoutTime: dayjs('2025-10-22 17:00'),
    projectName: "Mobile App Redesign",
    department: "Engineering Operation Division"
  },
  {
    userName: "Emma Thompson",
    loginTime: dayjs('2025-10-23 08:30'),
    logoutTime: dayjs('2025-10-23 17:30'),
    projectName: "Performance Enhancement",
    department: "Engineering Operation Division"
  },

  // Rachel Green - IT Division
  {
    userName: "Rachel Green",
    loginTime: dayjs('2025-10-21 09:00'),
    logoutTime: dayjs('2025-10-21 18:00'),
    projectName: "Security Enhancement",
    department: "IT Division"
  },
  {
    userName: "Rachel Green",
    loginTime: dayjs('2025-10-22 08:00'),
    logoutTime: dayjs('2025-10-22 17:00'),
    projectName: "Identity Management",
    department: "IT Division"
  },
  {
    userName: "Rachel Green",
    loginTime: dayjs('2025-10-23 08:30'),
    logoutTime: dayjs('2025-10-23 17:30'),
    projectName: "Security Enhancement",
    department: "IT Division"
  },

  // James Rodriguez - IT Division
  {
    userName: "James Rodriguez",
    loginTime: dayjs('2025-10-21 08:00'),
    logoutTime: dayjs('2025-10-21 17:00'),
    projectName: "API Gateway Project",
    department: "IT Division"
  },
  {
    userName: "James Rodriguez",
    loginTime: dayjs('2025-10-22 09:00'),
    logoutTime: dayjs('2025-10-22 18:00'),
    projectName: "Security Enhancement",
    department: "IT Division"
  },
  {
    userName: "James Rodriguez",
    loginTime: dayjs('2025-10-23 08:30'),
    logoutTime: dayjs('2025-10-23 16:30'),
    projectName: "Identity Management",
    department: "IT Division"
  },

  // David Chen - Operation Planning Team
  {
    userName: "David Chen",
    loginTime: dayjs('2025-10-21 09:00'),
    logoutTime: dayjs('2025-10-21 17:30'),
    projectName: "Financial Process Optimization",
    department: "Operation Planning Team"
  },
  {
    userName: "David Chen",
    loginTime: dayjs('2025-10-22 08:00'),
    logoutTime: dayjs('2025-10-22 16:00'),
    projectName: "Product Strategy Tools",
    department: "Operation Planning Team"
  },

  // Kevin Park - L&D Team
  {
    userName: "Kevin Park",
    loginTime: dayjs('2025-10-21 09:00'),
    logoutTime: dayjs('2025-10-21 17:00'),
    projectName: "HR Digitization",
    department: "L&D Team"
  },
  {
    userName: "Kevin Park",
    loginTime: dayjs('2025-10-22 08:30'),
    logoutTime: dayjs('2025-10-22 16:30'),
    projectName: "Compliance Management",
    department: "L&D Team"
  },

  // Lisa Wang - L&D Team
  {
    userName: "Lisa Wang",
    loginTime: dayjs('2025-10-21 08:00'),
    logoutTime: dayjs('2025-10-21 16:00'),
    projectName: "HR Digitization",
    department: "L&D Team"
  },
  {
    userName: "Lisa Wang",
    loginTime: dayjs('2025-10-22 09:00'),
    logoutTime: dayjs('2025-10-22 17:00'),
    projectName: "HR Digitization",
    department: "L&D Team"
  },

  // Alice Johnson - Engineering Operation Division
  {
    userName: "Alice Johnson",
    loginTime: dayjs('2025-10-21 08:00'),
    logoutTime: dayjs('2025-10-21 16:00'),
    projectName: "Development Process Improvement",
    department: "Engineering Operation Division"
  },
  {
    userName: "Alice Johnson",
    loginTime: dayjs('2025-10-22 09:00'),
    logoutTime: dayjs('2025-10-22 17:30'),
    projectName: "Quality Assurance",
    department: "Engineering Operation Division"
  },

  // Mike Wilson - Operation Planning Team
  {
    userName: "Mike Wilson",
    loginTime: dayjs('2025-10-21 09:00'),
    logoutTime: dayjs('2025-10-21 17:00'),
    projectName: "Customer Experience Enhancement",
    department: "Operation Planning Team"
  },
  {
    userName: "Mike Wilson",
    loginTime: dayjs('2025-10-22 08:00'),
    logoutTime: dayjs('2025-10-22 16:30'),
    projectName: "Product Strategy Tools",
    department: "Operation Planning Team"
  },
];

/**
 * Mock data statistics for reference:
 * - Date Range: Oct 14-25, 2025 (2 weeks)
 * - Total Entries: 60
 * - Unique Users: 10
 * - Unique Departments: 5 (Engineering Operation Division, Senior Engineers, Operation Planning Team, IT Division, L&D Team)
 * - Unique Projects: 15
 */