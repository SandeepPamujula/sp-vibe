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
| 2.2 | Implement login page with test user selection | ✅ Complete |
| 2.3 | Create session management (JWT tokens) | ✅ Complete |
| 2.4 | Implement tenant context middleware | ✅ Complete |
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

### Task 2.2: Implement login page with test user selection

**Prompt:** "build 2.2"

**Implementation:**

1. Created reusable UI components (Atomic Design pattern):
   - `src/components/atoms/Button.tsx` - Primary button with variants, sizes, loading state
   - `src/components/atoms/Select.tsx` - Dropdown select with label and error state
   - `src/components/atoms/Badge.tsx` - Status indicator with variants
   - `src/components/atoms/Spinner.tsx` - Loading spinner
   - `src/components/molecules/UserCard.tsx` - User selection card with role badge
   - `src/components/organisms/LoginForm.tsx` - Complete login form
2. Updated `src/app/(auth)/login/page.tsx` to use LoginForm component

**Features:**
- Azure AD branding (Microsoft logo, "Azure AD" label)
- Organization (tenant) dropdown with auto-select for single tenant
- User selection cards showing name, email, and role badge
- Two-click login: first click selects, second click signs in
- Loading states for tenants, users, and login
- Error handling and display
- Development mode notice
- Color-coded avatars and badges by role (admin=blue, approver=green)

### Task 2.3: Create session management (JWT tokens)

**Prompt:** "build 2.3"

**Implementation:**

1. Created `src/lib/auth/jwt.ts` - JWT utilities:
   - `signToken(user)` - Creates signed JWT with user data
   - `verifyToken(token)` - Verifies and decodes JWT
   - `decodeToken(token)` - Decodes without verification
   - `isTokenExpired(token)` - Checks expiration
   - `getTokenTTL(token)` - Gets remaining time
2. Created `src/lib/auth/session.ts` - Session management:
   - `createSession(user)` - Creates JWT and sets HTTP-only cookie
   - `getSession()` - Reads session from cookie
   - `clearSession()` - Deletes session cookie (logout)
   - `refreshSession(user)` - Updates session with new data
   - `requireSession()` - Throws if no valid session
   - `getTenantContext()` - Gets tenant from session
3. Created `src/app/api/auth/session/route.ts`:
   - `GET /api/auth/session` - Returns current session
   - `DELETE /api/auth/session` - Logs out user
4. Updated `POST /api/auth/mock-sso` to create session and return JWT

**Security Features:**
- HTTP-only cookies (not accessible via JavaScript)
- Secure flag in production
- SameSite=Lax for CSRF protection
- 24-hour token expiration
- 7-day cookie max age

### Task 2.4: Implement tenant context middleware

**Prompt:** "build 2.4"

**Implementation:**

1. Installed `jose` library for Edge-compatible JWT verification
2. Created `src/lib/auth/jwt-edge.ts` - Edge runtime JWT utilities:
   - `verifyTokenEdge(token)` - Verifies JWT using jose library
   - `decodeTokenEdge(token)` - Decodes without verification
   - `isTokenExpiredEdge(token)` - Checks expiration
3. Created `src/lib/auth/request-context.ts` - Request context helpers:
   - `getRequestUser()` - Extracts user from request headers
   - `getRequestTenant()` - Extracts tenant from headers
   - `getRequestContext()` - Gets full user+tenant context
   - `requireRequestContext()` - Throws if not authenticated
   - `requireTenantId()` - Gets tenant ID or throws
4. Renamed `src/middleware.ts` → `src/proxy.ts` (Next.js 16 requirement)
5. Implemented proxy with:
   - Authentication check on protected routes
   - Redirect to login for unauthenticated users
   - Redirect to expenses for authenticated users on login page
   - Tenant context injection via headers (x-user-id, x-tenant-id, etc.)

**Route Protection:**
| Route | Behavior |
|-------|----------|
| `/login` | Public, redirects to /expenses if logged in |
| `/api/auth/*` | Public (for login flow) |
| `/api/health` | Public (health check) |
| `/expenses`, `/reports`, etc. | Protected, redirects to login |

**Request Headers Injected:**
- `x-user-id`, `x-user-email`, `x-user-name`, `x-user-role`
- `x-tenant-id`, `x-tenant-slug`

