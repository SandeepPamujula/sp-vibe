/**
 * Mock Azure Entra SSO Provider
 *
 * Simulates Azure AD/Entra ID Single Sign-On for development and testing.
 * In production, this would be replaced with actual Azure AD integration.
 *
 * Features:
 * - Provides list of test users from the database
 * - Simulates SSO authentication flow
 * - Returns user data in Azure AD token format
 */

import { eq, and } from 'drizzle-orm';

import { users, tenants, type Tenant, type UserRole } from '../../../drizzle/schema';
import { db } from '../db';

/**
 * Mock Azure AD user profile format
 * Simulates the claims returned by Azure Entra ID
 */
export interface AzureAdUserProfile {
  /** Azure AD Object ID (maps to user.id) */
  oid: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** User's preferred username (email) */
  preferred_username: string;
  /** Tenant ID from Azure AD (maps to our tenant.id) */
  tid: string;
  /** Token issued at timestamp */
  iat: number;
  /** Token expiration timestamp */
  exp: number;
}

/**
 * Test user for display in login UI
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

/**
 * Mock SSO authentication result
 */
export interface MockSsoResult {
  success: boolean;
  user?: TestUser;
  profile?: AzureAdUserProfile;
  error?: string;
}

/**
 * Get all test users available for mock SSO login
 *
 * Returns users with their tenant information for display in the login UI.
 *
 * @param tenantSlug - Optional tenant slug to filter users
 * @returns Array of test users
 */
export async function getTestUsers(tenantSlug?: string): Promise<TestUser[]> {
  // Query users with their tenant information
  const query = db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      tenantId: tenants.id,
      tenantName: tenants.name,
      tenantSlug: tenants.slug,
    })
    .from(users)
    .innerJoin(tenants, eq(users.tenantId, tenants.id))
    .where(and(eq(users.isActive, true), eq(tenants.isActive, true)));

  const results = await query;

  // Filter by tenant slug if provided
  if (tenantSlug) {
    return results.filter((user) => user.tenantSlug === tenantSlug);
  }

  return results;
}

/**
 * Get available tenants for login
 *
 * @returns Array of active tenants
 */
export async function getAvailableTenants(): Promise<Pick<Tenant, 'id' | 'name' | 'slug'>[]> {
  const results = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
    })
    .from(tenants)
    .where(eq(tenants.isActive, true));

  return results;
}

/**
 * Mock SSO authenticate
 *
 * Simulates Azure AD SSO authentication by looking up the user in the database.
 * In a real implementation, this would validate a token from Azure AD.
 *
 * @param email - User's email address
 * @param tenantSlug - Tenant slug
 * @returns Mock SSO result with user profile
 */
export async function mockSsoAuthenticate(
  email: string,
  tenantSlug: string
): Promise<MockSsoResult> {
  // Find the tenant
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.slug, tenantSlug), eq(tenants.isActive, true)))
    .limit(1);

  if (!tenant) {
    return {
      success: false,
      error: 'Tenant not found or inactive',
    };
  }

  // Find the user in the tenant
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.tenantId, tenant.id), eq(users.isActive, true)))
    .limit(1);

  if (!user) {
    return {
      success: false,
      error: 'User not found in this tenant or inactive',
    };
  }

  // Update last login timestamp
  await db
    .update(users)
    .set({ lastLogin: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Build test user response
  const testUser: TestUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
  };

  // Build mock Azure AD profile
  const now = Math.floor(Date.now() / 1000);
  const profile: AzureAdUserProfile = {
    oid: user.id,
    email: user.email,
    name: user.name,
    preferred_username: user.email,
    tid: tenant.id,
    iat: now,
    exp: now + 3600, // 1 hour expiry
  };

  return {
    success: true,
    user: testUser,
    profile,
  };
}

/**
 * Get user by ID with tenant info
 *
 * Utility function to look up a user by ID for session validation.
 *
 * @param userId - User's UUID
 * @returns User with tenant info or null
 */
export async function getUserById(userId: string): Promise<TestUser | null> {
  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      tenantId: tenants.id,
      tenantName: tenants.name,
      tenantSlug: tenants.slug,
    })
    .from(users)
    .innerJoin(tenants, eq(users.tenantId, tenants.id))
    .where(and(eq(users.id, userId), eq(users.isActive, true), eq(tenants.isActive, true)))
    .limit(1);

  return result || null;
}
