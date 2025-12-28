/**
 * Expense Detail Page
 *
 * Displays detailed information about a specific expense.
 */

import { ExpenseDetail } from '@/components/organisms';

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ expenseId: string }>;
}) {
  const { expenseId } = await params;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <ExpenseDetail expenseId={expenseId} />
    </div>
  );
}
