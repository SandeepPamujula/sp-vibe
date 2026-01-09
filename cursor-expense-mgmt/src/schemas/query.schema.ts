/**
 * Query & Pagination Validation Schemas
 *
 * Zod schemas for API query parameters, filtering, sorting, and pagination.
 */

import { z } from 'zod';

import { PAGINATION_DEFAULTS } from '@/constants';

import { expenseStatusSchema, workflowTypeSchema } from './expense.schema';

// ============================================================================
// Pagination Schemas
// ============================================================================

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .positive('Page must be positive')
    .default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(PAGINATION_DEFAULTS.MAX_LIMIT, `Limit cannot exceed ${PAGINATION_DEFAULTS.MAX_LIMIT}`)
    .default(PAGINATION_DEFAULTS.LIMIT),
});

// ============================================================================
// Sorting Schemas
// ============================================================================

/**
 * Schema for sort direction
 */
export const sortDirectionSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Schema for expense sortable fields
 */
export const expenseSortFieldSchema = z.enum([
  'expenseDate',
  'amount',
  'vendorName',
  'status',
  'createdAt',
  'updatedAt',
]);

/**
 * Schema for expense sorting
 */
export const expenseSortSchema = z.object({
  sortBy: expenseSortFieldSchema.default('createdAt'),
  sortOrder: sortDirectionSchema,
});

// ============================================================================
// Date Range Schemas
// ============================================================================

/**
 * Schema for date range
 */
export const dateRangeSchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  );

// ============================================================================
// Expense Query Schemas
// ============================================================================

/**
 * Schema for expense list query parameters
 */
export const expenseListQuerySchema = z
  .object({
    // Pagination
    page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(PAGINATION_DEFAULTS.MAX_LIMIT)
      .default(PAGINATION_DEFAULTS.LIMIT),

    // Sorting
    sortBy: expenseSortFieldSchema.default('createdAt'),
    sortOrder: sortDirectionSchema,

    // Status filter (single or array)
    status: z
      .union([expenseStatusSchema, z.array(expenseStatusSchema)])
      .optional()
      .transform((val) => (val ? (Array.isArray(val) ? val : [val]) : undefined)),

    // Workflow type filter
    workflowType: workflowTypeSchema.optional(),

    // Date range
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),

    // Text search
    search: z.string().max(255, 'Search term too long').optional(),

    // GL Code filter
    glCodeId: z.string().uuid('Invalid GL Code ID').optional(),

    // User filter
    submittedBy: z.string().uuid('Invalid user ID').optional(),

    // Show only my expenses
    myExpenses: z.coerce.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  );

// ============================================================================
// User Query Schemas
// ============================================================================

/**
 * Schema for user list query parameters
 */
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
  role: z.enum(['admin', 'approver']).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(255, 'Search term too long').optional(),
});

// ============================================================================
// GL Code Query Schemas
// ============================================================================

/**
 * Schema for GL code list query parameters
 */
export const glCodeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(255, 'Search term too long').optional(),
});

// ============================================================================
// Audit Trail Query Schemas
// ============================================================================

/**
 * Schema for audit trail query parameters
 */
export const auditTrailQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(PAGINATION_DEFAULTS.PAGE),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(PAGINATION_DEFAULTS.MAX_LIMIT)
      .default(PAGINATION_DEFAULTS.LIMIT),
    sortOrder: sortDirectionSchema,
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    userId: z.string().uuid('Invalid user ID').optional(),
    action: z.enum(['created', 'submitted', 'approved', 'rejected', 'updated']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  );

// ============================================================================
// Search Schema
// ============================================================================

/**
 * Schema for global search query
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(2, 'Search term must be at least 2 characters')
    .max(255, 'Search term too long'),
  type: z.enum(['expense', 'user', 'all']).default('all'),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ExpenseListQueryInput = z.infer<typeof expenseListQuerySchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type GlCodeListQueryInput = z.infer<typeof glCodeListQuerySchema>;
export type AuditTrailQueryInput = z.infer<typeof auditTrailQuerySchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
