/**
 * Expense Entity Types
 *
 * Extended expense types with relations, summaries, and statistics.
 */

import type { ExpenseAttachmentSummary } from './attachment.entity';
import type { ExpenseHistoryEntry } from './audit.entity';
import type { Expense, ExpenseStatus, GlCode, User, WorkflowType } from './base.entity';
import type { ApprovalSummary, WorkflowStepSummary } from './workflow.entity';

/**
 * Workflow info for expense display
 */
export interface ExpenseWorkflowInfo {
  id: string;
  name: string;
  code: WorkflowType;
}

/**
 * Expense with all related data
 */
export interface ExpenseWithRelations extends Expense {
  submitter: Pick<User, 'id' | 'name' | 'email'>;
  approver?: Pick<User, 'id' | 'name' | 'email'> | null;
  glCode?: Pick<GlCode, 'id' | 'code' | 'description'> | null;
  workflow?: ExpenseWorkflowInfo | null;
  currentStep?: WorkflowStepSummary | null;
  approvals: ApprovalSummary[];
  attachments: ExpenseAttachmentSummary[];
  historyCount: number;
}

/**
 * Expense with full history
 */
export interface ExpenseWithHistory extends ExpenseWithRelations {
  history: ExpenseHistoryEntry[];
}

/**
 * Expense summary for list views
 */
export interface ExpenseSummary {
  id: string;
  expenseDate: string;
  vendorName: string;
  amount: string;
  natureOfExpense: string | null; // Nullable for drafts
  status: ExpenseStatus;
  workflowType: WorkflowType;
  submitterName: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dashboard statistics
 */
export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  pendingApproval: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  byStatus: Record<ExpenseStatus, number>;
  byWorkflowType: Record<WorkflowType, number>;
}
