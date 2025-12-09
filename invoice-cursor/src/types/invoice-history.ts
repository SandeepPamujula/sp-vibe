/**
 * Invoice History types
 * 
 * Defines a unified history system for invoice records that combines:
 * - Comments for communication between admin and accountant
 * - Audit trail entries for state transitions and changes
 * 
 * All history entries are stored in chronological order to show the complete
 * timeline of an invoice's lifecycle.
 * 
 * State transitions can be derived from entryType and the chronological order.
 */

import { UserRole } from './user';

/**
 * Types of history entries
 */
export enum InvoiceHistoryEntryType {
  /** Invoice was created/uploaded */
  CREATED = 'CREATED',
  /** Invoice was submitted for review (DRAFT → UNDER_REVIEW) */
  SUBMITTED = 'SUBMITTED',
  /** Invoice was approved (UNDER_REVIEW → APPROVED) */
  APPROVED = 'APPROVED',
  /** Invoice was rejected (UNDER_REVIEW → REJECTED) */
  REJECTED = 'REJECTED',
  /** Invoice was updated (field changes, file updates) */
  UPDATED = 'UPDATED',
  /** Invoice status changed from REJECTED to DRAFT (resubmission flow) */
  RESUBMITTED = 'RESUBMITTED',
  /** File(s) were added to the invoice */
  FILES_ADDED = 'FILES_ADDED',
  /** File(s) were removed from the invoice */
  FILES_REMOVED = 'FILES_REMOVED',
  /** Comment was added by admin or accountant */
  COMMENT = 'COMMENT',
}

/**
 * Unified history entry for invoice records
 * Combines comments and audit trail actions in a single chronological timeline
 * 
 * State transitions can be derived from:
 * - entryType: Indicates what happened (SUBMITTED, APPROVED, REJECTED, etc.)
 * - Chronological order: Previous entry shows the fromStatus
 * - entryType mapping: SUBMITTED (DRAFT→UNDER_REVIEW), APPROVED (UNDER_REVIEW→APPROVED), etc.
 */
export interface InvoiceHistoryEntry {
  /** Unique history entry identifier */
  historyId: string;
  /** Type of history entry (action or comment) */
  entryType: InvoiceHistoryEntryType;
  /** Timestamp when entry was created (ISO 8601 format) - used for chronological ordering */
  createdAt: string;
  /** Email of the user who created this entry */
  createdBy: string;
  /** Role of the user who created this entry */
  createdByRole: UserRole;
  /** Content/description for the entry.
   * For COMMENTS: The actual comment text
   * For ACTIONS: Human-readable description (e.g., "Rejected: Missing receipt documentation")
   */
  content?: string;
  /** Optional: ID of the parent history entry if this is a reply (for threaded conversations) */
  parentHistoryId?: string;
  /** Optional: Timestamp when entry was edited (ISO 8601 format) */
  editedAt?: string;
}

