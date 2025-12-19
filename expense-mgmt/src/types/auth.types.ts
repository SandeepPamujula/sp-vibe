/**
 * Authentication & Authorization Types
 *
 * Types for JWT payloads, sessions, and tenant context.
 */

import type { UserRole } from '../../drizzle/schema';

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantSlug: string;
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Decoded and validated token data
 */
export interface AuthToken {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantSlug: string;
  issuedAt: Date;
  expiresAt: Date;
}

/**
 * Tenant context extracted from authentication
 */
export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  isActive: boolean;
}

/**
 * Authenticated user session
 */
export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  tenant: TenantContext;
}

/**
 * Request context with authentication data
 */
export interface AuthContext {
  session: UserSession;
  token: AuthToken;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  tenantSlug: string;
}

/**
 * Login response with token
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Permission action types
 */
export type PermissionAction =
  | 'expense:create'
  | 'expense:read'
  | 'expense:update'
  | 'expense:delete'
  | 'expense:submit'
  | 'expense:approve'
  | 'expense:reject'
  | 'expense:view-all'
  | 'report:generate'
  | 'report:export'
  | 'audit:view';
