/**
 * Role-Based Permission Utilities
 *
 * Functions for checking user permissions and route access.
 */

import { ROLE_PERMISSIONS } from '@/constants/auth.constants';
import type { PermissionAction } from '@/types/auth.types';

import type { UserRole } from '../../../drizzle/schema';

/**
 * Route permission configuration
 */
export interface RoutePermission {
  /** Route path pattern */
  path: string;
  /** Allowed roles (if empty, all authenticated users can access) */
  roles?: UserRole[];
  /** Required permissions (user must have ALL of these) */
  permissions?: PermissionAction[];
}

/**
 * Route permissions configuration
 * Define which roles can access which routes
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Expenses - all authenticated users
  { path: '/expenses', roles: ['admin', 'approver'] },

  // Approvals - approvers only
  { path: '/approvals', roles: ['approver'], permissions: ['expense:approve'] },

  // Reports - approvers only
  { path: '/reports', roles: ['approver'], permissions: ['report:generate'] },
];

/**
 * Check if a user has a specific permission
 *
 * @param role - User's role
 * @param permission - Permission to check
 * @returns true if user has the permission
 */
export function hasPermission(role: UserRole, permission: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.includes(permission);
}

/**
 * Check if a user has all specified permissions
 *
 * @param role - User's role
 * @param permissions - Permissions to check
 * @returns true if user has all permissions
 */
export function hasAllPermissions(role: UserRole, permissions: PermissionAction[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a user has any of the specified permissions
 *
 * @param role - User's role
 * @param permissions - Permissions to check
 * @returns true if user has any of the permissions
 */
export function hasAnyPermission(role: UserRole, permissions: PermissionAction[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 *
 * @param role - User's role
 * @returns Array of permissions
 */
export function getRolePermissions(role: UserRole): PermissionAction[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if a user can access a specific route
 *
 * @param role - User's role
 * @param pathname - Route path to check
 * @returns Object with access result and reason
 */
export function canAccessRoute(
  role: UserRole,
  pathname: string
): { allowed: boolean; reason?: string } {
  // Find matching route permission
  const routePermission = ROUTE_PERMISSIONS.find((rp) => {
    if (rp.path === pathname) return true;
    // Support prefix matching for nested routes
    if (pathname.startsWith(rp.path + '/')) return true;
    return false;
  });

  // If no explicit permission defined, allow access (default behavior)
  if (!routePermission) {
    return { allowed: true };
  }

  // Check role restriction
  if (routePermission.roles && !routePermission.roles.includes(role)) {
    return {
      allowed: false,
      reason: `This page requires one of these roles: ${routePermission.roles.join(', ')}`,
    };
  }

  // Check permission requirements
  if (routePermission.permissions && !hasAllPermissions(role, routePermission.permissions)) {
    return {
      allowed: false,
      reason: 'You do not have the required permissions to access this page',
    };
  }

  return { allowed: true };
}

/**
 * Get navigation items based on user role
 *
 * @param role - User's role
 * @returns Navigation items the user can access
 */
export function getNavigationForRole(role: UserRole): {
  name: string;
  href: string;
  icon: string;
}[] {
  const allNavItems = [
    { name: 'Expenses', href: '/expenses', icon: 'receipt' },
    { name: 'Approvals', href: '/approvals', icon: 'check-circle' },
    { name: 'Reports', href: '/reports', icon: 'chart-bar' },
  ];

  return allNavItems.filter((item) => {
    const access = canAccessRoute(role, item.href);
    return access.allowed;
  });
}
