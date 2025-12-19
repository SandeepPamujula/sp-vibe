/**
 * UserCard Component
 *
 * Displays user information with role badge for selection.
 */

'use client';

import { Badge } from '../atoms';

export interface UserCardProps {
  /** User's name */
  name: string;
  /** User's email */
  email: string;
  /** User's role */
  role: 'admin' | 'approver';
  /** Whether this card is selected */
  isSelected?: boolean;
  /** Whether the card is in loading state */
  isLoading?: boolean;
  /** Click handler */
  onClick?: () => void;
}

const roleLabels: Record<string, string> = {
  admin: 'Facility Admin',
  approver: 'Approver',
};

const roleBadgeVariants: Record<string, 'info' | 'success'> = {
  admin: 'info',
  approver: 'success',
};

export function UserCard({
  name,
  email,
  role,
  isSelected = false,
  isLoading = false,
  onClick,
}: UserCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full p-4 rounded-xl border-2 text-left
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
        disabled:opacity-70 disabled:cursor-wait
        ${
          isSelected
            ? 'border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800/50 shadow-md'
            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className={`
            flex-shrink-0 w-10 h-10 rounded-full 
            flex items-center justify-center text-white font-semibold text-sm
            ${role === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}
          `}
          >
            {getInitials(name)}
          </div>

          {/* User info */}
          <div className="min-w-0">
            <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{email}</p>
          </div>
        </div>

        {/* Role badge */}
        <Badge variant={roleBadgeVariants[role]} size="sm" className="flex-shrink-0">
          {roleLabels[role]}
        </Badge>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <CheckIcon />
          <span>Selected - Click to sign in</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
          <LoadingIcon />
          <span>Signing in...</span>
        </div>
      )}
    </button>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
