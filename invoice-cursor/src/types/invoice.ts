/**
 * Invoice model and related types
 * 
 * Defines the Invoice interface, InvoiceStatus enum, and InvoiceFileMetadata interface
 * for expense invoice processing. Maps to DynamoDB InvoicesTable.
 */

import { InvoiceHistoryEntry } from './invoice-history';

/**
 * Invoice status enum following the state machine
 */
export enum InvoiceStatus {
  /** Initial state when invoice is uploaded/created by Admin */
  DRAFT = 'DRAFT',
  /** Invoice is submitted and awaiting accountant review */
  UNDER_REVIEW = 'UNDER_REVIEW',
  /** Invoice has been approved by accountant (final state) */
  APPROVED = 'APPROVED',
  /** Invoice has been rejected by accountant (can be resubmitted) */
  REJECTED = 'REJECTED',
}

/**
 * Metadata for an uploaded invoice file
 */
export interface InvoiceFileMetadata {
  /** S3 file key for the uploaded invoice attachment */
  s3FileKey: string;
  /** Original filename of the uploaded file */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type of the file (e.g., 'application/pdf', 'image/png') */
  mimeType: string;
  /** Timestamp when file was uploaded (ISO 8601 format) */
  uploadedAt: string;
}

/**
 * Invoice model for expense invoice processing
 * Maps to DynamoDB InvoicesTable
 */
export interface Invoice {
  /** Unique invoice identifier - partition key */
  invoiceId: string;
  /** Timestamp when invoice was created (ISO 8601 format) - sort key */
  createdAt: string;
  /** Vendor/merchant name */
  vendorName: string;
  /** Invoice amount (in cents or as decimal) */
  amount: number;
  /** Current status of the invoice */
  status: InvoiceStatus;
  /** Array of file metadata objects containing S3 keys and file information */
  files?: InvoiceFileMetadata[];
  /** Invoice description/notes */
  description?: string;
  /** Date of the invoice (ISO 8601 format) */
  invoiceDate?: string;
  /** Unified history array containing both comments and audit trail entries (ordered chronologically).
   * 
   * All transactional information is derived from history:
   * - submittedBy: from SUBMITTED entry createdBy
   * - approvedBy: from APPROVED entry createdBy
   * - rejectionReason: from REJECTED entry content
   * - approvedAt: from APPROVED entry createdAt
   * - rejectedAt: from REJECTED entry createdAt
   * - resubmittedAt: from RESUBMITTED entry createdAt
   * 
   * State transitions are derived from entryType and chronological order.
   */
  history?: InvoiceHistoryEntry[];
}

