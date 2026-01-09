'use client';

/**
 * LogoutButton Component
 *
 * Button that logs out the user and redirects to login page.
 */

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Spinner } from '@/components/atoms';
import { LogoutIcon } from '@/components/atoms/Icon';

export interface LogoutButtonProps {
  /** Show text label */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ showLabel = true, className = '' }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Redirect to login page
        router.push('/login');
        router.refresh();
      } else {
        console.error('Logout failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
        text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900
        dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? <Spinner size="sm" /> : <LogoutIcon className="w-5 h-5" />}
      {showLabel && <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>}
    </button>
  );
};
