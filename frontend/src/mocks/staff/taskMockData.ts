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
  email: string;
  role: 'Staff' | 'Manager' | 'Admin';
  department: string;
}

export interface MockData {
  currentUser: CurrentUser;
  tasks: Task[];
}

export const taskMockData: MockData = {
  currentUser: {
    userId: 2,
    name: "Sarah Davis",
    systemRole: "Admin",
    email: "sarah.davis@company.com",
    role: "Admin",
    department: "Security"
  },
  tasks: [
    // Keep all existing tasks with updated user assignments
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
        { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering" }
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
        { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Security" }
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
        { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "QA" }
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
    // New tasks with expanded team across more departments
    {
      taskId: 40,
      title: "Mobile App UX Research",
      description: "Conduct comprehensive UX research for mobile application redesign including user interviews and usability testing.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-08",
      priority: "High",
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
      ownerId: 7,
      sharedWith: [8, 13]
    },
    {
      taskId: 41,
      title: "Cloud Migration Strategy",
      description: "Develop comprehensive cloud migration strategy for legacy systems including cost analysis and risk assessment.",
      startDate: "2025-09-28",
      completedDate: null,
      dueDate: "2025-10-15",
      priority: "High",
      assignedUsers: [
        { userId: 9, name: "Kevin Park", email: "kevin.park@company.com", role: "Manager", department: "Infrastructure" },
        { userId: 10, name: "Lisa Wang", email: "lisa.wang@company.com", role: "Staff", department: "Infrastructure" },
        { userId: 11, name: "Robert Johnson", email: "robert.johnson@company.com", role: "Admin", department: "Infrastructure" }
      ],
      tags: ["cloud", "migration", "strategy", "infrastructure"],
      status: "To Do",
      comments: [],
      projectName: "Digital Transformation",
      ownerId: 9,
      sharedWith: [2, 11]
    },
    {
      taskId: 42,
      title: "Marketing Campaign Analytics Dashboard",
      description: "Build real-time analytics dashboard for marketing campaigns with conversion tracking and ROI metrics.",
      startDate: "2025-09-30",
      completedDate: null,
      dueDate: "2025-10-20",
      priority: "Medium",
      assignedUsers: [
        { userId: 12, name: "Amanda Foster", email: "amanda.foster@company.com", role: "Manager", department: "Marketing" },
        { userId: 13, name: "Ryan Mitchell", email: "ryan.mitchell@company.com", role: "Staff", department: "Data Analytics" }
      ],
      tags: ["analytics", "dashboard", "marketing", "metrics"],
      status: "To Do",
      comments: [],
      projectName: "Marketing Intelligence",
      ownerId: 12,
      sharedWith: [13, 14]
    },
    {
      taskId: 43,
      title: "Customer Support Chatbot Enhancement",
      description: "Enhance AI chatbot with natural language processing improvements and knowledge base integration.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-10-10",
      priority: "Medium",
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
      ownerId: 14,
      sharedWith: [15]
    },
    {
      taskId: 44,
      title: "Financial Reporting Automation",
      description: "Automate monthly financial reporting process with data validation and executive summary generation.",
      startDate: "2025-09-29",
      completedDate: null,
      dueDate: "2025-10-25",
      priority: "High",
      assignedUsers: [
        { userId: 16, name: "Michael Torres", email: "michael.torres@company.com", role: "Manager", department: "Finance" },
        { userId: 17, name: "Stephanie Kim", email: "stephanie.kim@company.com", role: "Staff", department: "Finance" }
      ],
      tags: ["finance", "automation", "reporting", "validation"],
      status: "To Do",
      comments: [],
      projectName: "Financial Process Optimization",
      ownerId: 16,
      sharedWith: [17]
    },
    {
      taskId: 45,
      title: "Employee Onboarding Portal",
      description: "Develop comprehensive employee onboarding portal with document management and training modules.",
      startDate: "2025-09-24",
      completedDate: null,
      dueDate: "2025-10-18",
      priority: "Medium",
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
      ownerId: 18,
      sharedWith: [19, 3]
    },
    {
      taskId: 46,
      title: "Legal Compliance Audit System",
      description: "Build automated system for tracking and auditing legal compliance requirements across all departments.",
      startDate: "2025-09-27",
      completedDate: null,
      dueDate: "2025-11-05",
      priority: "High",
      assignedUsers: [
        { userId: 20, name: "Andrew Martinez", email: "andrew.martinez@company.com", role: "Manager", department: "Legal" },
        { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Security" }
      ],
      tags: ["legal", "compliance", "audit", "automation"],
      status: "To Do",
      comments: [],
      projectName: "Compliance Management",
      ownerId: 20,
      sharedWith: [2, 16]
    },
    {
      taskId: 47,
      title: "Sales Performance Dashboard",
      description: "Create interactive sales performance dashboard with territory analysis and forecasting capabilities.",
      startDate: "2025-09-25",
      completedDate: null,
      dueDate: "2025-10-12",
      priority: "High",
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
      ownerId: 21,
      sharedWith: [13, 12]
    },
    {
      taskId: 48,
      title: "Product Roadmap Visualization Tool",
      description: "Develop interactive product roadmap visualization tool for stakeholder communication and planning.",
      startDate: "2025-09-26",
      completedDate: null,
      dueDate: "2025-10-15",
      priority: "Medium",
      assignedUsers: [
        { userId: 22, name: "Thomas Anderson", email: "thomas.anderson@company.com", role: "Manager", department: "Product Management" },
        { userId: 7, name: "Rachel Green", email: "rachel.green@company.com", role: "Manager", department: "UX/UI Design" }
      ],
      tags: ["product", "roadmap", "visualization", "planning"],
      status: "To Do",
      comments: [],
      projectName: "Product Strategy Tools",
      ownerId: 22,
      sharedWith: [7, 3]
    },
    // Add some security-focused tasks that Sarah might own as Security Admin
    {
      taskId: 49,
      title: "Security Vulnerability Assessment",
      description: "Conduct comprehensive security vulnerability assessment across all systems and applications with remediation plan.",
      startDate: "2025-09-29",
      completedDate: null,
      dueDate: "2025-10-20",
      priority: "High",
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
      ownerId: 2,
      sharedWith: [11, 1]
    },
    {
      taskId: 50,
      title: "Identity Access Management Upgrade",
      description: "Upgrade identity and access management system with multi-factor authentication and single sign-on capabilities.",
      startDate: "2025-09-30",
      completedDate: null,
      dueDate: "2025-11-15",
      priority: "High",
      assignedUsers: [
        { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Security" },
        { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering" }
      ],
      tags: ["identity", "access", "authentication", "sso"],
      status: "To Do",
      comments: [],
      projectName: "Identity Management",
      ownerId: 2,
      sharedWith: [1, 20]
    }
  ]
};

// Expanded user base with multiple departments
export const allUsers: User[] = [
  // Engineering Department
  { userId: 1, name: "John Smith", email: "john.smith@company.com", role: "Staff", department: "Engineering" },
  { userId: 3, name: "Alice Johnson", email: "alice.johnson@company.com", role: "Manager", department: "Engineering" },
  { userId: 5, name: "Emma Thompson", email: "emma.thompson@company.com", role: "Staff", department: "Engineering" },

  // Security Department
  { userId: 2, name: "Sarah Davis", email: "sarah.davis@company.com", role: "Admin", department: "Security" },

  // QA Department
  { userId: 4, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Manager", department: "QA" },
  { userId: 6, name: "David Chen", email: "david.chen@company.com", role: "Staff", department: "QA" },

  // UX/UI Design Department
  { userId: 7, name: "Rachel Green", email: "rachel.green@company.com", role: "Manager", department: "UX/UI Design" },
  { userId: 8, name: "James Rodriguez", email: "james.rodriguez@company.com", role: "Staff", department: "UX/UI Design" },

  // Infrastructure Department
  { userId: 9, name: "Kevin Park", email: "kevin.park@company.com", role: "Manager", department: "Infrastructure" },
  { userId: 10, name: "Lisa Wang", email: "lisa.wang@company.com", role: "Staff", department: "Infrastructure" },
  { userId: 11, name: "Robert Johnson", email: "robert.johnson@company.com", role: "Admin", department: "Infrastructure" },

  // Marketing Department
  { userId: 12, name: "Amanda Foster", email: "amanda.foster@company.com", role: "Manager", department: "Marketing" },

  // Data Analytics Department
  { userId: 13, name: "Ryan Mitchell", email: "ryan.mitchell@company.com", role: "Staff", department: "Data Analytics" },
  { userId: 14, name: "Jessica Chen", email: "jessica.chen@company.com", role: "Staff", department: "Data Analytics" },

  // Customer Support Department
  { userId: 15, name: "Christopher Lee", email: "christopher.lee@company.com", role: "Manager", department: "Customer Support" },

  // Finance Department
  { userId: 16, name: "Michael Torres", email: "michael.torres@company.com", role: "Manager", department: "Finance" },
  { userId: 17, name: "Stephanie Kim", email: "stephanie.kim@company.com", role: "Staff", department: "Finance" },

  // Human Resources Department
  { userId: 18, name: "Nicole Brown", email: "nicole.brown@company.com", role: "Manager", department: "Human Resources" },
  { userId: 19, name: "Daniel Wilson", email: "daniel.wilson@company.com", role: "Staff", department: "Human Resources" },

  // Legal Department
  { userId: 20, name: "Andrew Martinez", email: "andrew.martinez@company.com", role: "Manager", department: "Legal" },

  // Sales Department
  { userId: 21, name: "Patricia Garcia", email: "patricia.garcia@company.com", role: "Manager", department: "Sales" },

  // Product Management Department
  { userId: 22, name: "Thomas Anderson", email: "thomas.anderson@company.com", role: "Manager", department: "Product Management" }
];
