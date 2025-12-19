/**
 * Audit Entity Types
 *
 * Types for expense history and audit trail.
 */

import type { Expense, ExpenseAction, ExpenseHistory, User } from './base.entity';

/**
 * Change record stored in expense history
 */
export interface ExpenseChangeRecord {
  field: keyof Expense;
  oldValue: string | number | null;
  newValue: string | number | null;
}

/**
 * Expense history entry with user info
 */
export interface ExpenseHistoryEntry extends ExpenseHistory {
  user: Pick<User, 'id' | 'name' | 'email'>;
}

/**
 * Audit trail entry for display
 */
export interface AuditTrailEntry {
  id: string;
  expenseId: string;
  action: ExpenseAction;
  userName: string;
  userEmail: string;
  comments?: string | null;
  changes?: ExpenseChangeRecord[] | null;
  createdAt: Date;
}
