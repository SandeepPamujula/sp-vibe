'use client';

/**
 * NavLink Component
 *
 * Navigation link with active state styling.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export interface NavLinkProps {
  /** Link destination */
  href: string;
  /** Link text */
  children: React.ReactNode;
  /** Icon component */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, children, icon, className = '' }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${
          isActive
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
        }
        ${className}
      `}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </Link>
  );
};
