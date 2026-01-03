# Milestone 3: Expense Submission (Facility Admin) - Detailed Plan

## Goals
- Enable Facility Admins to upload receipts and submit expenses.
- Implement Workflow Logic (Thresholds).

## Tasks

### Frontend (Components)
- [ ] **3.1**: Create Reusable Atoms/Molecules.
    - [ ] `DatePicker` component.
    - [ ] `FileUploader` component (Drag & drop).
    - [ ] `Select` with search.
    - [ ] *Test*: Storybook stories for each component.
- [ ] **3.3**: Create Expense Submission Form.
    - [ ] Implement `react-hook-form` + `zod` schema.
    - [ ] Integrate File Uploader for Invoice.
    - [ ] *Test*: Unit test form validation logic.

### Backend (Logic)
- [ ] **3.2**: Implement S3 Upload Flow.
    - [ ] Create Server Action `getPresignedUrl`.
    - [ ] *Test*: Verify URL allows upload to S3 (Mock/Real).
- [ ] **3.4**: Implement `submitExpense` Server Action.
    - [ ] **3.4.1**: Validate Input (Zod).
    - [ ] **3.4.2**: Determine Workflow.
        - Logic: Find `ExpenseType` -> Get Workflow -> Fallback to Tenant Default.
    - [ ] **3.4.3**: Evaluator Logic.
        - Loop steps, check `amount < threshold`.
    - [ ] **3.4.4**: Save Expense.
    - [ ] *Test*: Unit test Workflow Evaluator (Critical Path).
- [ ] **3.5**: Notifications.
    - [ ] Integrate SES (or Mock Email Logger).
    - [ ] Trigger on successful submission.

## Execution Log
*(Prompt history and completion notes will be added here)*
