/**
 * ExpenseHistoryTimeline Component
 *
 * Displays expense history in a visual timeline format with icons and enhanced styling.
 */

'use client';

import { useState, useEffect } from 'react';

import {
  Badge,
  Spinner,
  ClockIcon,
  XCircleIcon,
  DocumentPlusIcon,
  PaperAirplaneIcon,
  PencilIcon,
  CheckCircleIcon,
} from '@/components/atoms';
import type { ExpenseHistoryEntry } from '@/types/entities';

export interface ExpenseHistoryTimelineProps {
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

const ACTION_ICONS: Record<string, React.FC<{ className?: string }>> = {
  created: DocumentPlusIcon,
  submitted: PaperAirplaneIcon,
  approved: CheckCircleIcon,
  rejected: XCircleIcon,
  updated: PencilIcon,
};

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-blue-500 border-blue-500 text-blue-600 dark:text-blue-400',
  submitted: 'bg-blue-500 border-blue-500 text-blue-600 dark:text-blue-400',
  approved: 'bg-green-500 border-green-500 text-green-600 dark:text-green-400',
  rejected: 'bg-red-500 border-red-500 text-red-600 dark:text-red-400',
  updated: 'bg-zinc-500 border-zinc-500 text-zinc-600 dark:text-zinc-400',
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

function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  return formatDateTime(date);
}

export function ExpenseHistoryTimeline({ expenseId }: ExpenseHistoryTimelineProps) {
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
          setError(result.error?.message || 'Failed to load expense history');
          return;
        }

        // Ensure data is always an array
        setHistory(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expense history');
        setHistory([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [expenseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
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
      <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
        <ClockIcon className="w-8 h-8 mx-auto mb-2 text-zinc-400 dark:text-zinc-500" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          No history entries found
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
          History will appear here as actions are taken on this expense
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

      {/* Timeline items */}
      <div className="space-y-6">
        {history.map((entry, index) => {
          const ActionIcon = ACTION_ICONS[entry.action] || ClockIcon;
          const actionColor = ACTION_COLORS[entry.action] || ACTION_COLORS.updated;
          const isLast = index === history.length - 1;

          return (
            <div key={entry.id} className="relative flex gap-4">
              {/* Timeline dot with icon */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${actionColor} shadow-sm`}
                >
                  <ActionIcon className="w-5 h-5 text-white" />
                </div>
                {!isLast && (
                  <div className="absolute left-1/2 top-12 w-0.5 h-6 bg-zinc-200 dark:bg-zinc-700 transform -translate-x-1/2" />
                )}
              </div>

              {/* Content card */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={ACTION_VARIANTS[entry.action] || 'default'} size="sm">
                          {ACTION_LABELS[entry.action] || entry.action}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {entry.user.name}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">•</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          {entry.user.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {formatRelativeTime(entry.createdAt)}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 whitespace-nowrap">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Comments */}
                  {entry.comments && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {entry.comments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
