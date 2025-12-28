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
| 3.2 | Create expense form components (atoms, molecules) | Done |
| 3.3 | Implement file upload to S3 | Done |
| 3.4 | Create petty expense submission API (with workflow integration) | Done |
| 3.5 | Implement petty expense submission page | Done |
| 3.6 | Create expense list view with filtering | Pending |
| 3.7 | Implement expense detail view | Pending |
| 3.8 | Create audit trail logging | Pending |
| 3.9 | Write expense submission tests | Pending |
| 3.10 | Create Storybook stories for expense components | Done (3.2) |

### Workflow Integration Notes

- **Task 3.1**: GL codes are managed by DB Admin via database backfill. No application-level service needed. Table and seed data created in Milestone 1.
- **Task 3.4**: Expense submission API must:
  - Link expense to appropriate workflow based on `workflow_type`
  - Create `expense_approval` record for the first workflow step
  - Set `expenses.current_step_id` to the pending step

---

## Prompt History

### Task 3.2: Create expense form components (atoms, molecules)

**Atoms Created:**
- `Input.tsx` - Text input with label, error state, helper text, and icon support
- `Textarea.tsx` - Multi-line text input with character count
- `DateInput.tsx` - Native date picker with label and validation
- `CurrencyInput.tsx` - Numeric input with currency symbol (₹) and thousand separator formatting

**Molecules Created:**
- `FormField.tsx` - Layout utilities: `FormField`, `FormRow`, `FormSection` for consistent form layout
- `FileUploadZone.tsx` - Drag & drop file upload with preview list, validation, and file management
- `GlCodeSelect.tsx` - GL Code dropdown with formatted code + description display

**Exports Updated:**
- `src/components/atoms/index.ts` - Added exports for Input, Textarea, DateInput, CurrencyInput
- `src/components/molecules/index.ts` - Added exports for FormField, FormRow, FormSection, FileUploadZone, GlCodeSelect

**Jest Tests Added (116 tests passing):**
- `src/components/atoms/__tests__/Input.test.tsx` - 15 tests
- `src/components/atoms/__tests__/Textarea.test.tsx` - 13 tests
- `src/components/atoms/__tests__/DateInput.test.tsx` - 14 tests
- `src/components/atoms/__tests__/CurrencyInput.test.tsx` - 15 tests
- `src/components/molecules/__tests__/FormField.test.tsx` - 15 tests
- `src/components/molecules/__tests__/GlCodeSelect.test.tsx` - 18 tests
- `src/components/molecules/__tests__/FileUploadZone.test.tsx` - 16 tests

**Storybook Stories Added:**
- `src/components/atoms/Input.stories.tsx` - Default, WithValue, Required, Error, Icons, Disabled variants
- `src/components/atoms/Textarea.stories.tsx` - Default, CharacterCount, Error, Disabled variants
- `src/components/atoms/DateInput.stories.tsx` - Default, Required, DateRange, Error variants
- `src/components/atoms/CurrencyInput.stories.tsx` - Default, Large amounts, Multi-currency, Interactive demo
- `src/components/molecules/FormField.stories.tsx` - Single/Multi-column layouts, FormSection demos
- `src/components/molecules/GlCodeSelect.stories.tsx` - Default, Loading, ManyOptions, DescriptionOnly variants
- `src/components/molecules/FileUploadZone.stories.tsx` - Empty, WithFiles, MaxReached, Interactive demo

**Storybook Setup:**
- Initialized Storybook 10.x with `@storybook/nextjs-vite`
- Run with: `pnpm run storybook`

### Task 3.3: Implement file upload to S3

**Storage Service (`src/lib/storage.ts`):**
- Created `StorageService` interface abstracting file storage operations
- Implemented S3 storage backend using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- Implemented local filesystem storage backend for development
- Automatic switching: uses S3 when `S3_BUCKET` and AWS credentials configured, otherwise falls back to local storage
- Presigned URL generation for secure direct uploads from browser
- Download URL generation with expiration
- File deletion from storage

**Attachment Service (`src/services/attachment.service.ts`):**
- `requestUploadUrl()` - Request presigned URL for file upload (validates expense ownership and file limits)
- `confirmUpload()` - Create attachment record after successful upload
- `getExpenseAttachments()` - Get all attachments for an expense
- `getAttachmentWithUrl()` - Get attachment details with download URL
- `getDownloadUrl()` - Get presigned download URL
- `deleteAttachment()` - Delete from storage and database (draft expenses only)
- `validateExpenseOwnership()` - Verify expense belongs to tenant
- `getAttachmentCount()` - Count attachments for file limit enforcement

**API Endpoints:**
- `POST /api/attachments/upload-url` - Request presigned URL for upload
- `POST /api/attachments/confirm` - Confirm upload and create DB record
- `GET /api/attachments/:attachmentId` - Get attachment with download URL
- `DELETE /api/attachments/:attachmentId` - Delete attachment (draft only)
- `PUT /api/attachments/upload-local` - Local dev upload handler
- `GET /api/attachments/download-local` - Local dev download handler

**React Hook (`src/hooks/useFileUpload.ts`):**
- `useFileUpload()` hook for managing file uploads in React components
- Handles the presigned URL flow: request URL → upload to storage → confirm
- Progress tracking per file
- Error handling
- Integration with `FileUploadZone` component

**Files Created/Updated:**
- `src/lib/storage.ts` - Storage service abstraction
- `src/services/attachment.service.ts` - Attachment business logic
- `src/hooks/useFileUpload.ts` - React hook for file uploads
- `src/hooks/index.ts` - Hooks barrel export
- `src/app/api/attachments/upload-url/route.ts`
- `src/app/api/attachments/confirm/route.ts`
- `src/app/api/attachments/[attachmentId]/route.ts`
- `src/app/api/attachments/upload-local/route.ts`
- `src/app/api/attachments/download-local/route.ts`
- `src/lib/index.ts` - Added storage exports
- `src/services/index.ts` - Added attachment service exports
- `.gitignore` - Added `.local-storage` for dev file storage

**Jest Tests Added (34 tests passing):**
- `src/lib/__tests__/storage.test.ts` - 11 tests
  - Storage mode detection (S3 vs local)
  - Local upload URL generation
  - File name sanitization
  - Unique key generation
  - Download URL generation
  - File deletion with error handling
  - Local file save/read operations
- `src/services/__tests__/attachment.service.test.ts` - 11 tests
  - Attachment count retrieval
  - Expense ownership validation
  - Upload URL request (validation, max files, success)
  - Upload confirmation and record creation
  - Expense attachments retrieval
- `src/hooks/__tests__/useFileUpload.test.tsx` - 12 tests
  - Initial state verification
  - Successful file upload flow
  - Upload URL request failure handling
  - Storage upload failure handling
  - Empty file array handling
  - File deletion success/failure
  - Clear files functionality
  - Progress tracking
  - isUploading state

### Task 3.4: Create petty expense submission API (with workflow integration)

**Expense Service (`src/services/expense.service.ts`):**
- `createExpense()` - Create expense in draft status with GL code mapping
- `updateExpense()` - Update draft expense with change tracking
- `deleteExpense()` - Delete draft expense (with cascade)
- `submitExpense()` - Submit expense for approval with workflow integration:
  - Links expense to appropriate workflow based on `workflow_type`
  - Creates `expense_approval` record for the first workflow step
  - Sets `expenses.current_step_id` to the pending step
  - Updates status to 'submitted' with audit logging
- `getExpenseById()` - Get expense with all relations (submitter, approver, GL code, workflow, approvals, attachments)
- `getExpenses()` - List expenses with filtering (status, workflowType, submittedBy) and pagination
- `getPendingExpensesForApproval()` - Get submitted expenses pending approval
- `getGlCodes()` - Get active GL codes for nature of expense selection

**API Endpoints:**
- `POST /api/expenses` - Create expense in draft status
- `GET /api/expenses` - List expenses with filters and pagination
- `GET /api/expenses/:expenseId` - Get expense details with all relations
- `PUT /api/expenses/:expenseId` - Update draft expense
- `DELETE /api/expenses/:expenseId` - Delete draft expense
- `POST /api/expenses/:expenseId/submit` - Submit expense for approval (workflow integration)
- `GET /api/gl-codes` - Get nature of expense options

**Files Created/Updated:**
- `src/services/expense.service.ts` - Expense service with CRUD and workflow integration
- `src/services/index.ts` - Added expense service exports
- `src/app/api/expenses/route.ts` - Create & list expenses
- `src/app/api/expenses/[expenseId]/route.ts` - Get, update, delete expense
- `src/app/api/expenses/[expenseId]/submit/route.ts` - Submit expense for approval
- `src/app/api/gl-codes/route.ts` - Nature of expense options endpoint

**Nature of Expense Mapping:**
- `natureOfExpense` input is now a GL Code ID (from dropdown)
- Backend automatically maps to both `glCodeId` and `natureOfExpense` (description)
- Renamed `GlCodeSelect` component to `NatureOfExpenseSelect`
- Updated DTO file from `gl-code.dto.ts` to `nature-of-expense.dto.ts`

**Component Updates:**
- `src/components/molecules/NatureOfExpenseSelect.tsx` - Renamed from GlCodeSelect
- `src/components/molecules/NatureOfExpenseSelect.stories.tsx` - Updated stories
- `src/types/dto/nature-of-expense.dto.ts` - Renamed types and helper function

**Jest Tests Added (28 tests for expense service, 265 total):**
- `src/services/__tests__/expense.service.test.ts` - 28 tests
  - createExpense: GL code validation, workflow validation, expense creation with mapping
  - updateExpense: validation, status checks, GL code mapping on update
  - deleteExpense: not found, status validation, successful deletion
  - submitExpense: validation, ownership check, workflow linking, approval record creation
  - getExpenseById: not found, returns expense with relations
  - getExpenses: empty list, pagination, filters
  - getPendingExpensesForApproval: returns only submitted expenses
  - getGlCodes: returns active codes, handles empty
- `src/components/molecules/__tests__/NatureOfExpenseSelect.test.tsx` - 18 tests (renamed)

### Task 3.5: Implement petty expense submission page

**Organism Component Created:**
- `ExpenseSubmissionForm.tsx` - Complete form component for creating and submitting petty expenses
  - Form state management with React hooks
  - Real-time validation with helpful error messages
  - Integration with GL codes API to populate nature of expense dropdown
  - Draft saving functionality (auto-saves as draft before submission)
  - File upload integration using `useFileUpload` hook
  - Progress tracking for file uploads
  - Submit workflow: validate → save draft → upload files → submit for approval
  - Cancel and success callbacks
  - Loading states for all async operations
  - Responsive layout using FormRow, FormField, FormSection components

**Page Created:**
- `src/app/(dashboard)/expenses/submit/page.tsx` - Expense submission page
  - Clean, focused layout with max-width container
  - Page title and description
  - Integration with ExpenseSubmissionForm component
  - Protected route (requires authentication via middleware)

**Expenses List Page Updated:**
- `src/app/(dashboard)/expenses/page.tsx` - Updated with submission flow
  - "Submit Expense" button in header (navigates to /expenses/submit)
  - Success message display after successful submission
  - Draft saved message display after saving draft
  - Improved layout with action button

**Component Exports Updated:**
- `src/components/organisms/index.ts` - Added ExpenseSubmissionForm exports

**Form Features:**
- **Required Fields:** Expense Date, Vendor Name, Amount, Nature of Expense
- **Optional Fields:** Invoice Number, Purpose/Description
- **File Uploads:** Support for multiple attachments (PDFs, images)
- **Validation Rules:**
  - Expense date cannot be in the future
  - Vendor name: 1-255 characters
  - Amount: positive number, max 999,999,999.99
  - Invoice number: max 100 characters
  - Purpose: max 5000 characters
- **Draft Workflow:**
  - Save as Draft requires only vendor name
  - Draft is created/updated before file uploads
  - Files are uploaded after draft creation
- **Submit Workflow:**
  - Full validation before submission
  - Creates/updates draft expense
  - Waits for file uploads to complete
  - Submits expense for approval
  - Redirects to expenses list with success message

**User Experience:**
- Form sections clearly organized (Expense Details, Purpose, Attachments)
- Inline validation with immediate feedback
- Field errors cleared on user input
- Disabled buttons during async operations
- Loading spinners on buttons during save/submit
- File upload progress bar with percentage
- Success/error messages with proper styling
- Cancel button returns to expenses list

**Jest Tests Added (19 tests for ExpenseSubmissionForm, 284 total):**
- `src/components/organisms/__tests__/ExpenseSubmissionForm.test.tsx` - 19 tests
  - Rendering: form sections, required fields, action buttons, default date
  - GL Codes Loading: API call, dropdown population, error handling
  - Form Validation: missing fields, invalid values, error clearing
  - Save as Draft: validation, API integration, redirect
  - Form Submission: valid submission, error handling, workflow
  - Cancel Action: callbacks, default redirect
  - Button States: disable during operations

**Storybook Stories Added:**
- `src/components/organisms/ExpenseSubmissionForm.stories.tsx`
  - Default: Empty form ready for input
  - WithCallbacks: Demonstrates success/cancel handlers
  - Interactive: Full interactive demo with mock API responses

**Files Created:**
- `src/components/organisms/ExpenseSubmissionForm.tsx`
- `src/components/organisms/ExpenseSubmissionForm.stories.tsx`
- `src/components/organisms/__tests__/ExpenseSubmissionForm.test.tsx`
- `src/app/(dashboard)/expenses/submit/page.tsx`

**Files Updated:**
- `src/components/organisms/index.ts`
- `src/app/(dashboard)/expenses/page.tsx`

**Build Status:**
- ✅ All 284 tests passing
- ✅ TypeScript compilation successful
- ✅ Next.js build successful
- ✅ No linter errors

### Maintenance: Code Quality and Developer Experience Improvements

**Global Project Context for Cursor Optimization:**
- Created comprehensive global context file (`.cursor/rules/00-global-context.mdc`) to reduce Cursor's need to repeatedly analyze codebase
- Includes: project overview, tech stack, database schema, file structure, architecture patterns, common patterns, testing strategies, and key conventions
- Updated `.cursor/rules/expense-mgmt.mdc` to reference global context file
- Benefits: Faster context loading, reduced token usage, better consistency across AI-assisted development

**Zod Schema Validation Fix:**
- Fixed validation error for `natureOfExpense` field when empty string is sent
- Updated `createExpenseSchema` and `updateExpenseSchema` in `src/schemas/expense.schema.ts`
- Added preprocessing to convert empty strings, null, or undefined to undefined before UUID validation
- Allows optional `natureOfExpense` field for draft expenses while maintaining UUID validation when value is provided
- Resolved error: `Error [ZodError]: Invalid nature of expense selection` when submitting expenses with empty natureOfExpense

**Code Cleanup - Debug Logs Removal:**
- Removed all unwanted debug `console.log()` statements from:
  - `src/services/expense.service.ts` - Removed debug logs from `createExpense()` and `submitExpense()` functions
  - `src/app/api/expenses/route.ts` - Removed debug logs from POST handler
  - `src/app/api/expenses/[expenseId]/submit/route.ts` - Removed debug logs from submit handler
  - `src/components/organisms/ExpenseSubmissionForm.tsx` - Removed debug logs from form component
- Kept all `console.error()` statements for proper error logging in production
- Improved code cleanliness and reduced console noise during development

**Files Updated:**
- `.cursor/rules/00-global-context.mdc` - Created comprehensive global context file
- `.cursor/rules/expense-mgmt.mdc` - Added reference to global context
- `src/schemas/expense.schema.ts` - Fixed natureOfExpense validation preprocessing
- `src/services/expense.service.ts` - Removed debug logs, cleaned up code
- `src/app/api/expenses/route.ts` - Removed debug logs
- `src/app/api/expenses/[expenseId]/submit/route.ts` - Removed debug logs
- `src/components/organisms/ExpenseSubmissionForm.tsx` - Removed debug logs

**Build Status:**
- ✅ TypeScript compilation successful
- ✅ Next.js build successful
- ✅ No linter errors
- ✅ All validation errors resolved

