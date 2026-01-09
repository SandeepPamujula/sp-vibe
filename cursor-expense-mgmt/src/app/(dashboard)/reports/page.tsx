/**
 * Reports Page
 *
 * Generate and export expense reports.
 * Will be implemented in Milestone 5.
 *
 * Note: This page is only accessible to users with 'approver' role.
 */

import { getRequestContext } from '@/lib/auth/request-context';

export default async function ReportsPage() {
  const context = await getRequestContext();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Reports</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Welcome,{' '}
          <span className="font-medium text-zinc-900 dark:text-white">{context?.user.name}</span>
        </p>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm">
          Reports page will be implemented in Milestone 5
        </p>
      </div>
    </div>
  );
}
