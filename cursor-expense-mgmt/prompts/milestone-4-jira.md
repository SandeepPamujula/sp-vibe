# Milestone 4: Petty Expense Approval and Notifications - JIRA Documentation

## Epic: EXP-4 - Petty Expense Approval and Notifications

### Epic Summary
Implement approval/rejection workflow for petty expenses, enabling approvers to review, approve, or reject submitted expenses with proper audit trail and notifications.

### Epic Description

**Objective:**
Build a complete approval workflow system for petty expenses that allows approvers to review pending expenses, make approval/rejection decisions with comments, and maintain a comprehensive audit trail.

**Business Value:**
- Streamlines expense approval process
- Ensures proper authorization before expense payment
- Maintains compliance through audit trail
- Provides transparency in approval decisions

**Technical Approach:**
- Implement approval/rejection API endpoints using `expense_approvals` table
- Create approver dashboard for pending expenses
- Build approval modal with comments functionality
- Implement expense history timeline for audit trail
- Add resubmission flow for rejected expenses

**Dependencies:**
- Milestone 3: Expense submission functionality must be complete
- Database schema: `expense_approvals` and `expense_history` tables must exist

**Success Criteria:**
- Approvers can view all pending expenses
- Approvers can approve or reject expenses with comments
- All approval actions are logged in audit trail
- Rejected expenses can be resubmitted by submitters
- Users can edit draft and rejected expenses

---

## Task 4.1: Create Approver Dashboard (Pending Petty Expenses)

### Ticket: EXP-4.1

**Title:** Create Approver Dashboard for Pending Petty Expenses

**Type:** Story

**Priority:** High

**Labels:** `backend`, `frontend`, `approval-workflow`, `milestone-4`

**Description:**

As an approver, I need a dedicated dashboard to view all expenses pending my approval so that I can efficiently review and process expense requests.

**Context:**
This task implements the approver-facing dashboard that displays all expenses with status 'submitted' (pending approval). The dashboard should provide a clear view of expense details and allow approvers to take action on each expense.

**Technical Requirements:**

**Backend:**
- Create GET `/api/approvals/pending` endpoint
- Implement pagination support (default: 20 items per page, max: 100)
- Filter expenses by status='submitted'
- Enforce role-based access control (approver role only)
- Return standardized API response format
- Use existing `getPendingExpensesForApproval` service function

**Frontend:**
- Create `PendingApprovalsList` component (client component)
- Display expenses in a responsive table format
- Show expense details: Date, Vendor, Amount, Nature of Expense, Status, Submitted By
- Implement pagination controls (Previous/Next buttons)
- Display loading state during data fetch
- Display error state if API call fails
- Display empty state message when no pending expenses
- Add links to expense detail pages for review
- Show "Pending Approval" badge for submitted expenses
- Format currency as INR with proper formatting
- Format dates in readable format

**Acceptance Criteria:**

**AC1: API Endpoint**
- [ ] GET `/api/approvals/pending` endpoint exists and is accessible
- [ ] Endpoint accepts query parameters: `page` (default: 1) and `limit` (default: 20, max: 100)
- [ ] Endpoint returns paginated list of expenses with status='submitted'
- [ ] Endpoint enforces approver role check (returns 403 if user is not approver)
- [ ] Endpoint returns standardized response format: `{ success: true, data: { expenses: [], total: number } }`
- [ ] Endpoint filters expenses by tenant (multi-tenancy enforced)

**AC2: Dashboard Component**
- [ ] `PendingApprovalsList` component is created and exported
- [ ] Component displays expenses in a table with columns: Date, Vendor, Amount, Nature of Expense, Status, Submitted By
- [ ] Component shows pagination controls when total pages > 1
- [ ] Component displays loading spinner while fetching data
- [ ] Component displays error message if API call fails
- [ ] Component displays empty state message when no pending expenses exist
- [ ] Component shows "Pending Approval" badge for each expense
- [ ] Component formats currency amounts in INR format
- [ ] Component formats dates in readable format (e.g., "DD MMM YYYY")
- [ ] Component includes links to expense detail pages (`/expenses/[expenseId]`)

**AC3: Integration**
- [ ] Component is integrated into `/approvals` page route
- [ ] Dashboard is accessible only to users with approver role
- [ ] Component fetches data on mount using `/api/approvals/pending` endpoint
- [ ] Component handles pagination correctly (updates URL params, fetches new data)

**AC4: User Experience**
- [ ] Dashboard loads within 2 seconds for typical data sets
- [ ] Table is responsive and works on mobile devices
- [ ] Pagination controls are clearly visible and functional
- [ ] Loading states provide clear feedback to users
- [ ] Error messages are user-friendly and actionable

**AC5: Code Quality**
- [ ] TypeScript compilation successful with no errors
- [ ] No ESLint errors or warnings
- [ ] Code follows project patterns and conventions
- [ ] Component uses React hooks appropriately (useState, useEffect, useCallback)
- [ ] Multi-tenancy is enforced in all queries

**Technical Notes:**
- Use existing `getPendingExpensesForApproval` service function from `expense.service.ts`
- Follow API route pattern from project conventions
- Use standardized error handling and response format
- Ensure proper tenant isolation in all database queries

**Files to Create:**
- `src/app/api/approvals/pending/route.ts`
- `src/components/organisms/PendingApprovalsList.tsx`

**Files to Update:**
- `src/app/(dashboard)/approvals/page.tsx`
- `src/components/organisms/index.ts`

---

## Task 4.2: Implement Approval/Rejection API (Using expense_approvals)

### Ticket: EXP-4.2

**Title:** Implement Approval/Rejection API Endpoints Using expense_approvals Table

**Type:** Story

**Priority:** High

**Labels:** `backend`, `api`, `approval-workflow`, `milestone-4`, `testing`

**Description:**

As an approver, I need API endpoints to approve or reject expenses with optional comments so that I can make informed decisions and provide feedback to submitters.

**Context:**
This task implements the core approval/rejection functionality that updates the `expense_approvals` table, manages workflow state transitions, and maintains audit trail. The implementation must handle single-step workflows (current) while being extensible for multi-level approvals (future).

**Technical Requirements:**

**Backend Service Functions:**

1. **`approveExpense(expenseId, tenantId, approverId, comments?)`**
   - Validates expense exists and is in 'submitted' status
   - Validates expense belongs to tenant (multi-tenancy)
   - Finds pending approval record for current workflow step
   - Updates `expense_approvals` table:
     - Set `status` to 'approved'
     - Set `approver_id` to approverId
     - Set `acted_at` to current timestamp
     - Set `comments` to provided comments (optional)
   - If workflow step is final (`is_final=true`):
     - Update `expenses.status` to 'approved'
     - Set `expenses.approved_by` to approverId
   - Create entry in `expense_history` table with action='approved'
   - Return void or throw error on failure

2. **`rejectExpense(expenseId, tenantId, approverId, comments)`**
   - Validates expense exists and is in 'submitted' status
   - Validates expense belongs to tenant (multi-tenancy)
   - Requires non-empty comments (rejection reason)
   - Finds pending approval record for current workflow step
   - Updates `expense_approvals` table:
     - Set `status` to 'rejected'
     - Set `approver_id` to approverId
     - Set `acted_at` to current timestamp
     - Set `comments` to provided comments (required)
   - Update `expenses.status` to 'rejected' (rejection is always final)
   - Create entry in `expense_history` table with action='rejected'
   - Return void or throw error on failure

**API Endpoints:**

1. **POST `/api/expenses/:expenseId/approve`**
   - Request body: `{ comments?: string }` (optional, max 5000 characters)
   - Validates expenseId format (UUID)
   - Enforces approver role check (returns 403 if not approver)
   - Calls `approveExpense` service function
   - Returns: `{ success: true, data: { expenseId: string } }`
   - Error responses:
     - 400: Validation errors (invalid expense status, no pending approval)
     - 403: User is not an approver
     - 404: Expense not found
     - 401: Not authenticated
     - 500: Internal server errors

2. **POST `/api/expenses/:expenseId/reject`**
   - Request body: `{ comments: string }` (required, 1-5000 characters)
   - Validates expenseId format (UUID)
   - Validates comments are provided and non-empty
   - Enforces approver role check (returns 403 if not approver)
   - Calls `rejectExpense` service function
   - Returns: `{ success: true, data: { expenseId: string } }`
   - Error responses:
     - 400: Validation errors (missing comments, invalid expense status, no pending approval)
     - 403: User is not an approver
     - 404: Expense not found
     - 401: Not authenticated
     - 500: Internal server errors

**Acceptance Criteria:**

**AC1: Service Functions**
- [ ] `approveExpense()` function exists in `expense.service.ts`
- [ ] `rejectExpense()` function exists in `expense.service.ts`
- [ ] Both functions are exported from `services/index.ts`
- [ ] `approveExpense()` validates expense is in 'submitted' status
- [ ] `approveExpense()` validates expense belongs to tenant
- [ ] `approveExpense()` finds and updates pending approval record
- [ ] `approveExpense()` updates expense status to 'approved' if step is final
- [ ] `approveExpense()` creates history entry with action='approved'
- [ ] `rejectExpense()` validates expense is in 'submitted' status
- [ ] `rejectExpense()` requires non-empty comments
- [ ] `rejectExpense()` updates expense status to 'rejected' (always final)
- [ ] `rejectExpense()` creates history entry with action='rejected'
- [ ] Both functions throw appropriate errors for invalid states

**AC2: Approve API Endpoint**
- [ ] POST `/api/expenses/:expenseId/approve` endpoint exists
- [ ] Endpoint validates expenseId format (UUID)
- [ ] Endpoint enforces approver role check (403 if not approver)
- [ ] Endpoint accepts optional comments in request body
- [ ] Endpoint validates comments length (max 5000 characters)
- [ ] Endpoint calls `approveExpense()` service function
- [ ] Endpoint returns success response with expenseId
- [ ] Endpoint handles all error cases with appropriate status codes
- [ ] Endpoint returns standardized error response format

**AC3: Reject API Endpoint**
- [ ] POST `/api/expenses/:expenseId/reject` endpoint exists
- [ ] Endpoint validates expenseId format (UUID)
- [ ] Endpoint enforces approver role check (403 if not approver)
- [ ] Endpoint requires comments in request body
- [ ] Endpoint validates comments are non-empty (1-5000 characters)
- [ ] Endpoint calls `rejectExpense()` service function
- [ ] Endpoint returns success response with expenseId
- [ ] Endpoint handles all error cases with appropriate status codes
- [ ] Endpoint returns standardized error response format

**AC4: Database Updates**
- [ ] Approval updates `expense_approvals.status` to 'approved'
- [ ] Approval sets `expense_approvals.approver_id` correctly
- [ ] Approval sets `expense_approvals.acted_at` timestamp
- [ ] Approval stores comments in `expense_approvals.comments` (if provided)
- [ ] Approval updates `expenses.status` to 'approved' if step is final
- [ ] Approval sets `expenses.approved_by` if step is final
- [ ] Rejection updates `expense_approvals.status` to 'rejected'
- [ ] Rejection sets `expense_approvals.approver_id` correctly
- [ ] Rejection sets `expense_approvals.acted_at` timestamp
- [ ] Rejection stores comments in `expense_approvals.comments`
- [ ] Rejection updates `expenses.status` to 'rejected' (always)

**AC5: Audit Trail**
- [ ] Approval creates entry in `expense_history` table
- [ ] Approval history entry has action='approved'
- [ ] Approval history entry includes approver userId
- [ ] Approval history entry includes comments (if provided)
- [ ] Approval history entry includes status change in changes field
- [ ] Rejection creates entry in `expense_history` table
- [ ] Rejection history entry has action='rejected'
- [ ] Rejection history entry includes approver userId
- [ ] Rejection history entry includes comments
- [ ] Rejection history entry includes status change in changes field

**AC6: Error Handling**
- [ ] Returns 400 for expense not in 'submitted' status
- [ ] Returns 400 for missing comments on rejection
- [ ] Returns 400 for empty comments on rejection
- [ ] Returns 400 for comments exceeding 5000 characters
- [ ] Returns 400 for no pending approval found
- [ ] Returns 400 for expense with no current workflow step
- [ ] Returns 403 for non-approver users
- [ ] Returns 404 for expense not found
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 500 for internal server errors
- [ ] All errors return standardized error response format

**AC7: Multi-Tenancy**
- [ ] All database queries filter by tenantId
- [ ] Service functions validate tenant ownership
- [ ] API endpoints enforce tenant isolation
- [ ] No cross-tenant data access possible

**AC8: Test Coverage**
- [ ] API route tests created for approve endpoint (minimum 10 tests)
- [ ] API route tests created for reject endpoint (minimum 12 tests)
- [ ] Service function tests created for `approveExpense()` (minimum 5 tests)
- [ ] Service function tests created for `rejectExpense()` (minimum 5 tests)
- [ ] Tests cover success cases (with/without comments)
- [ ] Tests cover role-based access control
- [ ] Tests cover validation errors
- [ ] Tests cover business logic errors
- [ ] Tests cover authentication/authorization errors
- [ ] All tests pass successfully

**AC9: Code Quality**
- [ ] TypeScript compilation successful with no errors
- [ ] No ESLint errors or warnings
- [ ] Code follows project patterns and conventions
- [ ] Service functions use proper error handling
- [ ] API routes use standardized response format
- [ ] Database queries use proper transaction handling (if needed)

**Technical Notes:**
- Use `expense_approvals` table for tracking approval decisions
- Use `expense_history` table for audit trail
- Comments are optional for approval but required for rejection
- Rejection is always final (updates expense status immediately)
- Approval is final only if workflow step has `is_final=true`
- Implementation should be extensible for multi-level approvals (future)
- All database operations must include tenant filtering

**Files to Create:**
- `src/app/api/expenses/[expenseId]/approve/route.ts`
- `src/app/api/expenses/[expenseId]/reject/route.ts`
- `src/app/api/expenses/[expenseId]/approve/route.test.ts`
- `src/app/api/expenses/[expenseId]/reject/route.test.ts`

**Files to Update:**
- `src/services/expense.service.ts` (add approveExpense and rejectExpense functions)
- `src/services/index.ts` (export new functions)
- `src/services/__tests__/expense.service.test.ts` (add tests for new functions)
- `src/schemas/expense.schema.ts` (add approve/reject schemas if needed)

**Dependencies:**
- Task 4.1 must be completed (approver dashboard for testing)
- Database schema must include `expense_approvals` and `expense_history` tables
- Workflow configuration must exist in database

---

## Additional Notes

### Testing Requirements
- All API endpoints must have comprehensive test coverage
- Service functions must have unit tests
- Integration tests should verify end-to-end workflow
- Test multi-tenancy isolation
- Test role-based access control

### Documentation
- API endpoints should be documented with request/response examples
- Service functions should have JSDoc comments
- Error codes should be documented in constants file

### Future Enhancements
- Multi-level approval workflow support
- Bulk approval/rejection functionality
- Email notifications on approval/rejection (Task 4.4)
- Approval delegation features

