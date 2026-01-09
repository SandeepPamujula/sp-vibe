/**
 * Request Context Utilities
 *
 * Functions to extract user and tenant context from request headers.
 * These headers are injected by the middleware for authenticated requests.
 */

import { headers } from 'next/headers';

import type { UserRole } from '../../../drizzle/schema';

/**
 * Header names for tenant context (must match middleware)
 */
export const TENANT_HEADERS = {
  USER_ID: 'x-user-id',
  USER_EMAIL: 'x-user-email',
  USER_NAME: 'x-user-name',
  USER_ROLE: 'x-user-role',
  TENANT_ID: 'x-tenant-id',
  TENANT_SLUG: 'x-tenant-slug',
} as const;

/**
 * User context from request headers
 */
export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Tenant context from request headers
 */
export interface RequestTenant {
  tenantId: string;
  tenantSlug: string;
}

/**
 * Full request context with user and tenant
 */
export interface RequestContext {
  user: RequestUser;
  tenant: RequestTenant;
}

/**
 * Get user context from request headers
 *
 * @returns User context or null if not authenticated
 */
export async function getRequestUser(): Promise<RequestUser | null> {
  const headersList = await headers();

  const id = headersList.get(TENANT_HEADERS.USER_ID);
  const email = headersList.get(TENANT_HEADERS.USER_EMAIL);
  const name = headersList.get(TENANT_HEADERS.USER_NAME);
  const role = headersList.get(TENANT_HEADERS.USER_ROLE) as UserRole | null;

  if (!id || !email || !name || !role) {
    return null;
  }

  return { id, email, name, role };
}

/**
 * Get tenant context from request headers
 *
 * @returns Tenant context or null if not authenticated
 */
export async function getRequestTenant(): Promise<RequestTenant | null> {
  const headersList = await headers();

  const tenantId = headersList.get(TENANT_HEADERS.TENANT_ID);
  const tenantSlug = headersList.get(TENANT_HEADERS.TENANT_SLUG);

  if (!tenantId || !tenantSlug) {
    return null;
  }

  return { tenantId, tenantSlug };
}

/**
 * Get full request context (user + tenant)
 *
 * @returns Full context or null if not authenticated
 */
export async function getRequestContext(): Promise<RequestContext | null> {
  const user = await getRequestUser();
  const tenant = await getRequestTenant();

  if (!user || !tenant) {
    return null;
  }

  return { user, tenant };
}

/**
 * Require request context or throw error
 *
 * @throws Error if not authenticated
 * @returns The request context
 */
export async function requireRequestContext(): Promise<RequestContext> {
  const context = await getRequestContext();

  if (!context) {
    throw new Error('Unauthorized: No request context');
  }

  return context;
}

/**
 * Get tenant ID from request headers
 *
 * Convenience function for database queries that need tenant filtering.
 *
 * @returns Tenant ID or null if not authenticated
 */
export async function getRequestTenantId(): Promise<string | null> {
  const tenant = await getRequestTenant();
  return tenant?.tenantId ?? null;
}

/**
 * Require tenant ID or throw error
 *
 * @throws Error if not authenticated
 * @returns The tenant ID
 */
export async function requireTenantId(): Promise<string> {
  const tenantId = await getRequestTenantId();

  if (!tenantId) {
    throw new Error('Unauthorized: No tenant context');
  }

  return tenantId;
}
