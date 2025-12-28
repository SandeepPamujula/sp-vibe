/**
 * ExpenseAuditTrail Component
 *
 * Displays audit trail/history for an expense.
 */

'use client';

import { useState, useEffect } from 'react';

import { Badge, Spinner } from '@/components/atoms';
import type { ExpenseHistoryEntry } from '@/types/entities';

export interface ExpenseAuditTrailProps {
  /** Expense ID to fetch history for */
  expenseId: string;
}

interface ExpenseHistoryResponse {
  success: boolean;
  data: ExpenseHistoryEntry[];
  error?: {
    code: string;
    message: string;
  };
}

const ACTION_LABELS: Record<string, string> = {
  created: 'Created',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  updated: 'Updated',
};

const ACTION_VARIANTS: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
> = {
  created: 'info',
  submitted: 'info',
  approved: 'success',
  rejected: 'danger',
  updated: 'default',
};

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

function formatChanges(changes: unknown): string | null {
  if (!changes || typeof changes !== 'object') {
    return null;
  }

  const changeObj = changes as Record<string, unknown>;
  const changeEntries: string[] = [];

  for (const [key, value] of Object.entries(changeObj)) {
    if (value && typeof value === 'object') {
      const changeValue = value as { from?: unknown; to?: unknown };
      if ('from' in changeValue && 'to' in changeValue) {
        const fromStr = changeValue.from === null ? 'null' : String(changeValue.from);
        const toStr = changeValue.to === null ? 'null' : String(changeValue.to);
        changeEntries.push(`${key}: ${fromStr} → ${toStr}`);
      } else {
        changeEntries.push(`${key}: ${JSON.stringify(value)}`);
      }
    } else {
      changeEntries.push(`${key}: ${value === null ? 'null' : String(value)}`);
    }
  }

  return changeEntries.length > 0 ? changeEntries.join(', ') : null;
}

export function ExpenseAuditTrail({ expenseId }: ExpenseAuditTrailProps) {
  const [history, setHistory] = useState<ExpenseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/expenses/${expenseId}/history`);
        const result: ExpenseHistoryResponse = await response.json();

        if (!result.success) {
          setError(result.error?.message || 'Failed to load audit trail');
          return;
        }

        // Ensure data is always an array
        setHistory(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit trail');
        setHistory([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [expenseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-700 dark:text-red-300">
          <span className="font-medium">Error:</span> {error}
        </p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No audit trail entries found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => {
        const changesText = formatChanges(entry.changes);
        const isLast = index === history.length - 1;

        return (
          <div
            key={entry.id}
            className={`relative flex gap-4 pb-4 ${
              !isLast ? 'border-b border-zinc-200 dark:border-zinc-700' : ''
            }`}
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  ACTION_VARIANTS[entry.action] === 'success'
                    ? 'bg-green-500 border-green-500'
                    : ACTION_VARIANTS[entry.action] === 'danger'
                      ? 'bg-red-500 border-red-500'
                      : ACTION_VARIANTS[entry.action] === 'info'
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-zinc-400 border-zinc-400'
                }`}
              />
              {!isLast && <div className="w-0.5 h-full bg-zinc-200 dark:bg-zinc-700 mt-1" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={ACTION_VARIANTS[entry.action] || 'default'} size="sm">
                      {ACTION_LABELS[entry.action] || entry.action}
                    </Badge>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.user.name}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{entry.user.email}</p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 whitespace-nowrap">
                  {formatDateTime(entry.createdAt)}
                </p>
              </div>

              {entry.comments && (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">{entry.comments}</p>
              )}

              {changesText && (
                <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                  {changesText}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
