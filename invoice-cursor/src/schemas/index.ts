/**
 * Validation Schemas
 * 
 * Central export point for all Zod validation schemas.
 * Import from this file for convenience, or import directly from specific files
 * for better tree-shaking.
 * 
 * @example
 * ```typescript
 * // Convenient import (all schemas)
 * import { createInvoiceSchema, addCommentSchema } from '@/schemas';
 * 
 * // Direct import (better for tree-shaking)
 * import { createInvoiceSchema } from '@/schemas/invoice.schema';
 * ```
 */

// User schemas
export {
  userRoleSchema,
  userSchema,
  createUserSchema,
  updateUserSchema,
  loginSchema,
} from './user.schema';

// Invoice schemas
export {
  invoiceStatusSchema,
  invoiceFileMetadataSchema,
  invoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  submitInvoiceSchema,
  approveInvoiceSchema,
  rejectInvoiceSchema,
  queryInvoicesSchema,
  fileUploadSchema,
} from './invoice.schema';

// Invoice History schemas
export {
  invoiceHistoryEntryTypeSchema,
  invoiceHistoryEntrySchema,
  addCommentSchema,
  replyToCommentSchema,
  updateCommentSchema,
} from './invoice-history.schema';

// Response schemas
export { apiResponseSchema, errorResponseSchema, successResponseSchema } from './response.schema';

