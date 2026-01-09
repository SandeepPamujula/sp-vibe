/**
 * Authentication & Authorization Constants
 *
 * Role permissions, JWT settings, and auth configuration.
 */

import type { PermissionAction } from '@/types/auth.types';

import type { UserRole } from '../../drizzle/schema';

/**
 * Role-based permission map
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: [
    'expense:create',
    'expense:read',
    'expense:update',
    'expense:delete',
    'expense:submit',
    'audit:view',
  ],
  approver: [
    'expense:create',
    'expense:read',
    'expense:update',
    'expense:delete',
    'expense:submit',
    'expense:approve',
    'expense:reject',
    'expense:view-all',
    'report:generate',
    'report:export',
    'audit:view',
  ],
};

/**
 * JWT configuration
 */
export const JWT_CONFIG = {
  /** Token expiration time in seconds (24 hours) */
  EXPIRES_IN: 60 * 60 * 24,
  /** Token algorithm */
  ALGORITHM: 'HS256' as const,
} as const;

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  /** Cookie name */
  COOKIE_NAME: 'expense_session',
  /** Cookie max age in seconds (7 days) */
  MAX_AGE: 60 * 60 * 24 * 7,
} as const;
