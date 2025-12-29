/**
 * Edit Expense Page
 *
 * Page for editing existing expenses (draft or rejected status only).
 */

import { ExpenseSubmissionForm } from '@/components/organisms';

export default async function ExpenseEditPage({
  params,
}: {
  params: Promise<{ expenseId: string }>;
}) {
  const { expenseId } = await params;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">Edit Expense</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Update the expense information below. You can edit expenses in draft or rejected status.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
        <ExpenseSubmissionForm expenseId={expenseId} />
      </div>
    </div>
  );
}
