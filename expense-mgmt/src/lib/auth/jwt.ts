/**
 * JWT Utilities
 *
 * Functions for signing and verifying JSON Web Tokens.
 * Uses HS256 algorithm with a secret key from environment.
 */

import jwt from 'jsonwebtoken';

import type { JwtPayload, AuthToken } from '@/types/auth.types';

import type { UserRole } from '../../../drizzle/schema';
import { authConfig } from '../config';

/**
 * JWT sign options from config
 */
const signOptions: jwt.SignOptions = {
  algorithm: authConfig.jwt.ALGORITHM,
  expiresIn: authConfig.jwt.EXPIRES_IN,
};

/**
 * JWT verify options
 */
const verifyOptions: jwt.VerifyOptions = {
  algorithms: [authConfig.jwt.ALGORITHM],
};

/**
 * User data required to create a JWT token
 */
export interface TokenUserData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantSlug: string;
}

/**
 * Result of token verification
 */
export interface VerifyTokenResult {
  success: boolean;
  token?: AuthToken;
  error?: string;
}

/**
 * Create a signed JWT token for a user
 *
 * @param user - User data to encode in the token
 * @returns Signed JWT string
 */
export function signToken(user: TokenUserData): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: user.tenantSlug,
  };

  return jwt.sign(payload, authConfig.jwtSecret, signOptions);
}

/**
 * Verify and decode a JWT token
 *
 * @param token - JWT token string to verify
 * @returns Verification result with decoded token or error
 */
export function verifyToken(token: string): VerifyTokenResult {
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret, verifyOptions) as JwtPayload;

    // Convert to AuthToken format
    const authToken: AuthToken = {
      userId: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      tenantId: decoded.tenantId,
      tenantSlug: decoded.tenantSlug,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: new Date(decoded.exp * 1000),
    };

    return { success: true, token: authToken };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Token has expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid token' };
    }
    return { success: false, error: 'Token verification failed' };
  }
}

/**
 * Decode a JWT token without verification
 * Useful for reading token data when signature verification isn't needed
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid format
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 *
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() >= decoded.exp * 1000;
}

/**
 * Get remaining time until token expires (in seconds)
 *
 * @param token - JWT token string
 * @returns Seconds until expiration, or 0 if already expired
 */
export function getTokenTTL(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }
  const remaining = decoded.exp - Math.floor(Date.now() / 1000);
  return Math.max(0, remaining);
}
