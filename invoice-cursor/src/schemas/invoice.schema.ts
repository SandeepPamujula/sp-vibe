/**
 * Invoice validation schemas
 * 
 * Zod schemas for validating invoice-related data.
 */

import { z } from 'zod';
import { InvoiceStatus } from '@/types/invoice';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES_DESCRIPTION } from '@/constants/file.constants';

/**
 * Invoice status enum schema
 */
export const invoiceStatusSchema = z.nativeEnum(InvoiceStatus);

/**
 * Invoice file metadata schema
 */
export const invoiceFileMetadataSchema = z.object({
  s3FileKey: z.string().min(1, 'S3 file key is required'),
  fileName: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
  fileSize: z.number().int().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  uploadedAt: z.string().datetime('Invalid ISO 8601 datetime format'),
});

/**
 * Full invoice schema for validation
 */
export const invoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  createdAt: z.string().datetime('Invalid ISO 8601 datetime format'),
  vendorName: z.string().min(1, 'Vendor name is required').max(255, 'Vendor name must be less than 255 characters'),
  amount: z.number().nonnegative('Amount must be non-negative'),
  status: invoiceStatusSchema,
  files: z.array(invoiceFileMetadataSchema).optional(),
  description: z.string().max(10000, 'Description must be less than 10000 characters').optional(),
  invoiceDate: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
  history: z.array(z.any()).optional(), // History validated separately
});

/**
 * Schema for creating a new invoice
 */
export const createInvoiceSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required').max(255, 'Vendor name must be less than 255 characters'),
  amount: z.number().nonnegative('Amount must be non-negative'),
  description: z.string().max(10000, 'Description must be less than 10000 characters').optional(),
  invoiceDate: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
});

/**
 * Schema for updating invoice details
 */
export const updateInvoiceSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required').max(255, 'Vendor name must be less than 255 characters').optional(),
  amount: z.number().nonnegative('Amount must be non-negative').optional(),
  description: z.string().max(10000, 'Description must be less than 10000 characters').optional(),
  invoiceDate: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
});

/**
 * Schema for submitting invoice (DRAFT → UNDER_REVIEW)
 */
export const submitInvoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
});

/**
 * Schema for approving invoice (UNDER_REVIEW → APPROVED)
 */
export const approveInvoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
});

/**
 * Schema for rejecting invoice (UNDER_REVIEW → REJECTED)
 */
export const rejectInvoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  rejectionReason: z.string().min(1, 'Rejection reason is required').max(5000, 'Rejection reason must be less than 5000 characters'),
});

/**
 * Schema for querying/searching invoices
 */
export const queryInvoicesSchema = z.object({
  status: invoiceStatusSchema.optional(),
  vendorName: z.string().optional(),
  invoiceId: z.string().optional(),
  submittedBy: z.string().email('Invalid email address').optional(),
  approvedBy: z.string().email('Invalid email address').optional(),
  startDate: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
  endDate: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
  limit: z.number().int().positive().max(100).optional(),
  lastEvaluatedKey: z.string().optional(),
});

/**
 * Schema for file upload validation
 * Used for validating file metadata before upload
 */
export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
  fileSize: z.number().int().positive('File size must be positive').max(MAX_FILE_SIZE_BYTES, `File size must be less than ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    message: `File type must be ${ALLOWED_FILE_TYPES_DESCRIPTION}`,
  }),
});

