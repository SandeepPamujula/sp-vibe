/**
 * PendingApprovalsList Component
 *
 * Displays a list of pending expenses for approval with pagination.
 */

'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { Badge, Button, Spinner } from '@/components/atoms';
import { ApprovalModal } from '@/components/molecules';
import { PAGINATION_DEFAULTS } from '@/constants/query.constants';
import type { ExpenseSummary } from '@/types/entities';

interface PendingApprovalsListResponse {
  success: boolean;
  data: ExpenseSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

const STATUS_BADGE_VARIANTS: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
> = {
  submitted: 'info',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Pending Approval',
};

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
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

export function PendingApprovalsList() {
  const [expenses, setExpenses] = useState<ExpenseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const fetchPendingApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', PAGINATION_DEFAULTS.LIMIT.toString());

      const response = await fetch(`/api/approvals/pending?${params.toString()}`);
      const data: PendingApprovalsListResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch pending approvals');
      }

      setExpenses(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending approvals');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          <span className="font-medium">Error:</span> {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Summary */}
      <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        {total === 0 ? (
          <span>No pending approvals</span>
        ) : (
          <span>
            Showing {expenses.length} of {total} pending approval{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">No pending approvals.</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
            All expenses have been reviewed or there are no expenses awaiting approval.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Nature of Expense
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {formatDate(expense.expenseDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {expense.vendorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {expense.natureOfExpense || (
                          <span className="text-zinc-400 dark:text-zinc-500 italic">
                            Not specified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={STATUS_BADGE_VARIANTS[expense.status] || 'default'}>
                          {STATUS_LABELS[expense.status] || expense.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {expense.submitterName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedExpenseId(expense.id);
                              setIsApprovalModalOpen(true);
                            }}
                          >
                            Approve/Reject
                          </Button>
                          <Link
                            href={`/expenses/${expense.id}`}
                            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Approval Modal */}
      {selectedExpenseId && (
        <ApprovalModal
          expenseId={selectedExpenseId}
          isOpen={isApprovalModalOpen}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setSelectedExpenseId(null);
          }}
          onSuccess={() => {
            // Refresh the list after approval/rejection
            fetchPendingApprovals();
          }}
        />
      )}
    </div>
  );
}
