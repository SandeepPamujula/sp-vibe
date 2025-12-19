/**
 * Attachment Validation Schemas
 *
 * Zod schemas for file upload operations.
 */

import { z } from 'zod';

import { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS } from '@/constants';

// ============================================================================
// File Upload Schemas
// ============================================================================

/**
 * Schema for file metadata validation
 */
export const fileMetadataSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters'),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    message: 'File type must be PDF, PNG, JPEG, or HEIC',
  }),
  fileSize: z
    .number()
    .int('File size must be an integer')
    .positive('File size must be positive')
    .max(FILE_SIZE_LIMITS.MAX_SIZE, `File size must be less than 10 MB`),
});

/**
 * Schema for upload attachment request
 */
export const uploadAttachmentSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID'),
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters'),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    message: 'File type must be PDF, PNG, JPEG, or HEIC',
  }),
  fileSize: z
    .number()
    .int('File size must be an integer')
    .positive('File size must be positive')
    .max(FILE_SIZE_LIMITS.MAX_SIZE, `File size must be less than 10 MB`),
});

/**
 * Schema for delete attachment request
 */
export const deleteAttachmentSchema = z.object({
  attachmentId: z.string().uuid('Invalid attachment ID'),
});

/**
 * Schema for validating multiple file uploads
 */
export const multipleFilesSchema = z
  .array(fileMetadataSchema)
  .max(FILE_SIZE_LIMITS.MAX_FILES, `Cannot upload more than ${FILE_SIZE_LIMITS.MAX_FILES} files`);

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type FileMetadataInput = z.infer<typeof fileMetadataSchema>;
export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;
export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>;
