/**
 * Invoice History validation schemas
 * 
 * Zod schemas for validating invoice history entries and comments.
 */

import { z } from 'zod';
import { InvoiceHistoryEntryType } from '@/types/invoice-history';
import { UserRole } from '@/types/user';

/**
 * Invoice history entry type enum schema
 */
export const invoiceHistoryEntryTypeSchema = z.nativeEnum(InvoiceHistoryEntryType);

/**
 * User role enum schema (imported for history validation)
 */
export const userRoleSchema = z.nativeEnum(UserRole);

/**
 * Invoice history entry schema
 */
export const invoiceHistoryEntrySchema = z.object({
  historyId: z.string().min(1, 'History ID is required'),
  entryType: invoiceHistoryEntryTypeSchema,
  createdAt: z.string().datetime('Invalid ISO 8601 datetime format'),
  createdBy: z.string().email('Invalid email address'),
  createdByRole: userRoleSchema,
  content: z.string().max(10000, 'Content must be less than 10000 characters').optional(),
  parentHistoryId: z.string().min(1, 'Parent history ID is required').optional(),
  editedAt: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
});

/**
 * Schema for adding a comment to an invoice
 */
export const addCommentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  content: z.string().min(1, 'Comment content is required').max(10000, 'Comment must be less than 10000 characters'),
  parentHistoryId: z.string().min(1, 'Parent history ID is required').optional(),
});

/**
 * Schema for replying to a comment
 */
export const replyToCommentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  content: z.string().min(1, 'Reply content is required').max(10000, 'Reply must be less than 10000 characters'),
  parentHistoryId: z.string().min(1, 'Parent history ID is required'),
});

/**
 * Schema for updating a comment
 */
export const updateCommentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  historyId: z.string().min(1, 'History ID is required'),
  content: z.string().min(1, 'Comment content is required').max(10000, 'Comment must be less than 10000 characters'),
});

