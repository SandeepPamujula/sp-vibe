/**
 * Expense DTOs
 *
 * Data transfer objects for expense CRUD and approval operations.
 */

import type { WorkflowType } from '../../../drizzle/schema';

/**
 * Create expense request payload
 */
export interface CreateExpenseDto {
  workflowType: WorkflowType;
  expenseDate: string; // ISO date string (YYYY-MM-DD)
  invoiceNumber?: string;
  vendorName: string;
  amount: number;
  natureOfExpense: string;
  glCodeId?: string;
  purpose?: string;
}

/**
 * Update expense request payload
 */
export interface UpdateExpenseDto {
  expenseDate?: string;
  invoiceNumber?: string;
  vendorName?: string;
  amount?: number;
  natureOfExpense?: string;
  glCodeId?: string | null;
  purpose?: string;
}

/**
 * Submit expense for approval
 */
export interface SubmitExpenseDto {
  expenseId: string;
}

/**
 * Approve expense request
 */
export interface ApproveExpenseDto {
  expenseId: string;
  comments?: string;
}

/**
 * Reject expense request
 */
export interface RejectExpenseDto {
  expenseId: string;
  comments: string; // Required for rejection
}

/**
 * Expense form data (client-side)
 */
export interface ExpenseFormData {
  workflowType: WorkflowType;
  expenseDate: Date;
  invoiceNumber: string;
  vendorName: string;
  amount: string; // String for form input
  natureOfExpense: string;
  glCodeId: string;
  purpose: string;
  attachments: File[];
}

/**
 * Bulk approve expenses
 */
export interface BulkApproveDto {
  expenseIds: string[];
  comments?: string;
}

/**
 * Bulk reject expenses
 */
export interface BulkRejectDto {
  expenseIds: string[];
  comments: string;
}

/**
 * Bulk action result
 */
export interface BulkActionResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}
