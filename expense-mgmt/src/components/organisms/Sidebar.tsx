'use client';

/**
 * Sidebar Component
 *
 * Navigation sidebar with role-based menu items.
 */

import Link from 'next/link';
import React from 'react';

import { ReceiptIcon, CheckCircleIcon, ChartBarIcon } from '@/components/atoms/Icon';
import { NavLink } from '@/components/atoms/NavLink';
import { LogoutButton } from '@/components/molecules/LogoutButton';
import type { UserRole } from '@/drizzle/schema';

export interface SidebarProps {
  /** User's role for filtering navigation */
  userRole: UserRole;
  /** Tenant name to display */
  tenantName?: string;
}

/**
 * Navigation items with role requirements
 */
const NAV_ITEMS = [
  {
    name: 'Expenses',
    href: '/expenses',
    icon: ReceiptIcon,
    roles: ['admin', 'approver'] as UserRole[],
  },
  {
    name: 'Approvals',
    href: '/approvals',
    icon: CheckCircleIcon,
    roles: ['approver'] as UserRole[],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
    roles: ['approver'] as UserRole[],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ userRole, tenantName }) => {
  // Filter navigation items based on role
  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/expenses" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <ReceiptIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-zinc-900 dark:text-white">ExpenseFlow</span>
            {tenantName && (
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">{tenantName}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink key={item.href} href={item.href} icon={<item.icon />}>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer with logout */}
      <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800">
        <LogoutButton className="w-full justify-start" />
      </div>
    </aside>
  );
};
