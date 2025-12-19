/**
 * Library utilities
 *
 * Central export for all library modules.
 *
 * - env.ts: Environment variable validation
 * - config.ts: Application configuration
 * - db.ts: Database client (Drizzle)
 * - auth/: Authentication utilities (mock SSO, JWT)
 * - s3.ts: S3 client for file uploads - TBD
 * - email.ts: SES client for notifications - TBD
 */

// Environment and configuration
export { env, isDevelopment, isProduction, isTest } from './env';
export type { Env } from './env';

export {
  config,
  databaseConfig,
  authConfig,
  awsConfig,
  s3Config,
  emailConfig,
  urlConfig,
  features,
  environment,
} from './config';
export type { AppConfig } from './config';

// Database
export { db } from './db';
export type { Database } from './db';

// Authentication - Mock SSO
export { getTestUsers, getAvailableTenants, mockSsoAuthenticate, getUserById } from './auth';
export type { AzureAdUserProfile, TestUser, MockSsoResult } from './auth';

// Authentication - JWT
export { signToken, verifyToken, decodeToken, isTokenExpired, getTokenTTL } from './auth';
export type { TokenUserData, VerifyTokenResult } from './auth';

// Authentication - Session
export {
  createSession,
  getSession,
  clearSession,
  refreshSession,
  hasValidSession,
  getTenantContext,
  requireSession,
} from './auth';
export type { SessionResult } from './auth';
