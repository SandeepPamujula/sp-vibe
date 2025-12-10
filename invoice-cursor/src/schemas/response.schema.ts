/**
 * API Response validation schemas
 * 
 * Zod schemas for validating API response formats.
 */

import { z } from 'zod';

/**
 * Schema for standardized API response format
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        message: z.string(),
        code: z.string().optional(),
      })
      .optional(),
  });

/**
 * Schema for error response
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});

/**
 * Schema for success response
 */
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

