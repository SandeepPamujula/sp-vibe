'use client';

/**
 * DashboardShell Component
 *
 * Client-side shell that wraps dashboard pages with navigation.
 */

import React from 'react';

import { Sidebar, Header } from '@/components/organisms';
import type { UserRole } from '@/drizzle/schema';

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  tenantSlug: string;
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  userRole,
  tenantSlug,
}: DashboardShellProps) {
  // Get tenant display name (capitalize first letter)
  const tenantName = tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Sidebar */}
      <Sidebar userRole={userRole} tenantName={tenantName} />

      {/* Main content area */}
      <div className="ml-64">
        {/* Header */}
        <Header userName={userName} userEmail={userEmail} userRole={userRole} />

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
