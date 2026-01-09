# Testing Strategy

This document outlines the testing approach to ensure reliability and correctness.

## 1. Testing Pyramid

### 1.1. Unit Tests (Jest)
*   **Scope**: Helper functions, Zod schemas, Utility logic.
*   **Location**: `__tests__/unit` or co-located `*.test.ts` files.
*   **Example**:
    *   Testing `calculateTotal(expenses)`.
    *   Testing `WorkflowSchema.parse(invalidData)` throws correct errors.

### 1.2. Component Tests (React Testing Library)
*   **Scope**: Reusable UI components (Atoms/Molecules).
*   **Location**: Co-located `*.test.tsx`.
*   **Focus**:
    *   Render correctness (Props -> UI).
    *   User Interaction (Click handlers, Input changes).
    *   Accessibility (A11y role checks).
*   **Note**: Do NOT test Next.js pages here (use E2E for that).

### 1.3. Storybook Interaction Tests
*   **Scope**: Isolated UI components (Atoms/Molecules/Organisms).
*   **Tool**: Storybook `play` function (Interaction Testing).
*   **Benefit**: visualizes the state and allows debugging UI interactions (hover, click, type) in the browser.
*   **Location**: `*.stories.tsx`.
*   **Example**:
    *   Simulate User filling an `ExpenseForm` and verify validation errors appear.
    *   Clicking a `Button` triggers the `onClick` handler.

### 1.3. Integration Tests (Server Actions)
*   **Scope**: Server Actions and Database interactions.
*   **Strategy**:
    *   Use a **Test Database** (Containerized MongoDB or In-Memory Mongo).
    *   Call Server Actions directly in tests.
    *   Verify DB state changes.
*   **Example**:
    1.  Seed DB with a User and Workflow.
    2.  Call `submitExpense(...)`.
    3.  Assert Expense exists in DB with status `PENDING_APPROVAL`.

### 1.4. End-to-End (E2E) Tests (Playwright)
*   **Scope**: Critical User Flows.
*   **Critical Flows**:
    1.  Login Flow.
    2.  Expense Submission Flow (Upload -> Submit).
    3.  Approval Flow (Login as Approver -> Approve).

## 2. Test Configuration

*   **Runner**: Jest (Compatible with current Next.js ecosystem).
*   **Environment**: `jsdom` for Components, `node` for Server Actions.
*   **Mocks**:
    *   Mock **S3** calls (don't upload real files).
    *   Mock **SES** (don't send real emails).
    *   Mock **Auth** (simulate logged-in user).

## 3. CI/CD Integration

*   **Trigger**: On Pull Request to `main`.
*   **Steps**:
    1.  Lint code.
    2.  Run Unit & Component Tests.
    3.  Run Integration Tests (with ephemeral DB).
    4.  (Optional) Build app to verify compilation.
