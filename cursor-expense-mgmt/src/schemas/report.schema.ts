/**
 * Report Validation Schemas
 *
 * Zod schemas for report generation.
 */

import { z } from 'zod';

import { expenseStatusSchema, workflowTypeSchema } from './expense.schema';

// ============================================================================
// Report Type Schemas
// ============================================================================

/**
 * Schema for report type
 */
export const reportTypeSchema = z.enum(['expense-summary', 'expense-detail', 'audit-trail']);

/**
 * Schema for report format
 */
export const reportFormatSchema = z.enum(['excel', 'pdf']);

/**
 * Schema for report group by
 */
export const reportGroupBySchema = z.enum(['day', 'week', 'month', 'glCode', 'submitter']);

// ============================================================================
// Report Generation Schemas
// ============================================================================

/**
 * Schema for generating a report
 */
export const generateReportSchema = z
  .object({
    reportType: reportTypeSchema,
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    workflowType: workflowTypeSchema.optional(),
    status: expenseStatusSchema.optional(),
    format: reportFormatSchema,
  })
  .refine(
    (data) => {
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    { message: 'Start date must be before or equal to end date' }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 365;
    },
    { message: 'Date range cannot exceed 1 year' }
  );

/**
 * Schema for report query parameters
 */
export const reportQuerySchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    workflowType: workflowTypeSchema.optional(),
    status: z.array(expenseStatusSchema).optional(),
    submittedBy: z.string().uuid('Invalid user ID').optional(),
    glCodeId: z.string().uuid('Invalid GL Code ID').optional(),
    groupBy: reportGroupBySchema.optional(),
  })
  .refine(
    (data) => {
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    { message: 'Start date must be before or equal to end date' }
  );

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
