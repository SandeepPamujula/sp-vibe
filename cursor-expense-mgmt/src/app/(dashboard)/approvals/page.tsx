/**
 * Approvals Page
 *
 * Displays pending expenses for approver to review.
 *
 * Note: This page is only accessible to users with 'approver' role.
 */

import { PendingApprovalsList } from '@/components/organisms';

export default async function ApprovalsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Pending Approvals</h1>

      <PendingApprovalsList />
    </div>
  );
}
