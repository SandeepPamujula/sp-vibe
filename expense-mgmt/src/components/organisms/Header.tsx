'use client';

/**
 * Header Component
 *
 * Top navigation bar with user profile and actions.
 */

import React, { useState, useRef, useEffect } from 'react';

import { Badge } from '@/components/atoms';
import { Avatar } from '@/components/atoms/Avatar';
import { ChevronDownIcon } from '@/components/atoms/Icon';
import { LogoutButton } from '@/components/molecules/LogoutButton';
import type { UserRole } from '@/drizzle/schema';

export interface HeaderProps {
  /** User's display name */
  userName: string;
  /** User's email */
  userEmail: string;
  /** User's role */
  userRole: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Facility Admin',
  approver: 'Approver',
};

const roleVariants: Record<UserRole, 'info' | 'success'> = {
  admin: 'info',
  approver: 'success',
};

export const Header: React.FC<HeaderProps> = ({ userName, userEmail, userRole }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
      {/* Left side - Page title or breadcrumb could go here */}
      <div />

      {/* Right side - User profile */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Avatar name={userName} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{userName}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{userEmail}</p>
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 py-2 z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Avatar name={userName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{userEmail}</p>
                </div>
              </div>
              <div className="mt-3">
                <Badge variant={roleVariants[userRole]}>{roleLabels[userRole]}</Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="py-2">
              <LogoutButton className="w-full justify-start px-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
