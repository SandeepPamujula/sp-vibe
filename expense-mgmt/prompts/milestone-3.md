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
| 3.3 | Implement file upload to S3 | Pending |
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

