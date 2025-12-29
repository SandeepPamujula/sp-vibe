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
| 4.1 | Create approver dashboard (pending petty expenses) | ✅ Completed |
| 4.2 | Implement approval/rejection API (using expense_approvals) | ✅ Completed |
| 4.3 | Create approval modal with comments | ✅ Completed |
| 4.4 | Implement email notifications (SES) | ⏸️ Deferred |
| 4.5 | Create expense history timeline component | ✅ Completed |
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

### Task 4.1: Create approver dashboard (pending petty expenses)

**Implementation Date:** 2024-01-XX

**Files Created:**
- `src/app/api/approvals/pending/route.ts` - API endpoint for fetching pending approvals
- `src/components/organisms/PendingApprovalsList.tsx` - Client component for displaying pending expenses
- Updated `src/app/(dashboard)/approvals/page.tsx` - Replaced placeholder with functional dashboard
- Updated `src/components/organisms/index.ts` - Exported PendingApprovalsList component

**Features Implemented:**
- GET `/api/approvals/pending` endpoint with pagination support
- Role-based access control (approver only)
- PendingApprovalsList component displaying:
  - Table with expense details (Date, Vendor, Amount, Nature of Expense, Status, Submitted By)
  - Pagination controls
  - Loading and error states
  - Empty state message
  - Links to expense detail pages for review
- Uses existing `getPendingExpensesForApproval` service function
- Filters expenses with `status='submitted'` (pending approval)

**API Details:**
- Query params: `page` (default: 1), `limit` (default: 20, max: 100)
- Returns paginated list of pending expenses
- Standardized API response format

**Component Details:**
- Client component with React hooks (useState, useEffect, useCallback)
- Fetches data from `/api/approvals/pending`
- Displays expenses in a responsive table
- Shows "Pending Approval" badge for submitted expenses
- Currency formatting (INR) and date formatting

**Build Status:**
- ✅ TypeScript compilation successful
- ✅ No linter errors
- ✅ Follows project patterns and conventions

---

### Task 4.2: Implement approval/rejection API (using expense_approvals)

**Implementation Date:** 2024-01-XX

**Files Created:**
- `src/app/api/expenses/[expenseId]/approve/route.ts` - POST endpoint for approving expenses
- `src/app/api/expenses/[expenseId]/reject/route.ts` - POST endpoint for rejecting expenses
- `src/app/api/expenses/[expenseId]/approve/route.test.ts` - Tests for approve endpoint
- `src/app/api/expenses/[expenseId]/reject/route.test.ts` - Tests for reject endpoint

**Files Updated:**
- `src/services/expense.service.ts` - Added `approveExpense()` and `rejectExpense()` functions
- `src/services/index.ts` - Exported new service functions
- `src/services/__tests__/expense.service.test.ts` - Added tests for approval/rejection service functions

**Features Implemented:**

**Service Functions:**
- `approveExpense(expenseId, tenantId, approverId, comments?)`:
  - Validates expense is in 'submitted' status
  - Finds pending approval record for current step
  - Updates `expense_approvals` (status='approved', approver_id, acted_at, comments)
  - If step is final (`is_final=true`), updates `expenses.status` to 'approved' and sets `approvedBy`
  - Records action in `expense_history` audit trail
  
- `rejectExpense(expenseId, tenantId, approverId, comments)`:
  - Validates expense is in 'submitted' status
  - Requires rejection comments (non-empty)
  - Updates `expense_approvals` (status='rejected', approver_id, acted_at, comments)
  - Updates `expenses.status` to 'rejected' (rejection is always final)
  - Records action in `expense_history` audit trail

**API Endpoints:**
- POST `/api/expenses/:expenseId/approve`:
  - Body: `{ comments?: string }` (optional, max 5000 chars)
  - Role check: approver only
  - Returns: `{ success: true, data: { expenseId } }`
  
- POST `/api/expenses/:expenseId/reject`:
  - Body: `{ comments: string }` (required, 1-5000 chars)
  - Role check: approver only
  - Returns: `{ success: true, data: { expenseId } }`

**Error Handling:**
- 403: User is not an approver
- 400: Validation errors (missing comments for reject, invalid expense status, no pending approval)
- 404: Expense or approval not found
- 401: Not authenticated
- 500: Internal server errors

**Test Coverage:**

**API Route Tests:**
- `approve/route.test.ts`: 10 tests (all passing)
  - Success cases (with/without comments)
  - Role-based access control
  - Validation errors
  - Business logic errors
  - Authentication/authorization errors
  
- `reject/route.test.ts`: 12 tests (all passing)
  - Success case
  - Role-based access control
  - Validation errors (missing/empty/too long comments)
  - Business logic errors
  - Authentication/authorization errors

**Service Function Tests:**
- `approveExpense`: 5 tests (all passing)
  - Success cases (with/without comments)
  - Expense not found
  - Expense not in submitted status
  - No current workflow step
  - No pending approval found
  
- `rejectExpense`: 5 tests (all passing)
  - Success case
  - Comments required validation
  - Expense not found
  - Expense not in submitted status
  - No current workflow step
  - No pending approval found

**Total Test Coverage:**
- 22 API route tests (all passing)
- 10 service function tests (all passing)
- Comprehensive error handling coverage
- Authentication and authorization tests
- Validation error tests
- Business logic error tests

**Workflow Integration:**
- ✅ Updates `expense_approvals.status` to 'approved' or 'rejected'
- ✅ Sets `expense_approvals.approver_id` and `acted_at`
- ✅ Stores comments in `expense_approvals.comments`
- ✅ If step is final (`is_final=true`), updates `expenses.status` accordingly
- ✅ Records action in `expense_history` audit trail
- ✅ Ready for multi-level approval (future enhancement)

**Build Status:**
- ✅ All 22 API route tests passing
- ✅ All 44 service tests passing (including new approval/rejection tests)
- ✅ TypeScript compilation successful
- ✅ No linter errors
- ✅ Follows project patterns and conventions

---

### Task 4.3: Create approval modal with comments

**Implementation Date:** 2024-01-XX

**Files Created:**
- `src/components/molecules/ApprovalModal.tsx` - Modal component for approving/rejecting expenses
- `src/components/molecules/__tests__/ApprovalModal.test.tsx` - Comprehensive unit tests (28 tests)
- `src/components/molecules/ApprovalModal.stories.tsx` - Storybook stories for component documentation

**Files Updated:**
- `src/components/molecules/index.ts` - Exported ApprovalModal component
- `src/components/organisms/ExpenseDetail.tsx` - Integrated ApprovalModal with "Review & Approve" button
- `src/components/organisms/PendingApprovalsList.tsx` - Added "Approve/Reject" button with modal integration

**Features Implemented:**

**ApprovalModal Component:**
- Single-step workflow (comments and actions on same screen)
- Comments textarea with character count (max 5000 characters)
- Approve button (comments optional)
- Reject button (comments required, disabled when empty)
- Cancel button to close without action
- Loading states (separate loading indicators for approve/reject)
- Error handling and display
- Keyboard support (Escape to close)
- Prevents body scroll when modal is open
- Accessible (ARIA labels, modal role, keyboard navigation)

**Integration Points:**
- **ExpenseDetail**: "Review & Approve" button shown when expense status is 'submitted'
- **PendingApprovalsList**: "Approve/Reject" button in actions column for each pending expense
- Both integrations refresh data after successful approval/rejection

**User Experience:**
- Comments field always visible
- Clear helper text explaining requirements
- Reject button disabled until comments are entered
- Error messages displayed inline
- Success callbacks refresh parent components
- Modal closes automatically on success

**Test Coverage:**

**Unit Tests (28 tests, all passing):**
- **Rendering** (3 tests):
  - Not rendering when closed
  - Rendering when open
  - All form elements present
  
- **State Management** (3 tests):
  - State reset on modal close
  - Body scroll prevention when open
  - Body scroll restoration when closed
  
- **Keyboard Interactions** (2 tests):
  - Escape key closes modal
  - Escape key disabled during loading
  
- **Approve Functionality** (5 tests):
  - Approve without comments
  - Approve with comments
  - Handle API errors
  - Handle network errors
  - Loading state during approval
  
- **Reject Functionality** (6 tests):
  - Reject with comments
  - Reject button disabled when comments empty
  - Reject button enabled when comments entered
  - Disabled state validation
  - Handle API errors
  - Loading state during rejection
  
- **Cancel Functionality** (4 tests):
  - Cancel button closes modal
  - Backdrop click closes modal
  - Close button works
  - Backdrop disabled during loading
  
- **Comments Field** (3 tests):
  - Comments value updates
  - Error clearing on typing
  - Character count display
  
- **Accessibility** (2 tests):
  - ARIA attributes
  - Accessible close button

**Storybook Stories:**
- Closed state
- Open state
- Interactive example with state management

**Component Features:**
- ✅ Single-step workflow (no multi-step navigation)
- ✅ Comments field with validation
- ✅ Approve/Reject buttons visible simultaneously
- ✅ Loading states for each action
- ✅ Error handling and display
- ✅ Keyboard accessibility (Escape key)
- ✅ Body scroll prevention
- ✅ Auto-refresh on success
- ✅ Accessible (ARIA attributes)

**Build Status:**
- ✅ All 28 unit tests passing
- ✅ TypeScript compilation successful
- ✅ No linter errors (all ESLint issues fixed)
- ✅ Follows project patterns and conventions
- ✅ Storybook stories created

**ESLint Fixes:**
- Fixed unused import in `eslint.config.mjs` (removed unused `storybook` import)
- Fixed React Hook exhaustive-deps warning in `ExpenseDetail.tsx` (added eslint-disable comment for stable function)
- Fixed TypeScript `any` types in test file (replaced with proper `ApprovalResponse` interface)
- Fixed React Hook rules violation in Storybook stories (created `InteractiveWrapper` component)


---

### Task 4.4: Implement email notifications (SES)

**Status:** ⏸️ Deferred

**Note:** This task has been deferred for now. Email notifications using Amazon SES will be implemented in a future milestone or when needed.

**Planned Implementation:**
- Email notifications on expense approval/rejection
- Integration with Amazon SES
- Email templates for different notification types
- Mock implementation for local development

---

### Task 4.5: Create expense history timeline component

**Implementation Date:** 2024-01-XX

**Files Created:**
- `src/components/molecules/ExpenseHistoryTimeline.tsx` - Visual timeline component for expense history
- `src/components/molecules/__tests__/ExpenseHistoryTimeline.test.tsx` - Comprehensive unit tests (19 tests)
- `src/components/molecules/ExpenseHistoryTimeline.stories.tsx` - Storybook stories (6 stories)

**Files Updated:**
- `src/components/atoms/Icon.tsx` - Added timeline icons (ClockIcon, XCircleIcon, DocumentPlusIcon, PaperAirplaneIcon, PencilIcon)
- `src/components/atoms/index.ts` - Exported new timeline icons
- `src/components/molecules/index.ts` - Exported ExpenseHistoryTimeline component
- `src/components/organisms/ExpenseDetail.tsx` - Replaced ExpenseAuditTrail with ExpenseHistoryTimeline
- `.storybook/main.ts` - Fixed ESM compatibility issue (replaced require.resolve with ESM path resolution)
- `.storybook/preview.ts` - Added fetch mock fallback

**Features Implemented:**

**ExpenseHistoryTimeline Component:**
- Visual timeline with vertical line and connecting dots
- Action-specific icons for each history entry:
  - DocumentPlusIcon for 'created'
  - PaperAirplaneIcon for 'submitted'
  - CheckCircleIcon for 'approved'
  - XCircleIcon for 'rejected'
  - PencilIcon for 'updated'
- Color-coded timeline dots based on action type:
  - Blue for created/submitted
  - Green for approved
  - Red for rejected
  - Gray for updated
- Card-based layout for each history entry
- Relative time display ("2 hours ago") with absolute timestamp fallback
- User information display (name and email)
- Comments display (when available)
- Loading and error states
- Empty state with helpful message and icon
- Responsive design with dark mode support

**Visual Enhancements:**
- Timeline line connecting all entries
- Rounded timeline dots with icons
- Shadow effects on cards
- Hover effects on cards
- Proper spacing and typography
- Clean, modern UI design

**Integration:**
- Integrated into ExpenseDetail component
- Uses existing API endpoint `/api/expenses/:expenseId/history`
- Replaced ExpenseAuditTrail component (kept for backward compatibility)
- Section title updated to "Expense History Timeline"

**Test Coverage:**

**Unit Tests (19 tests, all passing):**
- **Loading State** (1 test):
  - Loading spinner display
  
- **Error State** (3 tests):
  - Network error handling
  - API error handling
  - Generic error handling
  
- **Empty State** (1 test):
  - Empty state message display
  
- **History Display** (5 tests):
  - All history entries displayed
  - User information display
  - Comments display
  - Timestamp formatting
  - Entries without comments handling
  
- **Action Badges and Icons** (2 tests):
  - Correct badge variants for all actions
  - Timeline icons rendering
  
- **Timeline Structure** (3 tests):
  - Timeline line rendering
  - Timeline dots with colors
  - Relative and absolute time display
  
- **API Integration** (4 tests):
  - Correct endpoint fetching
  - Refetch on expenseId change
  - Fetch error handling
  - Non-array data handling

**Storybook Stories (6 stories):**
- Default: Full history with multiple entries
- AllActions: All action types (created, submitted, approved, rejected, updated)
- SingleEntry: Single history entry
- EmptyState: No history entries
- NoComments: Entries without comments
- ErrorState: Error handling display

**Component Features:**
- ✅ Visual timeline with icons and color coding
- ✅ Action-specific icons and colors
- ✅ Relative time with absolute timestamp fallback
- ✅ Card-based layout for each entry
- ✅ Responsive design with dark mode support
- ✅ Error handling and loading states
- ✅ Empty state messaging
- ✅ Clean, modern UI design

**Storybook Fixes:**
- Fixed ESM module issue in `.storybook/main.ts` (replaced `require.resolve()` with ESM-compatible path resolution)
- Fixed Storybook import issues (changed from `@storybook/react` to `@storybook/nextjs-vite`)
- Added fetch mock fallback in preview.ts
- Note: Global CSS import may need to be added to preview.ts for proper Tailwind styling

**Build Status:**
- ✅ All 19 unit tests passing
- ✅ TypeScript compilation successful
- ✅ No linter errors
- ✅ Follows project patterns and conventions
- ✅ Storybook stories created
- ✅ Component integrated into ExpenseDetail

**Notes:**
- Removed changes footer section from timeline (as requested)
- ExpenseAuditTrail component remains available for backward compatibility
- Timeline provides better visual representation than the previous audit trail component
