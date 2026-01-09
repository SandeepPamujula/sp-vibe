# Milestone 4: Approval Workflow (Approver) - Detailed Plan

## Goals
- Approver Dashboard.
- Status Updates.
- Audit Logging.

## Tasks

### Frontend
- [ ] **4.1**: Create Approver Dashboard.
    - [ ] Fetch expenses where `status === 'PENDING_APPROVAL'` and `currentStep.approverRole` matches user.
    - [ ] *Test*: Verify filtering logic in UI.
- [ ] **4.2**: Expense Detail View.
    - [ ] Display Metadata + Invoice Attachment (Presigned GET URL).
    - [ ] Action Buttons (Approve/Reject).

### Backend
- [ ] **4.3**: Implement `updateExpenseStatus`.
    - [ ] Validate User Role vs Step Role.
    - [ ] Update Status (`APPROVED` | `REJECTED`).
    - [ ] *Test*: Integration test for permission denial (wrong role).
- [ ] **4.4**: Implement Audit Logging.
    - [ ] Create `AuditLog` entity on every status change.
    - [ ] *Test*: Verify Log entry creation.
- [ ] **4.5**: Notifications.
    - [ ] Email Submitter on decision.

## Execution Log
*(Prompt history and completion notes will be added here)*
