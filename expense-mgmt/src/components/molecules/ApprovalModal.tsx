/**
 * ApprovalModal Component
 *
 * Modal for approving or rejecting expenses with optional comments.
 */

'use client';

import { useState, useEffect } from 'react';

import { Button, Textarea } from '@/components/atoms';
import { CloseIcon } from '@/components/atoms/Icon';

export interface ApprovalModalProps {
  /** Expense ID to approve/reject */
  expenseId: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when approval/rejection is successful */
  onSuccess?: () => void;
}

interface ApprovalResponse {
  success: boolean;
  data?: { expenseId: string };
  error?: {
    code: string;
    message: string;
  };
}

export function ApprovalModal({ expenseId, isOpen, onClose, onSuccess }: ApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setComments('');
      setError(null);
      setLoading(false);
      setLoadingAction(null);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleApprove = async () => {
    if (loading) return;

    setLoading(true);
    setLoadingAction('approve');
    setError(null);

    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: comments.trim() || undefined,
        }),
      });

      const result: ApprovalResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to approve expense');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve expense');
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (loading) return;

    if (!comments.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setLoading(true);
    setLoadingAction('reject');
    setError(null);

    try {
      const response = await fetch(`/api/expenses/${expenseId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: comments.trim(),
        }),
      });

      const result: ApprovalResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reject expense');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject expense');
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2
            id="approval-modal-title"
            className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Review Expense
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add comments and choose an action for this expense.
          </p>

          {/* Comments Field */}
          <div>
            <Textarea
              label="Comments"
              placeholder="Add any comments about your decision (required for rejection)..."
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                // Clear error when user starts typing
                if (error && e.target.value.trim()) {
                  setError(null);
                }
              }}
              error={error && error.includes('required') ? error : undefined}
              helperText="Comments are optional for approval but required for rejection."
              maxLength={5000}
              showCount
              rows={4}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleApprove}
              isLoading={loadingAction === 'approve'}
              disabled={loading}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleReject}
              isLoading={loadingAction === 'reject'}
              disabled={loading || !comments.trim()}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
