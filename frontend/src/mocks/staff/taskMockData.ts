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
  parentTaskId?: number;
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
    // Original parent tasks (keeping existing ones)
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

    // SUBTASKS FOR TASK 1: User Authentication System
    {
      taskId: 101,
      title: "OAuth2 Provider Integration",
      description: "Integrate OAuth2 providers (Google, Facebook, GitHub) with proper error handling and token refresh mechanisms.",
      startDate: "2025-09-16",
      completedDate: null,
      dueDate: "2025-09-25",
      priority: "High",
      assignedUsers: [
        { userId: 1, name: "John Smith" }
      ],
      tags: ["oauth2", "integration", "google", "facebook"],
      status: "In Progress",
      comments: [
        {
          commentId: 101,
          author: "John Smith",
          content: "Google OAuth integration completed. Working on Facebook integration now.",
          timestamp: "2025-09-18T14:20:00Z"
        }
      ],
      projectName: "E-Commerce Platform",
      ownerId: 1,
      sharedWith: [3],
      parentTaskId: 1
    },
    {
      taskId: 102,
      title: "Password Reset Functionality",
      description: "Implement secure password reset with email verification, token expiration, and rate limiting.",
      startDate: "2025-09-17",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: "Medium",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["password-reset", "email", "security", "tokens"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      ownerId: 3,
      sharedWith: [1],
      parentTaskId: 1
    },
    {
      taskId: 103,
      title: "Authentication Unit Tests",
      description: "Create comprehensive unit tests for all authentication components including edge cases and error scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: "High",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["unit-tests", "testing", "authentication", "coverage"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      ownerId: 3,
      sharedWith: [1],
      parentTaskId: 1
    },
    {
      taskId: 104,
      title: "Authentication API Documentation",
      description: "Write detailed API documentation for authentication endpoints including examples and error codes.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: "Medium",
      assignedUsers: [
        { userId: 1, name: "John Smith" }
      ],
      tags: ["documentation", "api", "authentication", "examples"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      ownerId: 1,
      sharedWith: [3],
      parentTaskId: 1
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

    // SUBTASKS FOR TASK 3: API Rate Limiting
    {
      taskId: 301,
      title: "Redis Configuration Setup",
      description: "Configure Redis cluster for rate limiting storage with proper persistence and failover mechanisms.",
      startDate: "2025-09-21",
      completedDate: null,
      dueDate: "2025-09-23",
      priority: "High",
      assignedUsers: [
        { userId: 1, name: "John Smith" }
      ],
      tags: ["redis", "configuration", "clustering", "persistence"],
      status: "In Progress",
      comments: [
        {
          commentId: 301,
          author: "John Smith",
          content: "Redis cluster configured. Testing failover scenarios.",
          timestamp: "2025-09-22T11:15:00Z"
        }
      ],
      projectName: "API Gateway Project",
      ownerId: 1,
      sharedWith: [2],
      parentTaskId: 3
    },
    {
      taskId: 302,
      title: "Rate Limiting Algorithms Implementation",
      description: "Implement token bucket and sliding window rate limiting algorithms with configurable parameters.",
      startDate: "2025-09-22",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: "High",
      assignedUsers: [
        { userId: 2, name: "Sarah Davis" }
      ],
      tags: ["algorithms", "token-bucket", "sliding-window", "rate-limiting"],
      status: "To Do",
      comments: [],
      projectName: "API Gateway Project",
      ownerId: 2,
      sharedWith: [1],
      parentTaskId: 3
    },
    {
      taskId: 303,
      title: "Rate Limiting Configuration Dashboard",
      description: "Create admin dashboard for configuring rate limits per endpoint with real-time monitoring.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-26",
      priority: "Medium",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["dashboard", "admin", "configuration", "monitoring"],
      status: "To Do",
      comments: [],
      projectName: "API Gateway Project",
      ownerId: 3,
      sharedWith: [2],
      parentTaskId: 3
    },

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

    // SUBTASKS FOR TASK 21: Frontend Login Component
    {
      taskId: 201,
      title: "Login Form UI Design",
      description: "Design responsive login form layout with proper accessibility and mobile-first approach.",
      startDate: "2025-09-15",
      completedDate: "2025-09-18",
      dueDate: "2025-09-17",
      priority: "Medium",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["ui-design", "responsive", "accessibility", "mobile"],
      status: "Completed",
      comments: [
        {
          commentId: 201,
          author: "Alice Johnson",
          content: "Login form design completed and approved by design team.",
          timestamp: "2025-09-18T16:30:00Z"
        }
      ],
      projectName: "E-Commerce Platform",
      ownerId: 3,
      sharedWith: [1],
      parentTaskId: 21
    },
    {
      taskId: 202,
      title: "Form Validation Logic",
      description: "Implement client-side validation with real-time feedback and proper error messaging.",
      startDate: "2025-09-16",
      completedDate: "2025-09-19",
      dueDate: "2025-09-20",
      priority: "High",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["validation", "client-side", "real-time", "error-handling"],
      status: "Completed",
      comments: [
        {
          commentId: 202,
          author: "Alice Johnson",
          content: "Validation logic implemented with proper error states.",
          timestamp: "2025-09-19T14:45:00Z"
        }
      ],
      projectName: "E-Commerce Platform",
      ownerId: 3,
      sharedWith: [1],
      parentTaskId: 21
    },
    {
      taskId: 203,
      title: "API Integration for Login",
      description: "Integrate login form with authentication API endpoints and handle various response scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-26",
      priority: "High",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["api-integration", "authentication", "endpoints", "error-handling"],
      status: "In Progress",
      comments: [
        {
          commentId: 203,
          author: "Alice Johnson",
          content: "Basic API integration complete. Working on error scenarios.",
          timestamp: "2025-09-22T10:20:00Z"
        }
      ],
      projectName: "E-Commerce Platform",
      ownerId: 3,
      sharedWith: [1],
      parentTaskId: 21
    },
    {
      taskId: 204,
      title: "Login Component Testing",
      description: "Create unit and integration tests for login component covering all user interactions.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: "Medium",
      assignedUsers: [
        { userId: 3, name: "Alice Johnson" }
      ],
      tags: ["testing", "unit-tests", "integration", "components"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      ownerId: 3,
      sharedWith: [1],
      parentTaskId: 21
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

    // SUBTASKS FOR TASK 24: Load Testing Infrastructure
    {
      taskId: 401,
      title: "Load Testing Tool Selection",
      description: "Research and select appropriate load testing tools (K6, JMeter, Artillery) based on requirements.",
      startDate: "2025-09-20",
      completedDate: "2025-09-21",
      dueDate: "2025-09-21",
      priority: "High",
      assignedUsers: [
        { userId: 4, name: "Mike Wilson" }
      ],
      tags: ["research", "tools", "k6", "jmeter", "selection"],
      status: "Completed",
      comments: [
        {
          commentId: 401,
          author: "Mike Wilson",
          content: "Selected K6 for its scripting capabilities and cloud integration.",
          timestamp: "2025-09-21T15:30:00Z"
        }
      ],
      projectName: "Quality Assurance",
      ownerId: 4,
      sharedWith: [6],
      parentTaskId: 24
    },
    {
      taskId: 402,
      title: "Test Environment Setup",
      description: "Configure isolated test environment that mirrors production for accurate load testing.",
      startDate: "2025-09-21",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: "High",
      assignedUsers: [
        { userId: 6, name: "David Chen" }
      ],
      tags: ["environment", "configuration", "infrastructure", "isolation"],
      status: "In Progress",
      comments: [
        {
          commentId: 402,
          author: "David Chen",
          content: "Test environment 70% configured. Setting up monitoring now.",
          timestamp: "2025-09-23T13:15:00Z"
        }
      ],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [4],
      parentTaskId: 24
    },
    {
      taskId: 403,
      title: "Load Test Scripts Development",
      description: "Develop comprehensive load test scripts covering various user scenarios and API endpoints.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: "High",
      assignedUsers: [
        { userId: 4, name: "Mike Wilson" }
      ],
      tags: ["scripts", "scenarios", "endpoints", "user-simulation"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      ownerId: 4,
      sharedWith: [6],
      parentTaskId: 24
    },
    {
      taskId: 404,
      title: "Performance Metrics Dashboard",
      description: "Create real-time dashboard for monitoring load test results and system performance metrics.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: "Medium",
      assignedUsers: [
        { userId: 6, name: "David Chen" }
      ],
      tags: ["dashboard", "metrics", "real-time", "monitoring"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [4],
      parentTaskId: 24
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

    // SUBTASKS FOR TASK 39: Integration Testing Automation
    {
      taskId: 501,
      title: "OAuth Provider Test Setup",
      description: "Setup test accounts and mock services for OAuth providers (Google, Facebook, GitHub).",
      startDate: "2025-09-22",
      completedDate: "2025-09-24",
      dueDate: "2025-09-24",
      priority: "High",
      assignedUsers: [
        { userId: 6, name: "David Chen" }
      ],
      tags: ["oauth", "test-setup", "mock-services", "providers"],
      status: "Completed",
      comments: [
        {
          commentId: 501,
          author: "David Chen",
          content: "Test OAuth apps created for all providers. Mock services ready.",
          timestamp: "2025-09-24T17:00:00Z"
        }
      ],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [1],
      parentTaskId: 39
    },
    {
      taskId: 502,
      title: "Payment System Integration Tests",
      description: "Create integration tests for payment gateway connections with proper error handling scenarios.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: "High",
      assignedUsers: [
        { userId: 1, name: "John Smith" }
      ],
      tags: ["payment", "gateway", "integration", "error-handling"],
      status: "In Progress",
      comments: [
        {
          commentId: 502,
          author: "John Smith",
          content: "Stripe integration tests completed. Working on PayPal tests.",
          timestamp: "2025-09-25T11:30:00Z"
        }
      ],
      projectName: "Quality Assurance",
      ownerId: 1,
      sharedWith: [6],
      parentTaskId: 39
    },
    {
      taskId: 503,
      title: "Test Data Management System",
      description: "Implement system for managing test data lifecycle including creation, cleanup, and isolation.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: "Medium",
      assignedUsers: [
        { userId: 6, name: "David Chen" }
      ],
      tags: ["test-data", "lifecycle", "cleanup", "isolation"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      ownerId: 6,
      sharedWith: [1],
      parentTaskId: 39
    },

    // Keep other original tasks without subtasks
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
    },

    // Additional tasks to maintain the full dataset
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