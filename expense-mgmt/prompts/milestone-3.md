# Milestone 3: Petty Expense Submission (Workflow 1)

## Overview

Implement petty expense submission workflow.

---

## Testing Reminder

> **After each task, ask:** "Would you like me to add Jest unit tests and/or Storybook component tests for this task?"

---

## Tasks

| Task ID | Description | Status |
|---------|-------------|--------|
| 3.1 | ~~Create GL code management service~~ | N/A |
| 3.2 | Create expense form components (atoms, molecules) | Pending |
| 3.3 | Implement file upload to S3 | Pending |
| 3.4 | Create petty expense submission API (with workflow integration) | Pending |
| 3.5 | Implement petty expense submission page | Pending |
| 3.6 | Create expense list view with filtering | Pending |
| 3.7 | Implement expense detail view | Pending |
| 3.8 | Create audit trail logging | Pending |
| 3.9 | Write expense submission tests | Pending |
| 3.10 | Create Storybook stories for expense components | Pending |

### Workflow Integration Notes

- **Task 3.1**: GL codes are managed by DB Admin via database backfill. No application-level service needed. Table and seed data created in Milestone 1.
- **Task 3.4**: Expense submission API must:
  - Link expense to appropriate workflow based on `workflow_type`
  - Create `expense_approval` record for the first workflow step
  - Set `expenses.current_step_id` to the pending step

---

## Prompt History

(Prompts will be added as tasks are completed)

