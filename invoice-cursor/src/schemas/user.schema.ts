/**
 * User validation schemas
 * 
 * Zod schemas for validating user-related data.
 */

import { z } from 'zod';
import { UserRole } from '@/types/user';

/**
 * User role enum schema
 */
export const userRoleSchema = z.nativeEnum(UserRole);

/**
 * User schema for validation
 */
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: userRoleSchema,
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  createdAt: z.string().datetime('Invalid ISO 8601 datetime format'),
  lastLogin: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
});

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: userRoleSchema,
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
});

/**
 * Schema for updating user information
 */
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters').optional(),
  role: userRoleSchema.optional(),
  lastLogin: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
});

/**
 * Schema for user login/authentication input
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

