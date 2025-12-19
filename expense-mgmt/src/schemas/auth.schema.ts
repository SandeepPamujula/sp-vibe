/**
 * Authentication Validation Schemas
 *
 * Zod schemas for authentication operations.
 */

import { z } from 'zod';

// ============================================================================
// Login Schemas
// ============================================================================

/**
 * Schema for login request
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  tenantSlug: z
    .string()
    .min(1, 'Tenant slug is required')
    .max(100, 'Tenant slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Tenant slug must be lowercase alphanumeric with hyphens'),
});

/**
 * Schema for tenant slug parameter
 */
export const tenantSlugSchema = z.object({
  tenantSlug: z
    .string()
    .min(1, 'Tenant slug is required')
    .max(100, 'Tenant slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Tenant slug must be lowercase alphanumeric with hyphens'),
});

// ============================================================================
// User Profile Schemas
// ============================================================================

/**
 * Schema for user profile update
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .optional(),
});

// ============================================================================
// UUID Parameter Schema
// ============================================================================

/**
 * Schema for UUID path parameters
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type TenantSlugInput = z.infer<typeof tenantSlugSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
