// @ts-nocheck

import {
  generateProjectPerformanceReport,
  generateUserProductivityReport,
  generateDepartmentActivityReport,
  getUniqueDepartments,
} from '../ReportGenerationFunction';

// ==================== MOCK DATA SETUP ====================

const mockTasksFromSystem = [
  {
    "taskId": 1,
    "title": "Implement User Authentication System",
    "project_name": "E-Commerce Platform",
    "status": "Blocked",
    "priority": 9,
    "dueDate": "2025-10-01T00:00:00+00:00",
    "assignedUsers": [
      { "userId": 1, "name": "Matthew Lim" },
      { "userId": 4, "name": "Mike Wilson" }
    ],
    "departments": ["IT Team", "Sales Manager", "Support Team"],
    "completed": false
  },
  {
    "taskId": 2,
    "title": "OAuth2 Provider Integration",
    "project_name": "E-Commerce Platform",
    "status": "Completed",
    "priority": 7,
    "dueDate": "2025-09-25T00:00:00+00:00",
    "assignedUsers": [
      { "userId": 1, "name": "Matthew Lim" },
      { "userId": 2, "name": "Ben Tan" }
    ],
    "departments": ["Sales Manager"],
    "completed": true
  },
  {
    "taskId": 6,
    "title": "API Rate Limiting Implementation",
    "project_name": "API Gateway Project",
    "status": "Blocked",
    "priority": 4,
    "dueDate": "2025-09-25T00:00:00+00:00",
    "assignedUsers": [
      { "userId": 2, "name": "Ben Tan" }
    ],
    "departments": ["Support Team"],
    "completed": false
  },
  {
    "taskId": 7,
    "title": "Redis Configuration Setup",
    "project_name": "API Gateway Project",
    "status": "In Progress",
    "priority": 7,
    "dueDate": "2025-09-23T00:00:00+00:00",
    "assignedUsers": [
      { "userId": 1, "name": "Matthew Lim" }
    ],
    "departments": ["Support Team"],
    "completed": false
  },
  {
    "taskId": 15,
    "title": "Load Testing Infrastructure",
    "project_name": "Quality Assurance",
    "status": "Completed",
    "priority": 1,
    "dueDate": "2025-09-30T00:00:00+00:00",
    "assignedUsers": [
      { "userId": 4, "name": "Mike Wilson" },
      { "userId": 6, "name": "David Chen" }
    ],
    "departments": ["Consultant"],
    "completed": true
  },
  {
    "taskId": 24,
    "title": "Database Schema Migration",
    "project_name": "E-Commerce Platform",
    "status": "Completed",
    "priority": 4,
    "dueDate": "2025-09-20T00:00:00+00:00",
    "assignedUsers": [
      { "userId": 1, "name": "Matthew Lim" }
    ],
    "departments": ["IT Team"],
    "completed": true
  },
  {
    "taskId": 26,
    "title": "Performance Optimization Research",
    "project_name": "Performance Enhancement",
    "status": "Completed",
    "priority": 7,
    "dueDate": "2025-09-15T00:00:00+00:00",
    "assignedUsers": [
      { "userId": 1, "name": "Matthew Lim" }
    ],
    "departments": ["Consultant"],
    "completed": true
  }
];

const emptyTasks: any[] = [];

const tasksWithoutProjectNames = [
  {
    "taskId": 100,
    "title": "Task Without Project",
    "project_name": null,
    "status": "To Do",
    "priority": 5,
    "dueDate": "2025-10-15T00:00:00+00:00",
    "assignedUsers": [{ "userId": 1, "name": "Matthew Lim" }],
    "departments": ["IT Team"]
  },
  {
    "taskId": 101,
    "title": "Another Task Without Project",
    "project_name": "",
    "status": "In Progress",
    "priority": 3,
    "dueDate": "2025-10-10T00:00:00+00:00",
    "assignedUsers": [{ "userId": 2, "name": "Ben Tan" }],
    "departments": ["Support Team"]
  }
];

const tasksWithMalformedUsers = [
  {
    "taskId": 102,
    "title": "Task with object user",
    "project_name": "Test Project",
    "status": "To Do",
    "dueDate": "2025-10-20T00:00:00+00:00",
    "assignedUsers": [{ "userId": 5, "name": "User Five" }],
    "departments": ["IT Team"]
  },
  {
    "taskId": 103,
    "title": "Task with primitive user ID",
    "project_name": "Test Project",
    "status": "To Do",
    "dueDate": "2025-10-20T00:00:00+00:00",
    "assignedUsers": [3, 4] as any[],
    "departments": ["IT Team"]
  },
  {
    "taskId": 104,
    "title": "Task with empty assigned users",
    "project_name": "Test Project",
    "status": "To Do",
    "dueDate": "2025-10-20T00:00:00+00:00",
    "assignedUsers": [],
    "departments": ["IT Team"]
  }
];

const tasksWithMixedStatuses = [
  {
    "taskId": 200,
    "title": "Task with Completed",
    "project_name": "Test Project",
    "status": "Completed",
    "dueDate": "2025-10-01T00:00:00+00:00",
    "assignedUsers": [{ "userId": 1, "name": "Matthew Lim" }],
    "departments": ["IT Team"]
  },
  {
    "taskId": 201,
    "title": "Task with another Completed",
    "project_name": "Test Project",
    "status": "Completed",
    "dueDate": "2025-10-01T00:00:00+00:00",
    "assignedUsers": [{ "userId": 1, "name": "Matthew Lim" }],
    "departments": ["IT Team"]
  },
  {
    "taskId": 202,
    "title": "Task with In Progress",
    "project_name": "Test Project",
    "status": "In Progress",
    "dueDate": "2025-10-01T00:00:00+00:00",
    "assignedUsers": [{ "userId": 1, "name": "Matthew Lim" }],
    "departments": ["IT Team"]
  },
  {
    "taskId": 203,
    "title": "Task with To Do",
    "project_name": "Test Project",
    "status": "To Do",
    "dueDate": "2025-10-01T00:00:00+00:00",
    "assignedUsers": [{ "userId": 1, "name": "Matthew Lim" }],
    "departments": ["IT Team"]
  },
  {
    "taskId": 204,
    "title": "Task with Blocked",
    "project_name": "Test Project",
    "status": "Blocked",
    "dueDate": "2025-10-01T00:00:00+00:00",
    "assignedUsers": [{ "userId": 1, "name": "Matthew Lim" }],
    "departments": ["IT Team"]
  }
];

const mockUsers = [
  { userId: 1, user_id: 1, name: "Matthew Lim", full_name: "Matthew Lim" },
  { userId: 2, user_id: 2, name: "Ben Tan", full_name: "Ben Tan" },
  { userId: 4, user_id: 4, name: "Mike Wilson", full_name: "Mike Wilson" },
  { userId: 6, user_id: 6, name: "David Chen", full_name: "David Chen" }
];

global.fetch = jest.fn();

// ==================== POSITIVE TEST CASES ====================

describe("ReportGenerationFunction - Positive Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateProjectPerformanceReport - Positive", () => {
    it("should generate project performance report with valid date range", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const startDate = "2025-09-15";
      const endDate = "2025-10-01";
      const report = await generateProjectPerformanceReport(startDate, endDate);

      expect(report).toBeDefined();
      expect(report.metadata.report_type).toBe("project_performance");
      expect(report.metadata.parameters.start_date).toBe(startDate);
      expect(report.metadata.parameters.end_date).toBe(endDate);
      expect(report.summary.total_projects).toBeGreaterThan(0);
      expect(report.data.projects).toBeDefined();
      expect(Array.isArray(report.data.projects)).toBe(true);
    });

    it("should calculate completion rates correctly", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      report.data.projects.forEach(project => {
        expect(project.completion_rate).toBeGreaterThanOrEqual(0);
        expect(project.completion_rate).toBeLessThanOrEqual(100);
        expect(typeof project.completion_rate).toBe("number");
      });
    });

    it("should sort projects by completion rate descending", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      for (let i = 0; i < report.data.projects.length - 1; i++) {
        expect(report.data.projects[i].completion_rate).toBeGreaterThanOrEqual(
          report.data.projects[i + 1].completion_rate
        );
      }
    });

    it("should include all task statuses in calculation", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => tasksWithMixedStatuses
      });

      const report = await generateProjectPerformanceReport("2025-10-01", "2025-10-02");

      expect(report.data.projects).toBeDefined();
      expect(report.data.projects.length).toBeGreaterThan(0);

      const project = report.data.projects[0];
      expect(project.total_tasks).toBe(5);
      expect(project.completed).toBe(2);
      expect(project.in_progress).toBe(1);
      expect(project.to_do).toBe(1);
      expect(project.blocked).toBe(1);
    });

    it("should generate valid report metadata", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      expect(report.metadata.report_id).toBeDefined();
      expect(report.metadata.generated_at).toBeDefined();
      expect(report.metadata.generated_by).toBe("frontend");
      expect(new Date(report.metadata.generated_at)).toBeInstanceOf(Date);
    });
  });

  describe("generateUserProductivityReport - Positive", () => {
    it("should generate user productivity report with valid data", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      expect(report).toBeDefined();
      expect(report.metadata.report_type).toBe("user_productivity");
      expect(report.data.team_members).toBeDefined();
      expect(Array.isArray(report.data.team_members)).toBe(true);
    });

    it("should calculate user completion rates correctly", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      report.data.team_members.forEach(member => {
        expect(member.completion_rate).toBeGreaterThanOrEqual(0);
        expect(member.completion_rate).toBeLessThanOrEqual(100);
        expect(typeof member.completion_rate).toBe("number");
      });
    });

    it("should sort users by completion rate descending", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      for (let i = 0; i < report.data.team_members.length - 1; i++) {
        expect(report.data.team_members[i].completion_rate).toBeGreaterThanOrEqual(
          report.data.team_members[i + 1].completion_rate
        );
      }
    });

    it("should calculate summary metrics correctly", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      expect(report.summary.total_users).toBeGreaterThanOrEqual(0);
      expect(report.summary.total_tasks_assigned).toBeGreaterThanOrEqual(0);
      expect(report.summary.total_completed).toBeGreaterThanOrEqual(0);
      expect(report.summary.average_completion_rate).toBeGreaterThanOrEqual(0);
      expect(report.summary.average_completion_rate).toBeLessThanOrEqual(100);
    });
  });

  describe("generateDepartmentActivityReport - Positive", () => {
    it("should generate department activity report with weekly aggregation", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateDepartmentActivityReport(
        "IT Team",
        "weekly",
        "2025-09-15",
        "2025-10-01"
      );

      expect(report).toBeDefined();
      expect(report.metadata.report_type).toBe("department_activity");
      expect(report.summary.aggregation_type).toBe("weekly");
      expect(report.data.weekly_data).toBeDefined();
    });

    it("should generate department activity report with monthly aggregation", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateDepartmentActivityReport(
        "Support Team",
        "monthly",
        "2025-09-01",
        "2025-10-31"
      );

      expect(report).toBeDefined();
      expect(report.summary.aggregation_type).toBe("monthly");
      expect(report.data.monthly_data).toBeDefined();
    });
  });

  describe("getUniqueDepartments - Positive", () => {
    it("should return unique departments sorted alphabetically", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const departments = await getUniqueDepartments();

      expect(Array.isArray(departments)).toBe(true);
      expect(departments.length).toBeGreaterThan(0);

      const uniqueDepts = new Set(departments);
      expect(uniqueDepts.size).toBe(departments.length);

      for (let i = 0; i < departments.length - 1; i++) {
        expect(departments[i].localeCompare(departments[i + 1])).toBeLessThanOrEqual(0);
      }
    });

    it("should handle tasks with multiple departments", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const departments = await getUniqueDepartments();

      expect(departments).toContain("IT Team");
      expect(departments).toContain("Support Team");
    });
  });
});

// ==================== NEGATIVE TEST CASES ====================

describe("ReportGenerationFunction - Negative Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateProjectPerformanceReport - Negative", () => {
    it("should handle API failure gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to fetch tasks")
      );

      await expect(
        generateProjectPerformanceReport("2025-09-15", "2025-10-01")
      ).rejects.toThrow("Failed to fetch tasks");
    });

    it("should handle empty tasks array", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyTasks
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      expect(report.summary.total_projects).toBe(0);
      expect(report.data.projects.length).toBe(0);
    });

    it("should handle tasks without project names", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => tasksWithoutProjectNames
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      expect(report.summary.total_projects).toBe(0);
    });

    it("should handle non-200 API response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal Server Error" })
      });

      await expect(
        generateProjectPerformanceReport("2025-09-15", "2025-10-01")
      ).rejects.toThrow();
    });

    it("should handle tasks with no assigned users", async () => {
      const tasksNoUsers = [{
        taskId: 999,
        title: "Task with no users",
        project_name: "Test Project",
        status: "To Do",
        dueDate: "2025-10-01T00:00:00+00:00",
        assignedUsers: []
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => tasksNoUsers
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      expect(report.summary.total_projects).toBeGreaterThanOrEqual(0);
    });

    it("should handle invalid status values", async () => {
      const tasksInvalidStatus = [{
        taskId: 998,
        title: "Task with invalid status",
        project_name: "Test Project",
        status: "InvalidStatus",
        dueDate: "2025-10-01T00:00:00+00:00",
        assignedUsers: []
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => tasksInvalidStatus
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      const project = report.data.projects[0];
      expect(project.total_tasks).toBe(1);
    });
  });

  describe("generateUserProductivityReport - Negative", () => {
    it("should handle no tasks in date range", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => emptyTasks
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      expect(report.summary.total_users).toBe(0);
      expect(report.data.team_members.length).toBe(0);
    });

    it("should handle user fetch returning empty array", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      expect(report.data.team_members.length).toBeGreaterThan(0);
    });

    it("should handle malformed user data in tasks", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => tasksWithMalformedUsers
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      expect(report).toBeDefined();
    });

    it("should handle API error when fetching users", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: "Failed to fetch users" })
        });

      const report = await generateUserProductivityReport("2025-09-15", "2025-10-01");

      expect(report).toBeDefined();
    });
  });

  describe("getUniqueDepartments - Negative", () => {
    it("should handle API failure by returning empty array", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal Server Error" })
      });

      const result = await getUniqueDepartments();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty departments array", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const departments = await getUniqueDepartments();

      expect(departments.length).toBe(0);
    });

    it("should handle tasks with no departments", async () => {
      const tasksNoDepts = [{
        taskId: 997,
        title: "Task with no depts",
        departments: [],
        dueDate: "2025-10-01T00:00:00+00:00"
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => tasksNoDepts
      });

      const departments = await getUniqueDepartments();

      expect(departments.length).toBe(0);
    });
  });
});

// ==================== BOUNDARY TEST CASES ====================

describe("ReportGenerationFunction - Boundary Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Date Range Boundaries", () => {
    it("should handle same start and end date", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2025-10-01", "2025-10-01");

      expect(report).toBeDefined();
    });

    it("should handle date range with no matching tasks", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2025-12-01", "2025-12-31");

      expect(report.summary.total_projects).toBe(0);
      expect(report.data.projects.length).toBe(0);
    });

    it("should handle very large date range", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2020-01-01", "2030-12-31");

      expect(report).toBeDefined();
      expect(report.summary.total_projects).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Completion Rate Variations", () => {
    it("should handle mixed completion rates and sort correctly", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      // Verify all completion rates are valid
      report.data.projects.forEach(project => {
        expect(project.completion_rate).toBeGreaterThanOrEqual(0);
        expect(project.completion_rate).toBeLessThanOrEqual(100);
      });

      // Verify sorted descending
      for (let i = 0; i < report.data.projects.length - 1; i++) {
        expect(report.data.projects[i].completion_rate).toBeGreaterThanOrEqual(
          report.data.projects[i + 1].completion_rate
        );
      }
    });
  });

  describe("Large Data Sets", () => {
    it("should handle report generation efficiently", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const startTime = Date.now();
      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");
      const duration = Date.now() - startTime;

      expect(report).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe("Status Handling Edge Cases", () => {
    it("should handle tasks with missing or null status", async () => {
      const tasksNullStatus = [{
        taskId: 992,
        title: "Task with null status",
        project_name: "Null Status Test",
        status: null,
        dueDate: "2025-09-20T00:00:00+00:00",
        assignedUsers: []
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => tasksNullStatus
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-09-25");

      expect(report).toBeDefined();
    });
  });

  describe("Department Aggregation", () => {
    it("should handle single day aggregation", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateDepartmentActivityReport(
        "IT Team",
        "weekly",
        "2025-09-20",
        "2025-09-20"
      );

      expect(report).toBeDefined();
    });

    it("should handle cross-month date ranges", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksFromSystem
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUsers
        });

      const report = await generateDepartmentActivityReport(
        "Support Team",
        "monthly",
        "2025-08-15",
        "2025-10-15"
      );

      expect(report).toBeDefined();
      expect(report.data.monthly_data).toBeDefined();
    });
  });

  describe("Numeric Precision", () => {
    it("should handle completion rate precision to 1 decimal place", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasksFromSystem
      });

      const report = await generateProjectPerformanceReport("2025-09-15", "2025-10-01");

      report.data.projects.forEach(project => {
        const rateStr = project.completion_rate.toString();
        const decimalPlaces = (rateStr.split(".")[1] || "").length;
        expect(decimalPlaces).toBeLessThanOrEqual(1);
      });
    });
  });
});
