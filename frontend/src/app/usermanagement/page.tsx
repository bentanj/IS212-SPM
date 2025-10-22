'use client';

import UserManagement from './UserManagement';
import { taskMockData } from '@/mocks/staff/taskMockData';

export default function UserManagementPage() {
  // Mock authentication check - replace with actual auth
  const currentUser = taskMockData.currentUser;
  
  // Only allow HR/Admin access
  if (!currentUser || (currentUser.role !== 'HR/Admin' && currentUser.department !== 'Human Resources')) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>Access Denied</h1>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Only HR and Admin users can access the User Management system.
        </p>
      </div>
    );
  }

  return <UserManagement />;
}
