/**
 * Library utilities
 *
 * Central export for all library modules.
 *
 * - env.ts: Environment variable validation
 * - config.ts: Application configuration
 * - db.ts: Database client (Drizzle) - TBD
 * - auth.ts: Authentication utilities - TBD
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
