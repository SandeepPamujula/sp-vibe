/**
 * ExpenseDetail Component
 *
 * Displays detailed information about an expense including all relations.
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Badge, Button, Spinner } from '@/components/atoms';
import { ExpenseAuditTrail } from '@/components/molecules';
import type { ExpenseWithRelations } from '@/types/entities';

export interface ExpenseDetailProps {
  /** Expense ID to fetch and display */
  expenseId: string;
}

interface ExpenseDetailResponse {
  success: boolean;
  data: ExpenseWithRelations;
  error?: {
    code: string;
    message: string;
  };
}

const STATUS_BADGE_VARIANTS: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
> = {
  draft: 'default',
  submitted: 'info',
  approved: 'success',
  rejected: 'danger',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  skipped: 'Skipped',
};

const APPROVAL_STATUS_VARIANTS: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  skipped: 'default',
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function getAttachmentDownloadUrl(attachmentId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/attachments/${attachmentId}`);
    const result: {
      success: boolean;
      data?: { downloadUrl: string };
      error?: { message: string };
    } = await response.json();

    if (result.success && result.data) {
      return result.data.downloadUrl;
    }
    return null;
  } catch (error) {
    console.error('Failed to get attachment download URL:', error);
    return null;
  }
}

export function ExpenseDetail({ expenseId }: ExpenseDetailProps) {
  const [expense, setExpense] = useState<ExpenseWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingAttachment, setDownloadingAttachment] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpense() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/expenses/${expenseId}`);
        const result: ExpenseDetailResponse = await response.json();

        if (!result.success) {
          setError(result.error?.message || 'Failed to load expense');
          return;
        }

        setExpense(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expense');
      } finally {
        setLoading(false);
      }
    }

    fetchExpense();
  }, [expenseId]);

  const handleDownloadAttachment = async (attachmentId: string) => {
    try {
      setDownloadingAttachment(attachmentId);
      const downloadUrl = await getAttachmentDownloadUrl(attachmentId);

      if (downloadUrl) {
        // Check if it's a local development URL
        if (downloadUrl.startsWith('/api/attachments/download-local')) {
          window.open(downloadUrl, '_blank');
        } else {
          // For S3 presigned URLs, open in new tab
          window.open(downloadUrl, '_blank');
        }
      } else {
        alert('Failed to get download URL');
      }
    } catch (err) {
      console.error('Failed to download attachment:', err);
      alert('Failed to download attachment');
    } finally {
      setDownloadingAttachment(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-medium">Error:</span> {error || 'Expense not found'}
          </p>
        </div>
        <Link href="/expenses">
          <Button variant="secondary">Back to Expenses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/expenses">
            <Button variant="ghost" size="sm" leftIcon={<span>←</span>}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Expense Details</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Expense ID: {expense.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Badge variant={STATUS_BADGE_VARIANTS[expense.status] || 'default'} size="md">
          {STATUS_LABELS[expense.status] || expense.status}
        </Badge>
      </div>

      {/* Expense Details Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Expense Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Expense Date
            </label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {formatDate(expense.expenseDate)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Vendor Name
            </label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{expense.vendorName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(expense.amount)}
            </p>
          </div>

          {expense.invoiceNumber && (
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Invoice Number
              </label>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {expense.invoiceNumber}
              </p>
            </div>
          )}

          {expense.glCode && (
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nature of Expense
              </label>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {expense.glCode.code} - {expense.glCode.description}
              </p>
            </div>
          )}

          {expense.workflow && (
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Workflow Type
              </label>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {expense.workflow.name}
              </p>
            </div>
          )}
        </div>

        {expense.purpose && (
          <div className="mt-6">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Purpose</label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
              {expense.purpose}
            </p>
          </div>
        )}
      </div>

      {/* People Section */}
      {expense.submitter && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">People</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Submitted By
              </label>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                {expense.submitter.name}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{expense.submitter.email}</p>
            </div>

            {expense.approver && (
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Approved By
                </label>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                  {expense.approver.name}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{expense.approver.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approvals Section */}
      {expense.approvals.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Approval History
          </h2>
          <div className="space-y-4">
            {expense.approvals.map((approval) => (
              <div
                key={approval.id}
                className="border-l-4 border-zinc-200 dark:border-zinc-700 pl-4 py-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {approval.stepName}
                    </p>
                    {approval.approverName && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        Approver: {approval.approverName}
                      </p>
                    )}
                    {approval.comments && (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
                        {approval.comments}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={APPROVAL_STATUS_VARIANTS[approval.status] || 'default'}
                      size="sm"
                    >
                      {APPROVAL_STATUS_LABELS[approval.status] || approval.status}
                    </Badge>
                    {approval.actedAt && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {formatDateTime(approval.actedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments Section */}
      {expense.attachments.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Attachments
          </h2>
          <div className="space-y-2">
            {expense.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {attachment.fileName}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Uploaded: {formatDate(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadAttachment(attachment.id)}
                  isLoading={downloadingAttachment === attachment.id}
                  disabled={downloadingAttachment !== null}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail Section */}
      {expense.historyCount > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Audit Trail
          </h2>
          <ExpenseAuditTrail expenseId={expense.id} />
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-zinc-500 dark:text-zinc-500 space-y-1">
        <p>Created: {formatDateTime(expense.createdAt)}</p>
        <p>Last Updated: {formatDateTime(expense.updatedAt)}</p>
        {expense.historyCount > 0 && <p>History Entries: {expense.historyCount}</p>}
      </div>
    </div>
  );
}
