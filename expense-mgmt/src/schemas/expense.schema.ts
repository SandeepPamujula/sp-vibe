/**
 * Expense Validation Schemas
 *
 * Zod schemas for expense CRUD and approval operations.
 */

import { z } from 'zod';

// ============================================================================
// Custom Validators
// ============================================================================

/**
 * UUID format validator (less strict than Zod's .uuid())
 * Validates UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 * but doesn't enforce RFC 4122 version/variant requirements.
 * This allows seed data UUIDs like "c1111111-1111-1111-1111-111111111111"
 */
const uuidFormatSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Invalid UUID format'
  );

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
 *
 * Note: `natureOfExpense` is a GL Code ID. The backend will automatically
 * derive the expense description and map to the correct GL code.
 *
 * For draft expenses, only vendorName is required. Other fields can be
 * filled in later before submission.
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
  /** GL Code ID - maps internally to natureOfExpense and glCodeId. Optional for drafts. */
  natureOfExpense: z.preprocess(
    (val) => (val === '' ? undefined : val),
    uuidFormatSchema.optional()
  ),
  purpose: z.string().max(5000, 'Purpose must be less than 5000 characters').optional(),
});

/**
 * Schema for updating an existing expense
 *
 * Note: `natureOfExpense` is a GL Code ID. The backend will automatically
 * derive the expense description and map to the correct GL code.
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
  /** GL Code ID - maps internally to natureOfExpense and glCodeId */
  natureOfExpense: z.preprocess(
    (val) => (val === '' ? undefined : val),
    uuidFormatSchema.optional()
  ),
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
