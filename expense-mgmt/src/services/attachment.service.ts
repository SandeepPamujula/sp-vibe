/**
 * Attachment Service
 *
 * Business logic for managing expense attachments.
 * Handles database operations and storage coordination.
 */

import { eq, and } from 'drizzle-orm';

import { FILE_SIZE_LIMITS } from '@/constants';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';
import type { PresignedUrlResult, DownloadUrlResult } from '@/lib/storage';
import type { ExpenseAttachmentSummary, ExpenseAttachmentWithUrl } from '@/types/entities';

import { expenseAttachments, expenses } from '../../drizzle/schema';

// ============================================================================
// Types
// ============================================================================

export interface CreateAttachmentParams {
  expenseId: string;
  fileName: string;
  s3Key: string;
  contentType: string;
  fileSize: number;
}

export interface AttachmentUploadRequest {
  tenantId: string;
  expenseId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface UploadUrlResponse extends PresignedUrlResult {
  /** Temporary attachment ID (for confirmation) */
  pendingId: string;
}

// ============================================================================
// Attachment Service
// ============================================================================

/**
 * Get count of existing attachments for an expense
 */
export async function getAttachmentCount(expenseId: string): Promise<number> {
  const result = await db
    .select()
    .from(expenseAttachments)
    .where(eq(expenseAttachments.expenseId, expenseId));

  return result.length;
}

/**
 * Validate that expense exists and belongs to tenant
 */
export async function validateExpenseOwnership(
  expenseId: string,
  tenantId: string
): Promise<boolean> {
  const result = await db
    .select({ id: expenses.id })
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.tenantId, tenantId)))
    .limit(1);

  return result.length > 0;
}

/**
 * Request a presigned URL for file upload
 *
 * Validates:
 * - Expense exists and belongs to tenant
 * - Maximum file count not exceeded
 *
 * Returns presigned URL and pending attachment ID
 */
export async function requestUploadUrl(
  params: AttachmentUploadRequest
): Promise<UploadUrlResponse> {
  const { tenantId, expenseId, fileName, contentType, fileSize } = params;

  // Validate expense ownership
  const isOwned = await validateExpenseOwnership(expenseId, tenantId);
  if (!isOwned) {
    throw new Error('Expense not found or access denied');
  }

  // Check attachment count
  const currentCount = await getAttachmentCount(expenseId);
  if (currentCount >= FILE_SIZE_LIMITS.MAX_FILES) {
    throw new Error(`Maximum ${FILE_SIZE_LIMITS.MAX_FILES} attachments allowed per expense`);
  }

  // Get presigned URL from storage service
  const uploadResult = await storage.getUploadUrl({
    tenantId,
    expenseId,
    fileName,
    contentType,
    fileSize,
  });

  // Generate a pending ID (used to confirm upload)
  const pendingId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    ...uploadResult,
    pendingId,
  };
}

/**
 * Confirm file upload and create attachment record
 *
 * Called after client successfully uploads file to presigned URL
 */
export async function confirmUpload(
  params: CreateAttachmentParams
): Promise<ExpenseAttachmentSummary> {
  const { expenseId, fileName, s3Key, contentType, fileSize } = params;

  const result = await db
    .insert(expenseAttachments)
    .values({
      expenseId,
      fileName,
      s3Key,
      contentType,
      fileSize,
    })
    .returning();

  const attachment = result[0];
  if (!attachment) {
    throw new Error('Failed to create attachment record');
  }

  return {
    id: attachment.id,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    fileSize: attachment.fileSize,
    uploadedAt: attachment.uploadedAt,
  };
}

/**
 * Get all attachments for an expense
 */
export async function getExpenseAttachments(
  expenseId: string
): Promise<ExpenseAttachmentSummary[]> {
  const attachments = await db
    .select()
    .from(expenseAttachments)
    .where(eq(expenseAttachments.expenseId, expenseId))
    .orderBy(expenseAttachments.uploadedAt);

  return attachments.map((a) => ({
    id: a.id,
    fileName: a.fileName,
    contentType: a.contentType,
    fileSize: a.fileSize,
    uploadedAt: a.uploadedAt,
  }));
}

/**
 * Get attachment with download URL
 */
export async function getAttachmentWithUrl(
  attachmentId: string,
  tenantId: string
): Promise<ExpenseAttachmentWithUrl | null> {
  // Get attachment with expense to verify tenant
  const result = await db
    .select({
      attachment: expenseAttachments,
      expenseTenantId: expenses.tenantId,
    })
    .from(expenseAttachments)
    .innerJoin(expenses, eq(expenses.id, expenseAttachments.expenseId))
    .where(eq(expenseAttachments.id, attachmentId))
    .limit(1);

  const row = result[0];
  if (!row) {
    return null;
  }

  const { attachment, expenseTenantId } = row;

  // Verify tenant access
  if (expenseTenantId !== tenantId) {
    return null;
  }

  // Get download URL
  const { downloadUrl, expiresAt } = await storage.getDownloadUrl(attachment.s3Key);

  return {
    id: attachment.id,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    fileSize: attachment.fileSize,
    uploadedAt: attachment.uploadedAt,
    downloadUrl,
    expiresAt,
  };
}

/**
 * Get download URL for an attachment
 */
export async function getDownloadUrl(
  attachmentId: string,
  tenantId: string
): Promise<DownloadUrlResult | null> {
  // Get attachment with expense to verify tenant
  const result = await db
    .select({
      s3Key: expenseAttachments.s3Key,
      expenseTenantId: expenses.tenantId,
    })
    .from(expenseAttachments)
    .innerJoin(expenses, eq(expenses.id, expenseAttachments.expenseId))
    .where(eq(expenseAttachments.id, attachmentId))
    .limit(1);

  const row = result[0];
  if (!row) {
    return null;
  }

  const { s3Key, expenseTenantId } = row;

  // Verify tenant access
  if (expenseTenantId !== tenantId) {
    return null;
  }

  return storage.getDownloadUrl(s3Key);
}

/**
 * Delete an attachment
 *
 * Removes from both storage and database
 */
export async function deleteAttachment(attachmentId: string, tenantId: string): Promise<boolean> {
  // Get attachment with expense to verify tenant
  const result = await db
    .select({
      attachment: expenseAttachments,
      expenseTenantId: expenses.tenantId,
      expenseStatus: expenses.status,
    })
    .from(expenseAttachments)
    .innerJoin(expenses, eq(expenses.id, expenseAttachments.expenseId))
    .where(eq(expenseAttachments.id, attachmentId))
    .limit(1);

  const row = result[0];
  if (!row) {
    return false;
  }

  const { attachment, expenseTenantId, expenseStatus } = row;

  // Verify tenant access
  if (expenseTenantId !== tenantId) {
    return false;
  }

  // Only allow deletion for draft expenses
  if (expenseStatus !== 'draft') {
    throw new Error('Cannot delete attachments from submitted expenses');
  }

  // Delete from storage
  await storage.deleteFile(attachment.s3Key);

  // Delete from database
  await db.delete(expenseAttachments).where(eq(expenseAttachments.id, attachmentId));

  return true;
}
