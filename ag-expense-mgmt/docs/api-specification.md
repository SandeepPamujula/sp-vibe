# API & Server Action Specification

This document defines the interface between the Client (Next.js Frontend) and the Server (Next.js Server Actions / API Routes).
We primarily use **Server Actions** for mutations and data fetching where appropriate, adhering to the "Backend-for-Frontend" pattern.

## 1. Standard Response Format

All Server Actions will return a standard `ActionResponse` type to ensure consistent error handling on the client.

```typescript
type ActionResponse<T> = {
  success: boolean;
  message?: string; // Human-readable message (for toasts)
  data?: T;
  errors?: Record<string, string[]>; // Field-level validation errors (Zod)
};
```

## 2. Authentication & Context

All Server Actions must:
1.  Verify the user is authenticated via `auth()` (NextAuth/Azure Entra).
2.  Extract `tenantId` from the user session.
3.  Verify permissions based on the user's role (Admin, Approver, Employee).

## 3. Module: Expenses

### 3.1. Submit Expense
*   **Function**: `submitExpense(data: CreateExpenseSchema)`
*   **Role**: Any User
*   **Input (Zod)**:
    ```typescript
    z.object({
      amount: z.number().positive(),
      description: z.string().min(1),
      date: z.date(),
      expenseTypeId: z.string().uuid(),
      invoiceUrl: z.string().url(), // Presigned URL from S3
    })
    ```
*   **Logic**:
    1.  Validate input.
    2.  Determine associated Workflow based on `expenseTypeId`.
    3.  Evaluate Workflow Rules (Thresholds).
    4.  Create Expense record in MongoDB with status `PENDING_APPROVAL` (or `APPROVED` if auto-skipped).
    5.  Trigger Email Notification to first approver/submitter.

### 3.2. Approve Expense
*   **Function**: `approveExpense(expenseId: string, comment?: string)`
*   **Role**: Approver
*   **Logic**:
    1.  Verify User has `Approver` role.
    2.  Update Expense status (move to next step or `APPROVED` if final).
    3.  Log in `AuditLog`.
    4.  Notify next approver or submitter.

### 3.3. Reject Expense
*   **Function**: `rejectExpense(expenseId: string, reason: string)`
*   **Role**: Approver
*   **Logic**:
    1.  Verify User has `Approver` role.
    2.  Update Status to `REJECTED`.
    3.  Log in `AuditLog`.
    4.  Notify Submitter.

### 3.4. Get My Expenses
*   **Function**: `getMyExpenses(filters: FilterSchema)`
*   **Role**: Any User
*   **Returns**: `Promise<ActionResponse<Expense[]>>`
*   **Logic**: Returns expenses where `submitterUserId == currentUser.id`.

### 3.5. Get Pending Approvals
*   **Function**: `getPendingApprovals()`
*   **Role**: Approver / Admin
*   **Logic**: Returns all expenses with status `PENDING_APPROVAL` for the tenant.

---

## 4. Module: Workflows (Admin Only)

### 4.1. Create/Update Workflow
*   **Function**: `upsertWorkflow(data: WorkflowSchema)`
*   **Role**: Facility Admin
*   **Input**:
    ```typescript
    z.object({
      id: z.string().optional(),
      name: z.string(),
      steps: z.array(z.object({
        stepOrder: z.number(),
        approverRole: z.string(), // e.g., "MANAGER", "FINANCE"
        thresholdAmount: z.number().min(0),
      }))
    })
    ```

### 4.2. List Workflows
*   **Function**: `getWorkflows()`
*   **Role**: Facility Admin

---

## 5. Module: Configuration (Admin Only)

### 5.1. Expense Types (Read-Only)
*   **Function**: `getExpenseTypes()`
*   **Role**: Any User
*   **Returns**: `Promise<ActionResponse<ExpenseType[]>>`
*   **Note**: Populated via seed scripts/backfill only.

### 5.2. GL Codes (Read-Only)
*   **Function**: `getGLCodes()`
*   **Role**: Any User
*   **Returns**: `Promise<ActionResponse<GLCode[]>>`
*   **Note**: Populated via seed scripts/backfill only.

---

## 6. Module: File Upload (S3)

### 6.1. Get Pre-signed Upload URL
*   **Function**: `getUploadUrl(filename: string, fileType: string)`
*   **Role**: Any User
*   **Logic**:
    1.  Generate unique key (e.g., `tenants/{tenantId}/{year}/{uuid}-{filename}`).
    2.  Return AWS S3 Presigned Post URL.
