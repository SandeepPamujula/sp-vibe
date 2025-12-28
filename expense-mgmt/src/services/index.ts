/**
 * Business logic services
 *
 * - attachment.service.ts: File attachment operations
 * - expense.service.ts: Expense CRUD operations
 * - approval.service.ts: Approval workflow logic
 * - report.service.ts: Report generation
 * - audit.service.ts: Audit trail logging
 */

// Attachment Service
export {
  requestUploadUrl,
  confirmUpload,
  getExpenseAttachments,
  getAttachmentWithUrl,
  getDownloadUrl,
  deleteAttachment,
  getAttachmentCount,
  validateExpenseOwnership,
} from './attachment.service';
export type {
  CreateAttachmentParams,
  AttachmentUploadRequest,
  UploadUrlResponse,
} from './attachment.service';

// Expense Service
export {
  createExpense,
  updateExpense,
  deleteExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  getExpenseById,
  getExpenses,
  getPendingExpensesForApproval,
  getGlCodes,
  getExpenseHistory,
} from './expense.service';
export type {
  CreateExpenseParams,
  UpdateExpenseParams,
  SubmitExpenseResult,
} from './expense.service';
