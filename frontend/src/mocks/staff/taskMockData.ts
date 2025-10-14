import { Task, User } from '@/types';

export interface MockData {
  currentUser: User;
  tasks: Task[];
}

export const taskMockData: MockData = {
  currentUser: {
    userId: 1,
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Staff",
    department: "Sales Manager",
  },
  tasks: [
    // Original parent tasks (existing ones unchanged)
    {
      taskId: 1,
      title: "Implement User Authentication System",
      description: "Design and develop a secure user authentication system with OAuth2 integration and password reset functionality. Include comprehensive unit tests and documentation.",
      startDate: "2025-09-15",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: 7,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Developers" }, // Engineering→Developers
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Developers" }
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
      department: ["IT Team"],
    },
    {
      taskId: 101,
      title: "OAuth2 Provider Integration",
      description: "Integrate OAuth2 providers (Google, Facebook, GitHub) with proper error handling and token refresh mechanisms.",
      startDate: "2025-09-16",
      completedDate: null,
      dueDate: "2025-09-25",
      priority: 7,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Developers" }, // Engineering→Developers
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
      parentTaskId: 1,
      department: ["Sales Manager"],
    },
    {
      taskId: 102,
      title: "Password Reset Functionality",
      description: "Implement secure password reset with email verification, token expiration, and rate limiting.",
      startDate: "2025-09-17",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 4,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" }
      ],
      tags: ["password-reset", "email", "security", "tokens"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      parentTaskId: 1,
      department: ["IT Team"],
    },
    {
      taskId: 103,
      title: "Authentication Unit Tests",
      description: "Create comprehensive unit tests for all authentication components including edge cases and error scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 7,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },

      ],
      tags: ["unit-tests", "testing", "authentication", "coverage"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      parentTaskId: 1,
      department: ["IT Team"],
    },
    {
      taskId: 104,
      title: "Authentication API Documentation",
      description: "Write detailed API documentation for authentication endpoints including examples and error codes.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: 4,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Developers" }
      ],
      tags: ["documentation", "api", "authentication", "examples"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      parentTaskId: 1,
      department: ["IT Team"],
    },
    {
      taskId: 3,
      title: "API Rate Limiting Implementation",
      description: "Implement rate limiting for public APIs to prevent abuse. Include configuration options for different endpoint limits.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-25",
      priority: 4,
      assignedUsers: [
        { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Support Team" } // Security→Support Team
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
      department: ["Support Team"],
    },
    {
      taskId: 301,
      title: "Redis Configuration Setup",
      description: "Configure Redis cluster for rate limiting storage with proper persistence and failover mechanisms.",
      startDate: "2025-09-21",
      completedDate: null,
      dueDate: "2025-09-23",
      priority: 7,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering Operation Division" },

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
      parentTaskId: 3,
      department: ["Support Team"],
    },
    {
      taskId: 302,
      title: "Rate Limiting Algorithms Implementation",
      description: "Implement token bucket and sliding window rate limiting algorithms with configurable parameters.",
      startDate: "2025-09-22",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: 7,
      assignedUsers: [
        { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Senior Engineers" },

      ],
      tags: ["algorithms", "token-bucket", "sliding-window", "rate-limiting"],
      status: "To Do",
      comments: [],
      projectName: "API Gateway Project",
      parentTaskId: 3,
      department: ["Support Team"],
    },
    {
      taskId: 303,
      title: "Rate Limiting Configuration Dashboard",
      description: "Create admin dashboard for configuring rate limits per endpoint with real-time monitoring.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-26",
      priority: 4,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },

      ],
      tags: ["dashboard", "admin", "configuration", "monitoring"],
      status: "To Do",
      comments: [],
      projectName: "API Gateway Project",
      parentTaskId: 3,
      department: ["Support Team"],
    },
    {
      taskId: 21,
      title: "Frontend Login Component Development",
      description: "Create responsive login form components with validation and error handling. Integrate with authentication API endpoints.",
      startDate: "2025-09-15",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 4,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },

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
      department: ["IT Team"],
    },
    {
      taskId: 201,
      title: "Login Form UI Design",
      description: "Design responsive login form layout with proper accessibility and mobile-first approach.",
      startDate: "2025-09-15",
      completedDate: "2025-09-18",
      dueDate: "2025-09-17",
      priority: 4,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },

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
      parentTaskId: 21,
      department: ["IT Team"],
    },
    {
      taskId: 202,
      title: "Form Validation Logic",
      description: "Implement client-side validation with real-time feedback and proper error messaging.",
      startDate: "2025-09-16",
      completedDate: "2025-09-19",
      dueDate: "2025-09-20",
      priority: 7,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },

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
      parentTaskId: 21,
      department: ["IT Team"],
    },
    {
      taskId: 203,
      title: "API Integration for Login",
      description: "Integrate login form with authentication API endpoints and handle various response scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-26",
      priority: 7,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },

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
      parentTaskId: 21,
      department: ["IT Team"],
    },
    {
      taskId: 204,
      title: "Login Component Testing",
      description: "Create unit and integration tests for login component covering all user interactions.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 4,
      assignedUsers: [
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },
      ],
      tags: ["testing", "unit-tests", "integration", "components"],
      status: "To Do",
      comments: [],
      projectName: "E-Commerce Platform",
      parentTaskId: 21,
      department: ["IT Team"],
    },
    {
      taskId: 24,
      title: "Load Testing Infrastructure",
      description: "Set up load testing infrastructure to validate API rate limiting under high concurrent load scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 4,
      assignedUsers: [
        { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "Support Team" }, // QA→Consultant or Support Team
        { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "Support Team" }
      ],
      tags: ["load-testing", "infrastructure", "performance", "validation"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      department: ["Consultant"],
    },
    {
      taskId: 401,
      title: "Load Testing Tool Selection",
      description: "Research and select appropriate load testing tools (K6, JMeter, Artillery) based on requirements.",
      startDate: "2025-09-20",
      completedDate: "2025-09-21",
      dueDate: "2025-09-21",
      priority: 7,
      assignedUsers: [
        { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "Support Team" }, // QA→Consultant or Support Team

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
      parentTaskId: 24,
      department: ["Consultant"],
    },
    {
      taskId: 402,
      title: "Test Environment Setup",
      description: "Configure isolated test environment that mirrors production for accurate load testing.",
      startDate: "2025-09-21",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: 7,
      assignedUsers: [
        { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "Operation Planning Team" },

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
      parentTaskId: 24,
      department: ["Consultant"],
    },
    {
      taskId: 403,
      title: "Load Test Scripts Development",
      description: "Develop comprehensive load test scripts covering various user scenarios and API endpoints.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 7,
      assignedUsers: [
        { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "Operation Planning Team" },

      ],
      tags: ["scripts", "scenarios", "endpoints", "user-simulation"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      parentTaskId: 24,
      department: ["Consultant"],
    },
    {
      taskId: 404,
      title: "Performance Metrics Dashboard",
      description: "Create real-time dashboard for monitoring load test results and system performance metrics.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 4,
      assignedUsers: [
        { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "Operation Planning Team" },
      ],
      tags: ["dashboard", "metrics", "real-time", "monitoring"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      parentTaskId: 24,
      department: ["Consultant"],
    },
    {
      taskId: 39,
      title: "Integration Testing Automation",
      description: "Develop automated integration tests for authentication system with external OAuth providers and payment systems.",
      startDate: "2025-09-22",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: 7,
      assignedUsers: [
        { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "Operation Planning Team" },
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering Operation Division" },
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
      department: ["Consultant"],
    },
    // SUBTASKS FOR TASK 39: Integration Testing Automation
    {
      taskId: 501,
      title: "OAuth Provider Test Setup",
      description: "Setup test accounts and mock services for OAuth providers (Google, Facebook, GitHub).",
      startDate: "2025-09-22",
      completedDate: "2025-09-24",
      dueDate: "2025-09-24",
      priority: 7,
      assignedUsers: [
        { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "Operation Planning Team" }
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
      parentTaskId: 39,
      department: ["Consultant"],
    },
    {
      taskId: 502,
      title: "Payment System Integration Tests",
      description: "Create integration tests for payment gateway connections with proper error handling scenarios.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 7,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering Operation Division" },

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
      parentTaskId: 39,
      department: ["Consultant"],
    },
    {
      taskId: 503,
      title: "Test Data Management System",
      description: "Implement system for managing test data lifecycle including creation, cleanup, and isolation.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: 4,
      assignedUsers: [
        { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "Operation Planning Team" }
      ],
      tags: ["test-data", "lifecycle", "cleanup", "isolation"],
      status: "To Do",
      comments: [],
      projectName: "Quality Assurance",
      parentTaskId: 39,
      department: ["Consultant"],
    },
    // Other original tasks without subtasks with default org fields added
    {
      taskId: 2,
      title: "Database Schema Migration",
      description: "Update database schema to support new user roles and permissions. Create migration scripts and rollback procedures.",
      startDate: "2025-09-10",
      completedDate: "2025-09-18",
      dueDate: "2025-09-20",
      priority: 4,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering Operation Division" },

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
      department: ["IT Team"],
    },
    {
      taskId: 4,
      title: "Code Review Guidelines Documentation",
      description: "Create comprehensive documentation for code review processes and best practices for the development team.",
      startDate: "2025-09-12",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 1,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering" },
        { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "QA" }
      ],
      tags: ["documentation", "process", "guidelines"],
      status: "To Do",
      comments: [],
      projectName: "Development Process Improvement",
      department: ["Consultant"],
    },
    {
      taskId: 5,
      title: "Performance Optimization Research",
      description: "Research and document potential performance optimizations for the main application. Focus on database queries and caching strategies.",
      startDate: "2025-09-05",
      completedDate: "2025-09-14",
      dueDate: "2025-09-15",
      priority: 7,
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
      department: ["Consultant"],
    },
    // New tasks with expanded team across more departments
    {
      taskId: 40,
      title: "Mobile App UX Research",
      description: "Conduct comprehensive UX research for mobile application redesign including user interviews and usability testing.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-08",
      priority: 7,
      assignedUsers: [
        { userId: 7, name: "Rachel Green", email: "rachel.green@company.com", role: "Manager", department: "UX/UI Design" },
        { userId: 8, name: "James Rodriguez", email: "james.rodriguez@company.com", role: "Staff", department: "UX/UI Design" }
      ],
      tags: ["mobile", "ux", "research", "usability"],
      status: "In Progress",
      comments: [
        {
          commentId: 26,
          author: "Rachel Green",
          content: "Completed 12 user interviews. Identifying key pain points in navigation.",
          timestamp: "2025-09-27T14:20:00Z"
        }
      ],
      projectName: "Mobile App Redesign",
      department: ["Consultant"],
    },
    {
      taskId: 41,
      title: "Cloud Migration Strategy",
      description: "Develop comprehensive cloud migration strategy for legacy systems including cost analysis and risk assessment.",
      startDate: "2025-09-28",
      completedDate: null,
      dueDate: "2025-10-15",
      priority: 10,
      assignedUsers: [
        { userId: 9, name: "Kevin Park", email: "kevin.park@company.com", role: "Manager", department: "Infrastructure" },
        { userId: 10, name: "Lisa Wang", email: "lisa.wang@company.com", role: "Staff", department: "Infrastructure" },
        { userId: 11, name: "Robert Johnson", email: "robert.johnson@company.com", role: "Admin", department: "Infrastructure" }
      ],
      tags: ["cloud", "migration", "strategy", "infrastructure"],
      status: "To Do",
      comments: [],
      projectName: "Digital Transformation",
      department: ["Consultant"],
    },
    {
      taskId: 42,
      title: "Marketing Campaign Analytics Dashboard",
      description: "Build real-time analytics dashboard for marketing campaigns with conversion tracking and ROI metrics.",
      startDate: "2025-09-30",
      completedDate: null,
      dueDate: "2025-10-20",
      priority: 7,
      assignedUsers: [
        { userId: 12, name: "Amanda Foster", email: "amanda.foster@company.com", role: "Manager", department: "Marketing" },
        { userId: 13, name: "Ryan Mitchell", email: "ryan.mitchell@company.com", role: "Staff", department: "Data Analytics" }
      ],
      tags: ["analytics", "dashboard", "marketing", "metrics"],
      status: "To Do",
      comments: [],
      projectName: "Marketing Intelligence",
      department: ["Consultant"],
    },
    {
      taskId: 43,
      title: "Customer Support Chatbot Enhancement",
      description: "Enhance AI chatbot with natural language processing improvements and knowledge base integration.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-10-10",
      priority: 7,
      assignedUsers: [
        { userId: 14, name: "Jessica Chen", email: "jessica.chen@company.com", role: "Staff", department: "Data Analytics" },
        { userId: 15, name: "Christopher Lee", email: "christopher.lee@company.com", role: "Manager", department: "Customer Support" }
      ],
      tags: ["ai", "chatbot", "nlp", "customer-support"],
      status: "In Progress",
      comments: [
        {
          commentId: 27,
          author: "Jessica Chen",
          content: "NLP model training completed. Working on knowledge base integration.",
          timestamp: "2025-09-28T16:45:00Z"
        }
      ],
      projectName: "Customer Experience Enhancement",
      department: ["Consultant"],
    },
    {
      taskId: 44,
      title: "Financial Reporting Automation",
      description: "Automate monthly financial reporting process with data validation and executive summary generation.",
      startDate: "2025-09-29",
      completedDate: null,
      dueDate: "2025-10-25",
      priority: 10,
      assignedUsers: [
        { userId: 16, name: "Michael Torres", email: "michael.torres@company.com", role: "Manager", department: "Finance" },
        { userId: 17, name: "Stephanie Kim", email: "stephanie.kim@company.com", role: "Staff", department: "Finance" }
      ],
      tags: ["finance", "automation", "reporting", "validation"],
      status: "To Do",
      comments: [],
      projectName: "Financial Process Optimization",
      department: ["Consultant"],
    },
    {
      taskId: 45,
      title: "Employee Onboarding Portal",
      description: "Develop comprehensive employee onboarding portal with document management and training modules.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-10-18",
      priority: 7,
      assignedUsers: [
        { userId: 18, name: "Nicole Brown", email: "nicole.brown@company.com", role: "Manager", department: "Human Resources" },
        { userId: 19, name: "Daniel Wilson", email: "daniel.wilson@company.com", role: "Staff", department: "Human Resources" },
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering" }
      ],
      tags: ["hr", "onboarding", "portal", "training"],
      status: "In Progress",
      comments: [
        {
          commentId: 28,
          author: "Nicole Brown",
          content: "Document management system 70% complete. Starting training module integration.",
          timestamp: "2025-09-27T10:30:00Z"
        }
      ],
      projectName: "HR Digitization",
      department: ["Consultant"],
    },
    {
      taskId: 46,
      title: "Legal Compliance Audit System",
      description: "Build automated system for tracking and auditing legal compliance requirements across all departments.",
      startDate: "2025-09-27",
      completedDate: null,
      dueDate: "2025-11-05",
      priority: 8,
      assignedUsers: [
        { userId: 20, name: "Andrew Martinez", email: "andrew.martinez@company.com", role: "Manager", department: "Legal" },
        { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Security" }
      ],
      tags: ["legal", "compliance", "audit", "automation"],
      status: "To Do",
      comments: [],
      projectName: "Compliance Management",
      department: ["Consultant"],
    },
    {
      taskId: 47,
      title: "Sales Performance Dashboard",
      description: "Create interactive sales performance dashboard with territory analysis and forecasting capabilities.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-12",
      priority: 9,
      assignedUsers: [
        { userId: 21, name: "Patricia Garcia", email: "patricia.garcia@company.com", role: "Manager", department: "Sales" },
        { userId: 13, name: "Ryan Mitchell", email: "ryan.mitchell@company.com", role: "Staff", department: "Data Analytics" }
      ],
      tags: ["sales", "dashboard", "analytics", "forecasting"],
      status: "In Progress",
      comments: [
        {
          commentId: 29,
          author: "Patricia Garcia",
          content: "Territory analysis module completed. Working on forecasting algorithms.",
          timestamp: "2025-09-28T11:15:00Z"
        }
      ],
      projectName: "Sales Intelligence Platform",
      department: ["Consultant"],
    },
    {
      taskId: 48,
      title: "Product Roadmap Visualization Tool",
      description: "Develop interactive product roadmap visualization tool for stakeholder communication and planning.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-10-15",
      priority: 5,
      assignedUsers: [
        { userId: 22, name: "Thomas Anderson", email: "thomas.anderson@company.com", role: "Manager", department: "Product Management" },
        { userId: 7, name: "Rachel Green", email: "rachel.green@company.com", role: "Manager", department: "UX/UI Design" }
      ],
      tags: ["product", "roadmap", "visualization", "planning"],
      status: "To Do",
      comments: [],
      projectName: "Product Strategy Tools",
      department: ["Consultant"],
    },
    // Add some security-focused tasks that Sarah might own as Security Admin
    {
      taskId: 49,
      title: "Security Vulnerability Assessment",
      description: "Conduct comprehensive security vulnerability assessment across all systems and applications with remediation plan.",
      startDate: "2025-09-29",
      completedDate: null,
      dueDate: "2025-10-20",
      priority: 10,
      assignedUsers: [
        { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Security" },
        { userId: 11, name: "Robert Johnson", email: "robert.johnson@company.com", role: "Admin", department: "Infrastructure" }
      ],
      tags: ["security", "vulnerability", "assessment", "remediation"],
      status: "In Progress",
      comments: [
        {
          commentId: 30,
          author: "Sarah Davis",
          content: "Initial scan completed. Found 23 medium-priority vulnerabilities to address.",
          timestamp: "2025-09-29T09:30:00Z"
        }
      ],
      projectName: "Security Enhancement",
      department: ["Consultant"],
    },
    {
      taskId: 50,
      title: "Identity Access Management Upgrade",
      description: "Upgrade identity and access management system with multi-factor authentication and single sign-on capabilities.",
      startDate: "2025-09-30",
      completedDate: null,
      dueDate: "2025-11-15",
      priority: 5,
      assignedUsers: [
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering Operation Division" },
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },
      ],
      tags: ["identity", "access", "authentication", "sso"],
      status: "To Do",
      comments: [],
      projectName: "Identity Management",
      department: ["Consultant"],
    }
  ]
};

// Expanded user base with multiple departments
export const allUsers: User[] = [
  { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering Operation Division" },
  { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Senior Engineers" },
  { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering Operation Division" },
  { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "Operation Planning Team" },
  { userId: 5, name: "Emma Thompson", email: "emma.thompson@company.com", role: "Staff", department: "Engineering Operation Division" },
  { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "Operation Planning Team" },
  { userId: 7, name: "Rachel Green", email: "rachel.green@company.com", role: "Manager", department: "IT Division" },
  { userId: 8, name: "James Rodriguez", email: "james.rodriguez@company.com", role: "Staff", department: "IT Division" },
  { userId: 9, name: "Kevin Park", email: "kevin.park@company.com", role: "Manager", department: "L&D Team" },
  { userId: 10, name: "Lisa Wang", email: "lisa.wang@company.com", role: "Staff", department: "L&D Team" },
];