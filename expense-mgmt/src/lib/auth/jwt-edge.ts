/**
 * Edge-Compatible JWT Utilities
 *
 * Uses `jose` library for JWT verification in Edge runtime (middleware).
 * This is separate from jwt.ts which uses `jsonwebtoken` (Node.js only).
 */

import * as jose from 'jose';

import type { JwtPayload, AuthToken } from '@/types/auth.types';

import type { UserRole } from '../../../drizzle/schema';

/**
 * Get JWT secret as Uint8Array for jose library
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Result of Edge token verification
 */
export interface EdgeVerifyResult {
  success: boolean;
  token?: AuthToken;
  error?: string;
}

/**
 * Verify a JWT token in Edge runtime
 *
 * @param token - JWT token string to verify
 * @returns Verification result with decoded token or error
 */
export async function verifyTokenEdge(token: string): Promise<EdgeVerifyResult> {
  try {
    const secret = getSecretKey();
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    // Cast payload to our JWT structure
    const jwtPayload = payload as unknown as JwtPayload;

    // Convert to AuthToken format
    const authToken: AuthToken = {
      userId: jwtPayload.sub,
      email: jwtPayload.email,
      name: jwtPayload.name,
      role: jwtPayload.role as UserRole,
      tenantId: jwtPayload.tenantId,
      tenantSlug: jwtPayload.tenantSlug,
      issuedAt: new Date((jwtPayload.iat ?? 0) * 1000),
      expiresAt: new Date((jwtPayload.exp ?? 0) * 1000),
    };

    return { success: true, token: authToken };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return { success: false, error: 'Token has expired' };
    }
    if (error instanceof jose.errors.JWTInvalid) {
      return { success: false, error: 'Invalid token' };
    }
    if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
      return { success: false, error: 'Invalid token signature' };
    }
    return { success: false, error: 'Token verification failed' };
  }
}

/**
 * Decode a JWT token without verification (Edge-compatible)
 * Useful for reading token data when signature verification isn't needed
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid format
 */
export function decodeTokenEdge(token: string): JwtPayload | null {
  try {
    const decoded = jose.decodeJwt(token) as unknown as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired (Edge-compatible)
 *
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpiredEdge(token: string): boolean {
  const decoded = decodeTokenEdge(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() >= decoded.exp * 1000;
}
