/**
 * Application Configuration
 *
 * Centralized configuration module that provides typed access
 * to all application settings derived from environment variables.
 */

import { JWT_CONFIG, SESSION_CONFIG } from '@/constants/auth.constants';
import { FILE_SIZE_LIMITS, S3_CONFIG, ALLOWED_MIME_TYPES } from '@/constants/file.constants';

import { env, isDevelopment, isProduction, isTest } from './env';

/**
 * Database configuration
 */
export const databaseConfig = {
  url: env.DATABASE_URL,
  /** Enable query logging in development */
  logging: isDevelopment,
  /** Connection pool settings */
  pool: {
    min: isProduction ? 2 : 1,
    max: isProduction ? 10 : 5,
  },
} as const;

/**
 * Authentication configuration
 */
export const authConfig = {
  /** JWT signing secret */
  jwtSecret: env.JWT_SECRET,
  /** JWT token settings from constants */
  jwt: JWT_CONFIG,
  /** Session cookie settings from constants */
  session: SESSION_CONFIG,
} as const;

/**
 * AWS configuration
 */
export const awsConfig = {
  region: env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  /** Whether AWS is properly configured */
  isConfigured: Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY),
} as const;

/**
 * S3 file storage configuration
 */
export const s3Config = {
  bucket: env.S3_BUCKET ?? 'expense-attachments-dev',
  /** Merge with constants */
  ...S3_CONFIG,
  /** File validation settings */
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  maxFileSize: FILE_SIZE_LIMITS.MAX_SIZE,
  maxFilesPerExpense: FILE_SIZE_LIMITS.MAX_FILES,
  /** Whether S3 is properly configured */
  isConfigured: Boolean(env.S3_BUCKET && awsConfig.isConfigured),
} as const;

/**
 * Email (SES) configuration
 */
export const emailConfig = {
  fromEmail: env.SES_FROM_EMAIL ?? 'noreply@example.com',
  /** Whether email is properly configured */
  isConfigured: Boolean(env.SES_FROM_EMAIL && awsConfig.isConfigured),
} as const;

/**
 * Application URLs configuration
 */
export const urlConfig = {
  appUrl: env.NEXT_PUBLIC_APP_URL,
  /** API base URL (same as app URL for Next.js) */
  apiUrl: env.NEXT_PUBLIC_APP_URL,
} as const;

/**
 * Feature flags based on environment
 */
export const features = {
  /** Enable detailed error messages */
  showDetailedErrors: isDevelopment || isTest,
  /** Enable request logging */
  requestLogging: isDevelopment,
  /** Enable mock authentication (skip real auth in dev) */
  mockAuth: isDevelopment && !isProduction,
  /** Enable S3 uploads (requires AWS config) */
  s3Uploads: s3Config.isConfigured,
  /** Enable email notifications (requires SES config) */
  emailNotifications: emailConfig.isConfigured,
} as const;

/**
 * Environment information
 */
export const environment = {
  nodeEnv: env.NODE_ENV,
  isDevelopment,
  isProduction,
  isTest,
} as const;

/**
 * Combined application configuration
 */
export const config = {
  database: databaseConfig,
  auth: authConfig,
  aws: awsConfig,
  s3: s3Config,
  email: emailConfig,
  urls: urlConfig,
  features,
  environment,
} as const;

/**
 * Config type for type inference
 */
export type AppConfig = typeof config;
