/**
 * Expense Validation Schemas
 *
 * Zod schemas for expense CRUD and approval operations.
 */

import { z } from 'zod';

// ============================================================================
// Enum Schemas
// ============================================================================

/**
 * Workflow type enum schema
 */
export const workflowTypeSchema = z.enum(['petty', 'internet']);

/**
 * Expense status enum schema
 */
export const expenseStatusSchema = z.enum(['draft', 'submitted', 'approved', 'rejected']);

/**
 * Expense action enum schema
 */
export const expenseActionSchema = z.enum([
  'created',
  'submitted',
  'approved',
  'rejected',
  'updated',
]);

/**
 * Approval status enum schema
 */
export const approvalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'skipped']);

// ============================================================================
// Create & Update Schemas
// ============================================================================

/**
 * Schema for creating a new expense
 */
export const createExpenseSchema = z.object({
  workflowType: workflowTypeSchema.default('petty'),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  invoiceNumber: z.string().max(100, 'Invoice number must be less than 100 characters').optional(),
  vendorName: z
    .string()
    .min(1, 'Vendor name is required')
    .max(255, 'Vendor name must be less than 255 characters'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount exceeds maximum'),
  natureOfExpense: z
    .string()
    .min(1, 'Nature of expense is required')
    .max(255, 'Nature of expense must be less than 255 characters'),
  glCodeId: z.string().uuid('Invalid GL Code ID').optional(),
  purpose: z.string().max(5000, 'Purpose must be less than 5000 characters').optional(),
});

/**
 * Schema for updating an existing expense
 */
export const updateExpenseSchema = z.object({
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
    .optional(),
  invoiceNumber: z
    .string()
    .max(100, 'Invoice number must be less than 100 characters')
    .nullable()
    .optional(),
  vendorName: z
    .string()
    .min(1, 'Vendor name is required')
    .max(255, 'Vendor name must be less than 255 characters')
    .optional(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount exceeds maximum')
    .optional(),
  natureOfExpense: z
    .string()
    .min(1, 'Nature of expense is required')
    .max(255, 'Nature of expense must be less than 255 characters')
    .optional(),
  glCodeId: z.string().uuid('Invalid GL Code ID').nullable().optional(),
  purpose: z.string().max(5000, 'Purpose must be less than 5000 characters').nullable().optional(),
});

// ============================================================================
// Action Schemas
// ============================================================================

/**
 * Schema for expense ID parameter
 */
export const expenseIdSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID'),
});

/**
 * Schema for submitting an expense
 */
export const submitExpenseSchema = expenseIdSchema;

/**
 * Schema for approving an expense
 */
export const approveExpenseSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID'),
  comments: z.string().max(5000, 'Comments must be less than 5000 characters').optional(),
});

/**
 * Schema for rejecting an expense
 */
export const rejectExpenseSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID'),
  comments: z
    .string()
    .min(1, 'Rejection reason is required')
    .max(5000, 'Comments must be less than 5000 characters'),
});

// ============================================================================
// Bulk Action Schemas
// ============================================================================

/**
 * Schema for bulk approving expenses
 */
export const bulkApproveSchema = z.object({
  expenseIds: z
    .array(z.string().uuid('Invalid expense ID'))
    .min(1, 'At least one expense ID is required')
    .max(50, 'Cannot process more than 50 expenses at once'),
  comments: z.string().max(5000, 'Comments must be less than 5000 characters').optional(),
});

/**
 * Schema for bulk rejecting expenses
 */
export const bulkRejectSchema = z.object({
  expenseIds: z
    .array(z.string().uuid('Invalid expense ID'))
    .min(1, 'At least one expense ID is required')
    .max(50, 'Cannot process more than 50 expenses at once'),
  comments: z
    .string()
    .min(1, 'Rejection reason is required')
    .max(5000, 'Comments must be less than 5000 characters'),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;
export type RejectExpenseInput = z.infer<typeof rejectExpenseSchema>;
export type BulkApproveInput = z.infer<typeof bulkApproveSchema>;
export type BulkRejectInput = z.infer<typeof bulkRejectSchema>;
export type ApprovalStatusInput = z.infer<typeof approvalStatusSchema>;
