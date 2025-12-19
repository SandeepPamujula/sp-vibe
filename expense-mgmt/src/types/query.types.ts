/**
 * Query & Filter Types
 *
 * Types for API queries, filtering, sorting, and pagination.
 */

import type { ExpenseStatus, WorkflowType } from '../../drizzle/schema';

// ============================================================================
// Pagination
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort parameter
 */
export interface SortParams<T extends string = string> {
  sortBy?: T;
  sortOrder?: SortDirection;
}

// ============================================================================
// Expense Filters
// ============================================================================

/**
 * Sortable expense fields
 */
export type ExpenseSortField =
  | 'expenseDate'
  | 'amount'
  | 'vendorName'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

/**
 * Expense list query parameters
 */
export interface ExpenseListQuery extends PaginationParams, SortParams<ExpenseSortField> {
  // Status filters
  status?: ExpenseStatus | ExpenseStatus[];

  // Workflow type filter
  workflowType?: WorkflowType;

  // Date range filters
  startDate?: string;
  endDate?: string;

  // Text search
  search?: string;

  // GL Code filter
  glCodeId?: string;

  // User filters (for approvers)
  submittedBy?: string;

  // Show only my expenses
  myExpenses?: boolean;
}

/**
 * Expense filter state (for UI)
 */
export interface ExpenseFilterState {
  status: ExpenseStatus[];
  workflowType: WorkflowType | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchTerm: string;
  glCodeId: string | null;
  submittedBy: string | null;
}

// ============================================================================
// User Filters
// ============================================================================

/**
 * User list query parameters
 */
export interface UserListQuery extends PaginationParams {
  role?: string;
  isActive?: boolean;
  search?: string;
}

// ============================================================================
// GL Code Filters
// ============================================================================

/**
 * GL Code list query parameters
 */
export interface GlCodeListQuery extends PaginationParams {
  isActive?: boolean;
  search?: string;
}

// ============================================================================
// History Filters
// ============================================================================

/**
 * Expense history query parameters
 */
export interface ExpenseHistoryQuery extends PaginationParams {
  expenseId: string;
}

/**
 * Audit trail query parameters
 */
export interface AuditTrailQuery extends PaginationParams, SortParams<'createdAt'> {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
}

// ============================================================================
// Report Filters
// ============================================================================

/**
 * Report query parameters
 */
export interface ReportQuery {
  startDate: string;
  endDate: string;
  workflowType?: WorkflowType;
  status?: ExpenseStatus[];
  submittedBy?: string;
  glCodeId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'glCode' | 'submitter';
}

// ============================================================================
// Search
// ============================================================================

/**
 * Global search query
 */
export interface SearchQuery {
  q: string;
  type?: 'expense' | 'user' | 'all';
  limit?: number;
}

/**
 * Search result item
 */
export interface SearchResult {
  type: 'expense' | 'user';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

// ============================================================================
// Query Builder Helpers
// ============================================================================

/**
 * Parsed query with validated pagination
 */
export interface ParsedQuery<T> {
  filters: T;
  pagination: Required<PaginationParams>;
  sort: Required<SortParams>;
}
