// Updated User interface with additional attributes

export interface User {
  userId: number;
  name: string;
  email: string;
  role: 'Staff' | 'Manager' | 'Admin';
  department: string;
}

export interface Comment {
  commentId: number;
  author: string;
  content: string;
  timestamp: string;
}

export interface Task {
  taskId: number;
  title: string;
  description: string;
  startDate: string;
  completedDate: string | null;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedUsers: User[];
  tags: string[];
  status: 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
  comments: Comment[];
  projectName: string;
  ownerId: number;
  sharedWith: number[];
}

export interface CurrentUser {
  userId: number;
  name: string;
  systemRole: string;
}

export interface MockData {
  currentUser: CurrentUser;
  tasks: Task[];
  users: User[];
}

// Mock user data with all required attributes
export const userMockData: User[] = [
  {
    userId: 1,
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Staff",
    department: "Engineering"
  },
  {
    userId: 2,
    name: "Sarah Davis",
    email: "sarah.davis@company.com",
    role: "Manager",
    department: "DevOps"
  },
  {
    userId: 3,
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    role: "Staff",
    department: "Frontend Development"
  },
  {
    userId: 4,
    name: "Mike Wilson",
    email: "mike.wilson@company.com",
    role: "Manager",
    department: "Project Management"
  },
  {
    userId: 5,
    name: "Emma Thompson",
    email: "emma.thompson@company.com",
    role: "Staff",
    department: "Quality Assurance"
  },
  {
    userId: 6,
    name: "David Chen",
    email: "david.chen@company.com",
    role: "Staff",
    department: "Quality Assurance"
  },
  {
    userId: 7,
    name: "Rachel Green",
    email: "rachel.green@company.com",
    role: "Admin",
    department: "IT Administration"
  },
  {
    userId: 8,
    name: "Michael Brown",
    email: "michael.brown@company.com",
    role: "Manager",
    department: "Security"
  },
  {
    userId: 9,
    name: "Jennifer Wilson",
    email: "jennifer.wilson@company.com",
    role: "Staff",
    department: "Documentation"
  },
  {
    userId: 10,
    name: "Robert Taylor",
    email: "robert.taylor@company.com",
    role: "Admin",
    department: "System Administration"
  },
  {
    userId: 11,
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    role: "Manager",
    department: "Engineering"
  },
  {
    userId: 12,
    name: "James Martinez",
    email: "james.martinez@company.com",
    role: "Staff",
    department: "Backend Development"
  },
  {
    userId: 13,
    name: "Maria Garcia",
    email: "maria.garcia@company.com",
    role: "Staff",
    department: "Database Administration"
  },
  {
    userId: 14,
    name: "Kevin Lee",
    email: "kevin.lee@company.com",
    role: "Manager",
    department: "Operations"
  },
  {
    userId: 15,
    name: "Amanda White",
    email: "amanda.white@company.com",
    role: "Admin",
    department: "Human Resources"
  }
];

export const taskMockData: Task[] = [
  // Original tasks (keeping existing ones)
  {
    taskId: 1,
    title: "Implement User Authentication System",
    description: "Design and develop a secure user authentication system with OAuth2 integration and password reset functionality. Include comprehensive unit tests and documentation.",
    startDate: "2025-09-15",
    completedDate: null,
    dueDate: "2025-10-01",
    priority: "High",
    assignedUsers: [
      { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering" },
      { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Staff", department: "Frontend Development" }
    ],
    tags: ["authentication", "security", "backend"],
    status: "In Progress",
    comments: [
      {
        commentId: 1,
        author: "John Smith",
        content: "Started working on OAuth2 integration. Found good library to use.",
        timestamp: "2025-09-16T10:30:00Z"
      },
      {
        commentId: 2,
        author: "Alice Johnson",
        content: "I can help with the unit tests once the core functionality is ready.",
        timestamp: "2025-09-17T14:15:00Z"
      }
    ],
    projectName: "E-Commerce Platform",
    ownerId: 1,
    sharedWith: [3]
  },
  {
    taskId: 2,
    title: "Database Schema Migration",
    description: "Update database schema to support new user roles and permissions. Create migration scripts and rollback procedures.",
    startDate: "2025-09-10",
    completedDate: "2025-09-18",
    dueDate: "2025-09-20",
    priority: "Medium",
    assignedUsers: [
      { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering" }
    ],
    tags: ["database", "migration", "sql"],
    status: "Completed",
    comments: [
      {
        commentId: 3,
        author: "John Smith",
        content: "Migration completed successfully. All tests passing.",
        timestamp: "2025-09-18T16:45:00Z"
      }
    ],
    projectName: "E-Commerce Platform",
    ownerId: 1,
    sharedWith: []
  },
  {
    taskId: 3,
    title: "API Rate Limiting Implementation",
    description: "Implement rate limiting for public APIs to prevent abuse. Include configuration options for different endpoint limits.",
    startDate: "2025-09-20",
    completedDate: null,
    dueDate: "2025-09-25",
    priority: "Medium",
    assignedUsers: [
      { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Manager", department: "DevOps" }
    ],
    tags: ["api", "security", "performance"],
    status: "Blocked",
    comments: [
      {
        commentId: 4,
        author: "Sarah Davis",
        content: "Blocked by infrastructure team - need Redis cluster setup first.",
        timestamp: "2025-09-21T09:20:00Z"
      },
      {
        commentId: 5,
        author: "John Smith",
        content: "I can help coordinate with infrastructure team if needed.",
        timestamp: "2025-09-21T11:30:00Z"
      }
    ],
    projectName: "API Gateway Project",
    ownerId: 2,
    sharedWith: [1, 3]
  },
  {
    taskId: 4,
    title: "Code Review Guidelines Documentation",
    description: "Create comprehensive documentation for code review processes and best practices for the development team.",
    startDate: "2025-09-12",
    completedDate: null,
    dueDate: "2025-09-28",
    priority: "Low",
    assignedUsers: [
      { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering" },
      { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "Project Management" }
    ],
    tags: ["documentation", "process", "guidelines"],
    status: "To Do",
    comments: [],
    projectName: "Development Process Improvement",
    ownerId: 4,
    sharedWith: [1, 2, 3]
  },
  {
    taskId: 5,
    title: "Performance Optimization Research",
    description: "Research and document potential performance optimizations for the main application. Focus on database queries and caching strategies.",
    startDate: "2025-09-05",
    completedDate: "2025-09-14",
    dueDate: "2025-09-15",
    priority: "High",
    assignedUsers: [
      { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering" }
    ],
    tags: ["performance", "optimization", "research"],
    status: "Completed",
    comments: [
      {
        commentId: 6,
        author: "John Smith",
        content: "Research completed. Identified 3 major optimization opportunities.",
        timestamp: "2025-09-14T17:00:00Z"
      }
    ],
    projectName: "Performance Enhancement",
    ownerId: 1,
    sharedWith: []
  },
  // Additional tasks with proper formatting
  {
    taskId: 21,
    title: "Frontend Login Component Development",
    description: "Create responsive login form components with validation and error handling. Integrate with authentication API endpoints.",
    startDate: "2025-09-15",
    completedDate: null,
    dueDate: "2025-09-28",
    priority: "Medium",
    assignedUsers: [
      { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Staff", department: "Frontend Development" }
    ],
    tags: ["frontend", "components", "login", "ui"],
    status: "In Progress",
    comments: [
      {
        commentId: 17,
        author: "Alice Johnson",
        content: "Form validation logic completed. Working on styling now.",
        timestamp: "2025-09-17T09:45:00Z"
      }
    ],
    projectName: "E-Commerce Platform",
    ownerId: 3,
    sharedWith: [1]
  },
  {
    taskId: 22,
    title: "Security Testing Framework Setup",
    description: "Set up automated security testing tools and penetration testing scripts for the authentication system.",
    startDate: "2025-09-15",
    completedDate: null,
    dueDate: "2025-10-05",
    priority: "High",
    assignedUsers: [
      { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Manager", department: "DevOps" }
    ],
    tags: ["security", "testing", "penetration", "automation"],
    status: "To Do",
    comments: [],
    projectName: "Security Enhancement",
    ownerId: 2,
    sharedWith: [1, 3]
  }
];

export const mockData: MockData = {
  currentUser: {
    userId: 10,
    name: "Robert Taylor",
    systemRole: "Admin"
  },
  users: userMockData,
  tasks: taskMockData
};