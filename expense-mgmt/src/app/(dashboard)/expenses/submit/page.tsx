/**
 * Expense Submission Page
 *
 * Page for creating and submitting new petty expenses.
 */

import { ExpenseSubmissionForm } from '@/components/organisms';

export default async function ExpenseSubmitPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">Submit Petty Expense</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Fill out the form below to submit a new petty expense for approval.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
        <ExpenseSubmissionForm />
      </div>
    </div>
  );
}
