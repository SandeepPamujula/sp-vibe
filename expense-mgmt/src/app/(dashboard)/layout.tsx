/**
 * Dashboard Layout
 *
 * Protected layout for dashboard pages.
 * Requires authentication and displays navigation.
 */

import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/session';

import { DashboardShell } from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Get session (server-side)
  const { session } = await getSession();

  // Redirect to login if not authenticated
  // Note: This is a backup check - the proxy should handle this too
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardShell
      userName={session.user.name}
      userEmail={session.user.email}
      userRole={session.user.role}
      tenantSlug={session.tenant.tenantSlug}
    >
      {children}
    </DashboardShell>
  );
}
