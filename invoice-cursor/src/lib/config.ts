/**
 * Centralized Configuration Management
 * 
 * This module provides type-safe access to environment variables with validation.
 * All environment variables are validated using Zod schemas to ensure type safety
 * and provide clear error messages for missing or invalid configuration.
 * 
 * @example
 * ```typescript
 * import { config } from '@/lib/config';
 * 
 * // Access configuration values
 * const tableName = config.dynamodb.invoicesTable;
 * const bucketName = config.s3.bucketName;
 * ```
 */

import { z } from 'zod';

/**
 * Environment schema for validation
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'], {
      errorMap: () => ({ message: 'NODE_ENV must be one of: development, test, staging, production' }),
    })
    .default('development'),
  APP_NAME: z.string().min(1).default('invoice-cursor'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug'], {
      errorMap: () => ({ message: 'LOG_LEVEL must be one of: error, warn, info, debug' }),
    })
    .default('info'),

  // AWS Configuration
  AWS_REGION: z.string().min(1).default('us-east-1'),
  AWS_ACCOUNT_ID: z.string().optional(), // Optional, used for resource ARNs

  // DynamoDB Configuration
  DYNAMODB_USERS_TABLE: z.string().min(1).default('invoice-users'),
  DYNAMODB_INVOICES_TABLE: z.string().min(1).default('invoice-invoices'),

  // S3 Configuration
  S3_BUCKET_NAME: z.string().min(1).default('invoice-attachments'),
  S3_BUCKET_REGION: z.string().min(1).optional(), // Optional, defaults to AWS_REGION

  // SES Configuration
  SES_REGION: z.string().min(1).optional(), // Optional, defaults to AWS_REGION
  SES_FROM_EMAIL: z.string().email('SES_FROM_EMAIL must be a valid email address').optional(),
  SES_REPLY_TO_EMAIL: z.string().email('SES_REPLY_TO_EMAIL must be a valid email address').optional(),

  // Sentry Configuration
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  SENTRY_ENVIRONMENT: z.string().optional(), // Optional, defaults to NODE_ENV
  SENTRY_TRACES_SAMPLE_RATE: z
    .string()
    .regex(/^(0|1|0\.\d+)$/, 'SENTRY_TRACES_SAMPLE_RATE must be between 0 and 1')
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),

  // API Configuration
  API_BASE_URL: z.string().url('API_BASE_URL must be a valid URL').optional(),
  API_TIMEOUT_MS: z
    .string()
    .regex(/^\d+$/, 'API_TIMEOUT_MS must be a number')
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  // CORS Configuration
  CORS_ORIGIN: z.string().optional(), // Comma-separated list of allowed origins
  CORS_CREDENTIALS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .regex(/^\d+$/, 'RATE_LIMIT_MAX_REQUESTS must be a number')
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .regex(/^\d+$/, 'RATE_LIMIT_WINDOW_MS must be a number')
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  // Next.js Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').optional(),
});

/**
 * Validated environment variables
 */
type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((e) => e.code === 'invalid_type' && e.received === 'undefined')
        .map((e) => e.path.join('.'));
      const invalidVars = error.errors
        .filter((e) => e.code !== 'invalid_type' || e.received !== 'undefined')
        .map((e) => `${e.path.join('.')}: ${e.message}`);

      const errorMessages: string[] = [];
      if (missingVars.length > 0) {
        errorMessages.push(`Missing required environment variables: ${missingVars.join(', ')}`);
      }
      if (invalidVars.length > 0) {
        errorMessages.push(`Invalid environment variables:\n  ${invalidVars.join('\n  ')}`);
      }

      throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 */
const env = parseEnv();

/**
 * Application configuration object
 * Provides type-safe, validated access to all configuration values
 */
export const config = {
  /**
   * Application configuration
   */
  app: {
    name: env.APP_NAME,
    env: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    isStaging: env.NODE_ENV === 'staging',
    isProduction: env.NODE_ENV === 'production',
    logLevel: env.LOG_LEVEL,
  },

  /**
   * AWS configuration
   */
  aws: {
    region: env.AWS_REGION,
    accountId: env.AWS_ACCOUNT_ID,
  },

  /**
   * DynamoDB configuration
   */
  dynamodb: {
    usersTable: env.DYNAMODB_USERS_TABLE,
    invoicesTable: env.DYNAMODB_INVOICES_TABLE,
    region: env.AWS_REGION,
  },

  /**
   * S3 configuration
   */
  s3: {
    bucketName: env.S3_BUCKET_NAME,
    region: env.S3_BUCKET_REGION || env.AWS_REGION,
  },

  /**
   * SES configuration
   */
  ses: {
    region: env.SES_REGION || env.AWS_REGION,
    fromEmail: env.SES_FROM_EMAIL,
    replyToEmail: env.SES_REPLY_TO_EMAIL,
  },

  /**
   * Sentry configuration
   */
  sentry: {
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    enabled: !!env.SENTRY_DSN,
  },

  /**
   * API configuration
   */
  api: {
    baseUrl: env.API_BASE_URL,
    timeoutMs: env.API_TIMEOUT_MS || 30000, // Default 30 seconds
  },

  /**
   * CORS configuration
   */
  cors: {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : undefined,
    credentials: env.CORS_CREDENTIALS,
  },

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS || 100,
    windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // Default 15 minutes
  },

  /**
   * Next.js public configuration
   */
  nextjs: {
    publicAppUrl: env.NEXT_PUBLIC_APP_URL,
  },
} as const;

/**
 * Type export for configuration
 */
export type Config = typeof config;

/**
 * Validate that required configuration is present for production
 */
export function validateProductionConfig(): void {
  if (config.app.isProduction) {
    const errors: string[] = [];

    if (!config.ses.fromEmail) {
      errors.push('SES_FROM_EMAIL is required in production');
    }

    if (!config.sentry.dsn) {
      errors.push('SENTRY_DSN is recommended in production');
    }

    if (!config.nextjs.publicAppUrl) {
      errors.push('NEXT_PUBLIC_APP_URL is required in production');
    }

    if (errors.length > 0) {
      console.warn('Production configuration warnings:\n', errors.join('\n'));
    }
  }
}

// Validate production config on module load (only warn, don't throw)
if (config.app.isProduction) {
  validateProductionConfig();
}

