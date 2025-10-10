import { canEditTask, canEditTaskAssignees, determineDepartmentScope } from './Permissions';

// Mock CurrentUser and Task
const Staff_1 = { userId: 1, name: "Staff 1", email: "staff1@example.com", role: "Staff", department: "Sales Division" };
const Admin_2 = { userId: 2, name: "HR/Admin", email: "admin@example.com", role: "HR/Admin", department: "HR/Admin" };
const Manager_3 = { userId: 3, name: "Manager", email: "manager@example.com", role: "Manager", department: "Sales Manager" };
const Staff_4 = { userId: 4, name: "Staff 4", email: "staff4@example.com", role: "Staff", department: "Sales Manager" };

const mockTask = {
    taskId: 1,
    title: "Implement User Authentication System",
    description: "Design and develop a secure user authentication system with OAuth2 integration and password reset functionality. Include comprehensive unit tests and documentation.",
    startDate: "2025-09-15",
    completedDate: null,
    dueDate: "2025-10-01",
    priority: 7,
    assignedUsers: [Staff_1, Manager_3],
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
    department: "IT Team",
}

// Tests for canEditTask
describe('canEditTask', () => {
    test('returns true if user has allowed systemRole', () => {
        expect(canEditTask(Admin_2, mockTask)).toBe(true); // Manager can edit
        expect(canEditTask(Manager_3, mockTask)).toBe(true); // HR/Admin can edit
    });

    test('returns true if user is assigned to task', () => {
        expect(canEditTask(Staff_1, mockTask)).toBe(true); // Assigned user
    });

    test('returns false if user not allowed and not assigned', () => {
        expect(canEditTask(Staff_4, mockTask)).toBe(false); // Staff not assigned
    });
});

// Tests for canEditTaskAssignees
describe('canEditTaskAssignees', () => {
    test('returns true for allowed systemRoles', () => {
        expect(canEditTaskAssignees(Admin_2)).toBe(true);
        expect(canEditTaskAssignees(Manager_3)).toBe(true);
    });

    test('returns false for other roles', () => {
        expect(canEditTaskAssignees(Staff_1)).toBe(false);
        expect(canEditTaskAssignees(Staff_4)).toBe(false);
    });
});

// Tests for determineDepartmentScope
const dummyUserDetails = {}; // To address type error
describe('determineDepartmentScope', () => {
    test('returns department and direct children for divisions', () => {
        const currentUser = { userId: 5, name: "Dummy User", email: "dummy@example.com", role: "Staff", department: "Sales Division" };
        const expected = ["Sales Division", "Sales Manager", "Account Managers"];
        expect(determineDepartmentScope(currentUser)).toEqual(expected);
    });

    test('returns department and children for manager level', () => {
        const currentUser = { userId: 5, name: "Dummy User", email: "dummy@example.com", role: "Staff", department: "Sales Manager" };
        const expected = ["Sales Manager", "Account Managers"];
        expect(determineDepartmentScope(currentUser)).toEqual(expected);
    });

    test('returns only department when no children', () => {
        const currentUser = { userId: 5, name: "Dummy User", email: "dummy@example.com", role: "Staff", department: "Account Managers" };
        const expected = ["Account Managers"];
        expect(determineDepartmentScope(currentUser)).toEqual(expected);
    });
});
