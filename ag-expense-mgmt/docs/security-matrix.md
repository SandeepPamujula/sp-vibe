# Security & Access Control Matrix

This document defines the Role-Based Access Control (RBAC) and Tenant Isolation policies for the Expense Management System.

## 1. Roles & Definitions

| Role | Description |
| :--- | :--- |
| **Facility Admin** | Super user for a specific Tenant. Can configure workflows, GL codes, and view all tenant expenses. |
| **Approver** | A user designated to review expenses. Can only act on expenses where they are the current assigned approver. |
| **Employee** | Basic user. Can submit expenses and view their own history. |

## 2. Resource Access Matrix

| Resource | Action | Facility Admin | Approver | Employee | Notes |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Expense** | **Create** | ✅ | ✅ | ✅ | Any user can submit. |
| | **Read (Own)** | ✅ | ✅ | ✅ | Users can always see their own submissions. |
| | **Read (All)** | ✅ | ✅ | ❌ | Admins/Approvers can audit all tenant expenses. |
| | **Read (Assigned)** | N/A | N/A | N/A | (Redundant: Approvers see all). |
| | **Approve/Reject** | ❌* | ✅ | ❌ | *Admins cannot approve unless they also have the Approver role. Any Approver can act on pending expenses. |
| | **Delete/Cancel** | ✅ | ❌ | ✅* | *Employees can cancel their own PENDING expenses. |
| **Workflow** | **Create/Edit** | ✅ | ❌ | ❌ | Only Admins configure workflows. |
| | **Read** | ✅ | ❌ | ❌ | Internal use only (system reads it). |
| **GL Code** | **Create/Edit** | ❌ (Script) | ❌ | ❌ | Backfilled via DB Scripts. |
| | **Read** | ✅ | ✅ | ✅ | Visible in dropdowns. |
| **Expense Type** | **Create/Edit** | ❌ (Script) | ❌ | ❌ | Backfilled via DB Scripts. |
| | **Read** | ✅ | ✅ | ✅ | Visible in dropdowns. |

## 3. Tenant Isolation Strategy

*   **Strict Logic**: Every database query **MUST** include `tenantId` in the filter clause.
*   **Context**: `tenantId` is derived reliably from the authenticated user session (verified by IDP), NOT from client input.
*   **Data Leakage Prevention**:
    *   API Routes/Server Actions must validate that the `expenseId` being accessed belongs to the user's `tenantId`.
    *   S3 Keys must be prefixed with `tenants/{tenantId}/...` to allow for clean separation and potentially separate bucket policies if needed.

## 4. Authentication Flow
1.  **Login**: User logs in key Azure Entra ID (OIDC).
2.  **Token Claims**: ID Token contains `email`, `oid`, and custom claims for `roles` and `tenantId`.
3.  **Session**: NextAuth.js encrypts these claims into the session cookie.
4.  **Verification**: Middleware / Server Actions decrypt session to assert identity.
