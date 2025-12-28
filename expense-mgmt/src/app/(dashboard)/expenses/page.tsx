/**
 * Expenses List Page
 *
 * Displays list of expenses for the current user.
 * Will be implemented in Milestone 3.
 */

import Link from 'next/link';

import { getRequestContext } from '@/lib/auth/request-context';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string; draftSaved?: string }>;
}) {
  const context = await getRequestContext();
  const params = await searchParams;
  const { error, submitted, draftSaved } = params;

  return (
    <div>
      {/* Error Message */}
      {error === 'forbidden' && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <span className="font-medium">Access Denied:</span> You don&apos;t have permission to
            access that page.
          </p>
        </div>
      )}

      {/* Success Message - Submitted */}
      {submitted && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            <span className="font-medium">Success!</span> Your expense has been submitted for
            approval.
          </p>
        </div>
      )}

      {/* Success Message - Draft Saved */}
      {draftSaved && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Saved!</span> Your expense has been saved as a draft.
          </p>
        </div>
      )}

      {/* Header with Action Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">Expenses</h1>
        <Link
          href="/expenses/submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Submit Expense
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Welcome back,{' '}
          <span className="font-medium text-zinc-900 dark:text-white">{context?.user.name}</span>!
        </p>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm">
          Expenses list will be implemented in Task 3.6
        </p>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
