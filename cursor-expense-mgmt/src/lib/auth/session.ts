/**
 * Session Management
 *
 * Utilities for managing user sessions via HTTP-only cookies.
 * Sessions are stored as JWT tokens in a secure cookie.
 */

import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

import type { AuthToken, UserSession, TenantContext } from '@/types/auth.types';

import { authConfig } from '../config';

import { signToken, verifyToken, type TokenUserData } from './jwt';

/**
 * Cookie options for session cookie
 */
const cookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: authConfig.session.MAX_AGE,
};

/**
 * Session result with user session or null
 */
export interface SessionResult {
  session: UserSession | null;
  token: AuthToken | null;
  error?: string;
}

/**
 * Create a session for a user
 *
 * Signs a JWT token and sets it as an HTTP-only cookie.
 *
 * @param user - User data to store in session
 * @returns The signed JWT token
 */
export async function createSession(user: TokenUserData): Promise<string> {
  const token = signToken(user);

  const cookieStore = await cookies();
  cookieStore.set(authConfig.session.COOKIE_NAME, token, cookieOptions);

  return token;
}

/**
 * Get the current session from cookies
 *
 * Reads the session cookie, verifies the JWT, and returns the session data.
 *
 * @returns Session result with user session and token, or null if no valid session
 */
export async function getSession(): Promise<SessionResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(authConfig.session.COOKIE_NAME);

  if (!sessionCookie?.value) {
    return { session: null, token: null };
  }

  const result = verifyToken(sessionCookie.value);

  if (!result.success || !result.token) {
    return { session: null, token: null, error: result.error };
  }

  const token = result.token;

  // Build the user session object
  const session: UserSession = {
    user: {
      id: token.userId,
      email: token.email,
      name: token.name,
      role: token.role,
    },
    tenant: {
      tenantId: token.tenantId,
      tenantSlug: token.tenantSlug,
      isActive: true, // Assumed active if token is valid
    },
  };

  return { session, token };
}

/**
 * Clear the session cookie (logout)
 *
 * Deletes the session cookie to end the user's session.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(authConfig.session.COOKIE_NAME);
}

/**
 * Refresh the session with updated user data
 *
 * Creates a new token and updates the session cookie.
 *
 * @param user - Updated user data
 * @returns The new signed JWT token
 */
export async function refreshSession(user: TokenUserData): Promise<string> {
  return createSession(user);
}

/**
 * Check if a session exists and is valid
 *
 * @returns true if valid session exists, false otherwise
 */
export async function hasValidSession(): Promise<boolean> {
  const { session } = await getSession();
  return session !== null;
}

/**
 * Get the tenant context from the current session
 *
 * @returns TenantContext or null if no valid session
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const { session } = await getSession();
  return session?.tenant ?? null;
}

/**
 * Require a valid session or throw an error
 *
 * @throws Error if no valid session exists
 * @returns The valid session
 */
export async function requireSession(): Promise<{ session: UserSession; token: AuthToken }> {
  const result = await getSession();

  if (!result.session || !result.token) {
    throw new Error('Unauthorized: No valid session');
  }

  return { session: result.session, token: result.token };
}
