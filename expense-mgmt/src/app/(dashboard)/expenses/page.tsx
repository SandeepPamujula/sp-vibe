/**
 * Expenses List Page
 *
 * Displays list of expenses for the current user.
 * Will be implemented in Milestone 3.
 */

import { getRequestContext } from '@/lib/auth/request-context';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const context = await getRequestContext();
  const params = await searchParams;
  const error = params.error;

  return (
    <div>
      {error === 'forbidden' && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <span className="font-medium">Access Denied:</span> You don&apos;t have permission to
            access that page.
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Expenses</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Welcome back,{' '}
          <span className="font-medium text-zinc-900 dark:text-white">{context?.user.name}</span>!
        </p>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm">
          Expenses list will be implemented in Milestone 3
        </p>
      </div>
    </div>
  );
}
