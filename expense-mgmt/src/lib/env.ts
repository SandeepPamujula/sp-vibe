/**
 * Environment Variables Schema
 *
 * Zod validation for all environment variables.
 * This module validates env vars at build/startup time.
 */

import { z } from 'zod';

/**
 * Server-side environment variables schema
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection URL')
    .startsWith('postgresql://', 'DATABASE_URL must use postgresql:// protocol'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // AWS Configuration (optional in development)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // S3 Configuration (optional in development)
  S3_BUCKET: z.string().optional(),

  // SES Configuration (optional in development)
  SES_FROM_EMAIL: z.string().email().optional(),
});

/**
 * Client-side environment variables schema (exposed to browser)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .default('http://localhost:3000'),
});

/**
 * Combined environment schema
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema);

/**
 * Type for validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 *
 * @throws {ZodError} If validation fails
 * @returns Validated environment variables
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    const errors = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const messages = (value as { _errors?: string[] })?._errors?.join(', ') ?? 'Invalid';
        return `  ${key}: ${messages}`;
      })
      .join('\n');

    throw new Error(
      `❌ Invalid environment variables:\n${errors}\n\n` +
        'Please check your .env.local file or environment configuration.'
    );
  }

  return parsed.data;
}

/**
 * Validated environment variables
 *
 * Access this instead of process.env directly for type safety.
 *
 * @example
 * import { env } from '@/lib/env';
 * const dbUrl = env.DATABASE_URL; // Type-safe access
 */
export const env = validateEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';
