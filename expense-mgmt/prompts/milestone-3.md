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
| 3.4 | Create petty expense submission API (with workflow integration) | Pending |
| 3.5 | Implement petty expense submission page | Pending |
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

