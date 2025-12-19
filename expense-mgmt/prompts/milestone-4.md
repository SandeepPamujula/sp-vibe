# Milestone 4: Petty Expense Approval and Notifications

## Overview

Implement approval/rejection workflow for petty expenses.

---

## Testing Reminder

> **After each task, ask:** "Would you like me to add Jest unit tests and/or Storybook component tests for this task?"

---

## Tasks

| Task ID | Description | Status |
|---------|-------------|--------|
| 4.1 | Create approver dashboard (pending petty expenses) | Pending |
| 4.2 | Implement approval/rejection API (using expense_approvals) | Pending |
| 4.3 | Create approval modal with comments | Pending |
| 4.4 | Implement email notifications (SES) | Pending |
| 4.5 | Create expense history timeline component | Pending |
| 4.6 | Implement resubmission flow for rejected expenses | Pending |
| 4.7 | Write approval workflow tests | Pending |

### Workflow Integration Notes

- **Task 4.2**: Approval/rejection API must:
  - Update `expense_approvals.status` to 'approved' or 'rejected'
  - Set `expense_approvals.approver_id` and `acted_at`
  - Store comments in `expense_approvals.comments`
  - If step is final (`is_final=true`), update `expenses.status` accordingly
  - For multi-level (future): advance to next step or mark complete
  - Record action in `expense_history` audit trail

---

## Prompt History

(Prompts will be added as tasks are completed)

