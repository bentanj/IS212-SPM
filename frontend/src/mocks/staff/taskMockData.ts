export interface User {
  userId: number;
  name: string;
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
}

export const taskMockData: MockData = {
  currentUser: {
    userId: 1,
    name: "John Smith",
    systemRole: "Staff"
  },
  tasks: [
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
        { userId: 1, name: "John Smith" },
        { userId: 3, name: "Alice Johnson" }
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
    
    // Multiple tasks starting on 2025-09-15 (same as task 1)
    {
      taskId: 21,
      title: "Frontend Login Component Development",
      description: "Create responsive login form components with validation and error handling. Integrate with authentication API endpoints.",
      startDate: "2025-09-15",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: "Medium",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
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
        { userId: 2, name: "Sarah Davis" }
      ],
      tags: ["security", "testing", "penetration", "automation"],
      status: "To Do",
      comments: [],
      projectName: "Security Enhancement",
      ownerId: 2,
      sharedWith: [1, 3]
    },

    // Multiple tasks starting on 2025-09-20 (same as task 3)
    {
      taskId: 23,
      title: "Redis Cache Implementation",
      description: "Implement Redis caching layer for API responses to improve performance and support rate limiting functionality.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-27",
      priority: "High",
      assignedUsers: [
        { userId: 1, name: "John Smith" }
      ],
      tags: ["cache", "redis", "performance", "infrastructure"],
      status: "In Progress",
      comments: [
        {
          commentId: 18,
          author: "John Smith",
          content: "Redis cluster configured. Working on cache invalidation strategies.",
          timestamp: "2025-09-22T14:30:00Z"
        }
      ],
      projectName: "API Gateway Project",
      ownerId: 1,
      sharedWith: [2]
    },
    {
      taskId: 24,
      title: "Load Testing Infrastructure",
      description: "Set up load testing infrastructure to validate API rate limiting under high concurrent load scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: "Medium",
      assignedUsers: [
        { userId: 4, name: "Mike Wilson" },
        { userId: 6, name: "David Chen" }
      ],
      tags: ["load-testing", "infrastructure", "performance", "validation"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [1, 2]
    },
    {
      taskId: 25,
      title: "API Documentation Generation",
      description: "Create automated API documentation generation pipeline for rate limiting endpoints and configuration options.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: "Low",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["documentation", "api", "automation", "pipeline"],
      status: "To Do",
      comments: [],
      projectName: "Documentation Initiative",
      ownerId: 3,
      sharedWith: [2]
    },

    // Multiple tasks starting on 2025-09-23 (today)
    {
      taskId: 26,
      title: "Morning Code Review Session",
      description: "Conduct code review for authentication system pull requests and provide feedback to team members.",
      startDate: "2025-09-23",
      completedDate: null,
      dueDate: "2025-09-23",
      priority: "High",
      assignedUsers: [
        { userId: 1, name: "John Smith" }
      ],
      tags: ["code-review", "daily", "feedback", "quality"],
      status: "In Progress",
      comments: [
        {
          commentId: 19,
          author: "John Smith",
          content: "Reviewed 3 PRs so far. Found minor security issue in authentication flow.",
          timestamp: "2025-09-23T09:15:00Z"
        }
      ],
      projectName: "Development Process Improvement",
      ownerId: 1,
      sharedWith: [3, 4]
    },
    {
      taskId: 27,
      title: "Sprint Planning Preparation",
      description: "Prepare user stories and technical requirements for next sprint planning meeting scheduled for this afternoon.",
      startDate: "2025-09-23",
      completedDate: null,
      dueDate: "2025-09-23",
      priority: "Medium",
      assignedUsers: [
        { userId: 4, name: "Mike Wilson" }
      ],
      tags: ["planning", "sprint", "user-stories", "requirements"],
      status: "In Progress",
      comments: [
        {
          commentId: 20,
          author: "Mike Wilson",
          content: "Refined 8 user stories. Need to estimate complexity points.",
          timestamp: "2025-09-23T11:00:00Z"
        }
      ],
      projectName: "Team Management",
      ownerId: 4,
      sharedWith: [1, 2, 3]
    },
    {
      taskId: 28,
      title: "Production Deployment Checklist",
      description: "Create and verify production deployment checklist for authentication system release scheduled next week.",
      startDate: "2025-09-23",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: "High",
      assignedUsers: [
        { userId: 2, name: "Sarah Davis" },
        { userId: 1, name: "John Smith" }
      ],
      tags: ["deployment", "production", "checklist", "release"],
      status: "To Do",
      comments: [],
      projectName: "DevOps Infrastructure",
      ownerId: 2,
      sharedWith: [1]
    },
    {
      taskId: 29,
      title: "Database Performance Monitoring",
      description: "Monitor database performance during peak hours and identify potential bottlenecks in authentication queries.",
      startDate: "2025-09-23",
      completedDate: null,
      dueDate: "2025-09-25",
      priority: "Medium",
      assignedUsers: [
        { userId: 5, name: "Emma Thompson" }
      ],
      tags: ["database", "monitoring", "performance", "optimization"],
      status: "In Progress",
      comments: [
        {
          commentId: 21,
          author: "Emma Thompson",
          content: "Set up monitoring dashboard. Identified slow query in user lookup.",
          timestamp: "2025-09-23T13:20:00Z"
        }
      ],
      projectName: "Performance Enhancement",
      ownerId: 5,
      sharedWith: [1, 2]
    },

    // Multiple tasks starting on 2025-09-10 (same as task 2)
    {
      taskId: 30,
      title: "User Role Management System",
      description: "Design and implement comprehensive user role management system with granular permissions and role inheritance.",
      startDate: "2025-09-10",
      completedDate: "2025-09-19",
      dueDate: "2025-09-22",
      priority: "High",
      assignedUsers: [
        { userId: 2, name: "Sarah Davis" }
      ],
      tags: ["roles", "permissions", "user-management", "backend"],
      status: "Completed",
      comments: [
        {
          commentId: 22,
          author: "Sarah Davis",
          content: "Role hierarchy implemented. All unit tests passing.",
          timestamp: "2025-09-19T16:00:00Z"
        }
      ],
      projectName: "E-Commerce Platform",
      ownerId: 2,
      sharedWith: [1]
    },
    {
      taskId: 31,
      title: "Database Backup Validation",
      description: "Validate existing database backups and test recovery procedures before schema migration deployment.",
      startDate: "2025-09-10",
      completedDate: "2025-09-15",
      dueDate: "2025-09-18",
      priority: "High",
      assignedUsers: [
        { userId: 4, name: "Mike Wilson" }
      ],
      tags: ["backup", "validation", "recovery", "database"],
      status: "Completed",
      comments: [
        {
          commentId: 23,
          author: "Mike Wilson",
          content: "Backup validation completed. Recovery time: 45 minutes.",
          timestamp: "2025-09-15T14:30:00Z"
        }
      ],
      projectName: "Infrastructure Resilience",
      ownerId: 4,
      sharedWith: [1, 2]
    },

    // Multiple tasks starting on 2025-09-25
    {
      taskId: 32,
      title: "API Rate Limiting Documentation Update",
      description: "Update comprehensive documentation for new API rate limiting features including configuration examples and troubleshooting guide.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: "Medium",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["documentation", "api", "rate-limiting", "examples"],
      status: "To Do",
      comments: [],
      projectName: "Documentation Initiative",
      ownerId: 3,
      sharedWith: [2]
    },
    {
      taskId: 33,
      title: "Performance Benchmarking Suite",
      description: "Develop automated performance benchmarking suite for API endpoints to establish baseline metrics.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-03",
      priority: "Medium",
      assignedUsers: [
        { userId: 6, name: "David Chen" },
        { userId: 1, name: "John Smith" }
      ],
      tags: ["performance", "benchmarking", "automation", "metrics"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [1, 2]
    },
    {
      taskId: 34,
      title: "Client SDK Updates",
      description: "Update client SDKs to support new rate limiting headers and retry mechanisms for better error handling.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-05",
      priority: "High",
      assignedUsers: [
        { userId: 2, name: "Sarah Davis" }
      ],
      tags: ["sdk", "client", "rate-limiting", "error-handling"],
      status: "To Do",
      comments: [],
      projectName: "API Gateway Project",
      ownerId: 2,
      sharedWith: [1, 3]
    },

    // Multiple tasks starting on 2025-09-24
    {
      taskId: 35,
      title: "Team Retrospective Facilitation",
      description: "Facilitate team retrospective meeting to discuss sprint outcomes and identify improvement opportunities.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: "Medium",
      assignedUsers: [
        { userId: 4, name: "Mike Wilson" }
      ],
      tags: ["retrospective", "facilitation", "team", "improvement"],
      status: "To Do",
      comments: [],
      projectName: "Team Management",
      ownerId: 4,
      sharedWith: [1, 2, 3, 5]
    },
    {
      taskId: 36,
      title: "Production Monitoring Setup",
      description: "Configure comprehensive production monitoring and alerting systems for new authentication features.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-26",
      priority: "High",
      assignedUsers: [
        { userId: 5, name: "Emma Thompson" },
        { userId: 2, name: "Sarah Davis" }
      ],
      tags: ["monitoring", "production", "alerting", "authentication"],
      status: "To Do",
      comments: [],
      projectName: "Operations Infrastructure",
      ownerId: 5,
      sharedWith: [1, 2]
    },
    {
      taskId: 37,
      title: "Cross-browser Testing Campaign",
      description: "Execute comprehensive cross-browser testing for authentication UI components across different browsers and versions.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-27",
      priority: "Medium",
      assignedUsers: [
        { userId: 6, name: "David Chen" }
      ],
      tags: ["testing", "cross-browser", "ui", "compatibility"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [3]
    },

    // Multiple tasks starting on 2025-09-22
    {
      taskId: 38,
      title: "Accessibility Testing Phase 2",
      description: "Continue comprehensive accessibility testing focusing on keyboard navigation and screen reader compatibility.",
      startDate: "2025-09-22",
      completedDate: null,
      dueDate: "2025-09-29",
      priority: "Medium",
      assignedUsers: [
        { userId: 5, name: "Emma Thompson" }
      ],
      tags: ["accessibility", "testing", "keyboard", "screen-reader"],
      status: "In Progress",
      comments: [
        {
          commentId: 24,
          author: "Emma Thompson",
          content: "Keyboard navigation tests completed. 2 issues found and documented.",
          timestamp: "2025-09-23T10:45:00Z"
        }
      ],
      projectName: "Accessibility Initiative",
      ownerId: 5,
      sharedWith: [3]
    },
    {
      taskId: 39,
      title: "Integration Testing Automation",
      description: "Develop automated integration tests for authentication system with external OAuth providers and payment systems.",
      startDate: "2025-09-22",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: "High",
      assignedUsers: [
        { userId: 6, name: "David Chen" },
        { userId: 1, name: "John Smith" }
      ],
      tags: ["integration", "testing", "oauth", "automation"],
      status: "In Progress",
      comments: [
        {
          commentId: 25,
          author: "David Chen",
          content: "OAuth integration tests 80% complete. Payment system tests in progress.",
          timestamp: "2025-09-23T15:30:00Z"
        }
      ],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [1, 2]
    },

    // Include all original tasks with their existing IDs
    {
      taskId: 2,
      title: "Database Schema Migration",
      description: "Update database schema to support new user roles and permissions. Create migration scripts and rollback procedures.",
      startDate: "2025-09-10",
      completedDate: "2025-09-18",
      dueDate: "2025-09-20",
      priority: "Medium",
      assignedUsers: [
        { userId: 1, name: "John Smith" }
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
        { userId: 2, name: "Sarah Davis" }
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
        { userId: 1, name: "John Smith" },
        { userId: 4, name: "Mike Wilson" }
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
        { userId: 1, name: "John Smith" }
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
    }
  ]
};

// Additional users for the new tasks
export const allUsers: User[] = [
  { userId: 1, name: "John Smith" },
  { userId: 2, name: "Sarah Davis" },
  { userId: 3, name: "Alice Johnson" },
  { userId: 4, name: "Mike Wilson" },
  { userId: 5, name: "Emma Thompson" },
  { userId: 6, name: "David Chen" }
];


