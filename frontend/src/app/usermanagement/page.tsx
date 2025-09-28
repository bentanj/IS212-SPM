// app/user-management/page.tsx
import React from 'react';
import { Metadata } from 'next';
import UserManagementTable from './UserManagement';

// Metadata for the page
export const metadata: Metadata = {
  title: 'User Management | Sisyphus Ventures',
  description: 'Manage your team members and their account permissions',
};

// Main page component
export default function UserManagementPage() {
  return (
    <div>
      <UserManagementTable />
    </div>
  );
}
