# Milestone 2: Authentication and Authorization

## Overview

Implement mock SSO and role-based access control.

---

## Testing Reminder

> **After each task, ask:** "Would you like me to add Jest unit tests and/or Storybook component tests for this task?"

---

## Tasks

| Task ID | Description | Status |
|---------|-------------|--------|
| 2.1 | Create mock Azure Entra SSO provider | ✅ Complete |
| 2.2 | Implement login page with test user selection | Pending |
| 2.3 | Create session management (JWT tokens) | Pending |
| 2.4 | Implement tenant context middleware | Pending |
| 2.5 | Create role-based route protection | Pending |
| 2.6 | Create protected layout component | Pending |
| 2.7 | Implement logout functionality | Pending |
| 2.8 | Write authentication tests | Pending |

---

## Prompt History

### Task 2.1: Create mock Azure Entra SSO provider

**Prompt:** "great job so far. Let us build Milestone 2.1"

**Implementation:**

1. Created `src/lib/db.ts` - Drizzle ORM database client singleton
2. Created `src/lib/auth/mock-sso.ts` - Mock Azure Entra SSO provider with:
   - `getTestUsers()` - Returns test users with tenant info for login UI
   - `getAvailableTenants()` - Returns active tenants for tenant selection
   - `mockSsoAuthenticate()` - Simulates Azure AD authentication
   - `getUserById()` - Looks up user by ID for session validation
   - Mock Azure AD profile format (`AzureAdUserProfile` interface)
3. Created `src/lib/auth/index.ts` - Module exports
4. Updated `src/lib/index.ts` - Added db and auth exports
5. Created API routes:
   - `GET /api/auth/tenants` - Returns available tenants
   - `GET /api/auth/users` - Returns test users (dev only)
   - `POST /api/auth/mock-sso` - Authenticates user and returns profile

**Bug Fix:** Moved `app/favicon.ico` to `src/app/` and removed empty `app/` directory to fix Next.js routing conflict.

