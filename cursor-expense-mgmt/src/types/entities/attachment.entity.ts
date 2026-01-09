/**
 * Attachment Entity Types
 *
 * Attachment types for client-side display.
 */

/**
 * Expense attachment summary (without S3 key for client)
 */
export interface ExpenseAttachmentSummary {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: Date;
}

/**
 * Expense attachment with download URL
 */
export interface ExpenseAttachmentWithUrl extends ExpenseAttachmentSummary {
  downloadUrl: string;
  expiresAt: Date;
}
