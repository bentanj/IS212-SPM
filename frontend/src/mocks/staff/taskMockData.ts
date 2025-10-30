//@ts-nocheck
import { Task, User, APITaskParams } from '@/types';

interface MigrateTask extends APITaskParams {
  assigned_users: number[]; // Array of user IDs
}

export interface MockData {
  currentUser: User;
  tasks: MigrateTask[];
}

export const taskMockData: MockData = {
  currentUser: {
    userId: 1,
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Staff",
    department: "Consultant",
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
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null,
      assigned_users: [1, 3],
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
      project_name: "E-Commerce Platform",
      departments: ["IT Team"],
    },
    {
      taskId: 101,
      title: "OAuth2 Provider Integration",
      description: "Integrate OAuth2 providers (Google, Facebook, GitHub) with proper error handling and token refresh mechanisms.",
      startDate: "2025-09-16",
      completedDate: null,
      dueDate: "2025-09-25",
      priority: 7,
      assigned_users: [1],
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
      project_name: "E-Commerce Platform",
      parentTaskId: 1,
      departments: ["Sales Manager"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null,
    },
    {
      taskId: 102,
      title: "Password Reset Functionality",
      description: "Implement secure password reset with email verification, token expiration, and rate limiting.",
      startDate: "2025-09-17",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 4,
      assigned_users: [3],
      tags: ["password-reset", "email", "security", "tokens"],
      status: "To Do",
      comments: [],
      project_name: "E-Commerce Platform",
      parentTaskId: 1,
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null,
    },
    {
      taskId: 103,
      title: "Authentication Unit Tests",
      description: "Create comprehensive unit tests for all authentication components including edge cases and error scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 7,
      assigned_users: [3],
      tags: ["unit-tests", "testing", "authentication", "coverage"],
      status: "To Do",
      comments: [],
      project_name: "E-Commerce Platform",
      parentTaskId: 1,
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null,
    },
    {
      taskId: 104,
      title: "Authentication API Documentation",
      description: "Write detailed API documentation for authentication endpoints including examples and error codes.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: 4,
      assigned_users: [1],
      tags: ["documentation", "api", "authentication", "examples"],
      status: "To Do",
      comments: [],
      project_name: "E-Commerce Platform",
      parentTaskId: 1,
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null,

    },
    {
      taskId: 3,
      title: "API Rate Limiting Implementation",
      description: "Implement rate limiting for public APIs to prevent abuse. Include configuration options for different endpoint limits.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-25",
      priority: 4,
      assigned_users: [2],
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
      project_name: "API Gateway Project",
      departments: ["Support Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 301,
      title: "Redis Configuration Setup",
      description: "Configure Redis cluster for rate limiting storage with proper persistence and failover mechanisms.",
      startDate: "2025-09-21",
      completedDate: null,
      dueDate: "2025-09-23",
      priority: 7,
      assigned_users: [1],
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
      project_name: "API Gateway Project",
      parentTaskId: 3,
      departments: ["Support Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 302,
      title: "Rate Limiting Algorithms Implementation",
      description: "Implement token bucket and sliding window rate limiting algorithms with configurable parameters.",
      startDate: "2025-09-22",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: 7,
      assigned_users: [2],
      tags: ["algorithms", "token-bucket", "sliding-window", "rate-limiting"],
      status: "To Do",
      comments: [],
      project_name: "API Gateway Project",
      parentTaskId: 3,
      departments: ["Support Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 303,
      title: "Rate Limiting Configuration Dashboard",
      description: "Create admin dashboard for configuring rate limits per endpoint with real-time monitoring.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-26",
      priority: 4,
      assigned_users: [3],
      tags: ["dashboard", "admin", "configuration", "monitoring"],
      status: "To Do",
      comments: [],
      project_name: "API Gateway Project",
      parentTaskId: 3,
      departments: ["Support Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 21,
      title: "Frontend Login Component Development",
      description: "Create responsive login form components with validation and error handling. Integrate with authentication API endpoints.",
      startDate: "2025-09-15",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 4,
      assigned_users: [3],
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
      project_name: "E-Commerce Platform",
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 201,
      title: "Login Form UI Design",
      description: "Design responsive login form layout with proper accessibility and mobile-first approach.",
      startDate: "2025-09-15",
      completedDate: "2025-09-18",
      dueDate: "2025-09-17",
      priority: 4,
      assigned_users: [3],
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
      project_name: "E-Commerce Platform",
      parentTaskId: 21,
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 202,
      title: "Form Validation Logic",
      description: "Implement client-side validation with real-time feedback and proper error messaging.",
      startDate: "2025-09-16",
      completedDate: "2025-09-19",
      dueDate: "2025-09-20",
      priority: 7,
      assigned_users: [3],
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
      project_name: "E-Commerce Platform",
      parentTaskId: 21,
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 203,
      title: "API Integration for Login",
      description: "Integrate login form with authentication API endpoints and handle various response scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-26",
      priority: 7,
      assigned_users: [3],
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
      project_name: "E-Commerce Platform",
      parentTaskId: 21,
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 204,
      title: "Login Component Testing",
      description: "Create unit and integration tests for login component covering all user interactions.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 4,
      assigned_users: [3],
      tags: ["testing", "unit-tests", "integration", "components"],
      status: "To Do",
      comments: [],
      project_name: "E-Commerce Platform",
      parentTaskId: 21,
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 24,
      title: "Load Testing Infrastructure",
      description: "Set up load testing infrastructure to validate API rate limiting under high concurrent load scenarios.",
      startDate: "2025-09-20",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 4,
      assigned_users: [4, 6],
      tags: ["load-testing", "infrastructure", "performance", "validation"],
      status: "To Do",
      comments: [],
      project_name: "Quality Assurance",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 401,
      title: "Load Testing Tool Selection",
      description: "Research and select appropriate load testing tools (K6, JMeter, Artillery) based on requirements.",
      startDate: "2025-09-20",
      completedDate: "2025-09-21",
      dueDate: "2025-09-21",
      priority: 7,
      assigned_users: [4],
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
      project_name: "Quality Assurance",
      parentTaskId: 24,
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 402,
      title: "Test Environment Setup",
      description: "Configure isolated test environment that mirrors production for accurate load testing.",
      startDate: "2025-09-21",
      completedDate: null,
      dueDate: "2025-09-24",
      priority: 7,
      assigned_users: [6],
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
      project_name: "Quality Assurance",
      parentTaskId: 24,
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 403,
      title: "Load Test Scripts Development",
      description: "Develop comprehensive load test scripts covering various user scenarios and API endpoints.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 7,
      assigned_users: [4],
      tags: ["scripts", "scenarios", "endpoints", "user-simulation"],
      status: "To Do",
      comments: [],
      project_name: "Quality Assurance",
      parentTaskId: 24,
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 404,
      title: "Performance Metrics Dashboard",
      description: "Create real-time dashboard for monitoring load test results and system performance metrics.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 4,
      assigned_users: [6],
      tags: ["dashboard", "metrics", "real-time", "monitoring"],
      status: "To Do",
      comments: [],
      project_name: "Quality Assurance",
      parentTaskId: 24,
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 39,
      title: "Integration Testing Automation",
      description: "Develop automated integration tests for authentication system with external OAuth providers and payment systems.",
      startDate: "2025-09-22",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: 7,
      assigned_users: [1, 6],
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
      project_name: "Quality Assurance",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
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
      assigned_users: [6],
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
      project_name: "Quality Assurance",
      parentTaskId: 39,
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 502,
      title: "Payment System Integration Tests",
      description: "Create integration tests for payment gateway connections with proper error handling scenarios.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-09-30",
      priority: 7,
      assigned_users: [1],
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
      project_name: "Quality Assurance",
      parentTaskId: 39,
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 503,
      title: "Test Data Management System",
      description: "Implement system for managing test data lifecycle including creation, cleanup, and isolation.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-01",
      priority: 4,
      assigned_users: [6],
      tags: ["test-data", "lifecycle", "cleanup", "isolation"],
      status: "To Do",
      comments: [],
      project_name: "Quality Assurance",
      parentTaskId: 39,
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
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
      assigned_users: [1],
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
      project_name: "E-Commerce Platform",
      departments: ["IT Team"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 4,
      title: "Code Review Guidelines Documentation",
      description: "Create comprehensive documentation for code review processes and best practices for the development team.",
      startDate: "2025-09-12",
      completedDate: null,
      dueDate: "2025-09-28",
      priority: 1,
      assigned_users: [1, 4],
      tags: ["documentation", "process", "guidelines"],
      status: "To Do",
      comments: [],
      project_name: "Development Process Improvement",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 5,
      title: "Performance Optimization Research",
      description: "Research and document potential performance optimizations for the main application. Focus on database queries and caching strategies.",
      startDate: "2025-09-05",
      completedDate: "2025-09-14",
      dueDate: "2025-09-15",
      priority: 7,
      assigned_users: [1],
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
      project_name: "Performance Enhancement",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    // New tasks with expanded team across more departmentss
    {
      taskId: 40,
      title: "Mobile App UX Research",
      description: "Conduct comprehensive UX research for mobile application redesign including user interviews and usability testing.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-08",
      priority: 7,
      assigned_users: [7, 8],
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
      project_name: "Mobile App Redesign",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 41,
      title: "Cloud Migration Strategy",
      description: "Develop comprehensive cloud migration strategy for legacy systems including cost analysis and risk assessment.",
      startDate: "2025-09-28",
      completedDate: null,
      dueDate: "2025-10-15",
      priority: 10,
      assigned_users: [9, 10, 8],
      tags: ["cloud", "migration", "strategy", "infrastructure"],
      status: "To Do",
      comments: [],
      project_name: "Digital Transformation",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 42,
      title: "Marketing Campaign Analytics Dashboard",
      description: "Build real-time analytics dashboard for marketing campaigns with conversion tracking and ROI metrics.",
      startDate: "2025-09-30",
      completedDate: null,
      dueDate: "2025-10-20",
      priority: 7,
      assigned_users: [2, 3],
      tags: ["analytics", "dashboard", "marketing", "metrics"],
      status: "To Do",
      comments: [],
      project_name: "Marketing Intelligence",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 43,
      title: "Customer Support Chatbot Enhancement",
      description: "Enhance AI chatbot with natural language processing improvements and knowledge base integration.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-10-10",
      priority: 7,
      assigned_users: [4, 5],
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
      project_name: "Customer Experience Enhancement",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 44,
      title: "Financial Reporting Automation",
      description: "Automate monthly financial reporting process with data validation and executive summary generation.",
      startDate: "2025-09-29",
      completedDate: null,
      dueDate: "2025-10-25",
      priority: 10,
      assigned_users: [6, 7],
      tags: ["finance", "automation", "reporting", "validation"],
      status: "To Do",
      comments: [],
      project_name: "Financial Process Optimization",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 45,
      title: "Employee Onboarding Portal",
      description: "Develop comprehensive employee onboarding portal with document management and training modules.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-10-18",
      priority: 7,
      assigned_users: [8, 9, 3],
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
      project_name: "HR Digitization",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 46,
      title: "Legal Compliance Audit System",
      description: "Build automated system for tracking and auditing legal compliance requirements across all departmentss.",
      startDate: "2025-09-27",
      completedDate: null,
      dueDate: "2025-11-05",
      priority: 8,
      assigned_users: [2],
      tags: ["legal", "compliance", "audit", "automation"],
      status: "To Do",
      comments: [],
      project_name: "Compliance Management",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 47,
      title: "Sales Performance Dashboard",
      description: "Create interactive sales performance dashboard with territory analysis and forecasting capabilities.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-12",
      priority: 9,
      assigned_users: [1, 3],
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
      project_name: "Sales Intelligence Platform",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 48,
      title: "Product Roadmap Visualization Tool",
      description: "Develop interactive product roadmap visualization tool for stakeholder communication and planning.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-10-15",
      priority: 5,
      assigned_users: [2, 7],
      tags: ["product", "roadmap", "visualization", "planning"],
      status: "To Do",
      comments: [],
      project_name: "Product Strategy Tools",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
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
      assigned_users: [2, 1],
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
      project_name: "Security Enhancement",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null
    },
    {
      taskId: 50,
      title: "Identity Access Management Upgrade",
      description: "Upgrade identity and access management system with multi-factor authentication and single sign-on capabilities.",
      startDate: "2025-09-30",
      completedDate: null,
      dueDate: "2025-11-15",
      priority: 5,
      assigned_users: [1, 3],
      tags: ["identity", "access", "authentication", "sso"],
      status: "To Do",
      comments: [],
      project_name: "Identity Management",
      departments: ["Consultant"],
      recurrenceFrequency: "One-Off",
      recurrenceInterval: null,
    }
  ]
};