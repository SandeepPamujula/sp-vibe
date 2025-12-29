---
description: Global Project Context - Expense Management System
globs: ["**/*"]
alwaysApply: true
---

# Global Project Context - Expense Management System

> **Purpose**: This file provides comprehensive project context to reduce Cursor's need to repeatedly analyze the codebase. Reference this file for architectural patterns, conventions, and key implementation details.

---

## Project Overview

**Name**: Multi-Tenant Expense Management System  
**Phase**: Phase 1 - Petty Expense Workflow  
**Type**: Full-stack Next.js application with PostgreSQL backend

### Core Functionality
- Multi-tenant expense submission and approval workflow
- Role-based access control (Admin/Approver)
- File attachment management (S3/local)
- Audit trail and history tracking
- Report generation (Excel export)

### Current Workflows
- **Workflow 1**: Petty Expense (Active)
  - Admin (Facility) and Approver can submit
  - Approver can approve/reject
- **Workflow 2**: Internet Expense (Deferred to Phase 2)

---

## Tech Stack

### Core Framework
- **Next.js**: 16.1.0 with App Router
- **React**: 19.2.3
- **TypeScript**: 5.x (strict mode)
- **Node.js**: 20+

### Database & ORM
- **PostgreSQL**: 16 (local via Docker, RDS for production)
- **Drizzle ORM**: 0.45.1
- **Connection**: `postgres` package (3.4.7)

### Validation & Utilities
- **Zod**: 4.2.1 (schema validation)
- **UUID**: 13.0.0
- **JWT**: `jose` (6.1.3) for Edge, `jsonwebtoken` (9.0.3) for Node

### AWS Services
- **S3**: File storage (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **SES**: Email notifications (`@aws-sdk/client-ses`)
- **Local Dev**: Mock implementations for S3/SES

### UI & Styling
- **Tailwind CSS**: 4.x
- **tailwind-merge**: 3.4.0

### Testing
- **Jest**: 30.2.0 (unit/integration tests)
- **Testing Library**: React 16.3.1, Jest-DOM 6.9.1
- **Storybook**: 10.1.10 (component testing)
- **Vitest**: 4.0.16 (browser testing with Playwright)

### Development Tools
- **ESLint**: 9.x (Next.js config)
- **Prettier**: 3.7.4
- **Husky**: 9.1.7 (git hooks)
- **lint-staged**: 16.2.7
- **Drizzle Kit**: 0.31.8 (migrations)

---

## Database Schema Overview

### Multi-Tenancy Model
**Row-Level Isolation**: All tables include `tenant_id` for tenant isolation.

### Core Tables

#### `tenants`
- Primary tenant entity
- Fields: `id`, `name`, `slug` (unique), `isActive`, `createdAt`

#### `users`
- Tenant-scoped users
- Fields: `id`, `tenantId`, `email`, `name`, `role` (admin|approver), `isActive`, `lastLogin`
- Relations: tenant, submittedExpenses, approvedExpenses, expenseHistory, expenseApprovals

#### `gl_codes`
- General Ledger codes per tenant
- Fields: `id`, `tenantId`, `code`, `description`, `isActive`
- Used for expense categorization

#### `expense_workflows`
- Configurable approval workflows per tenant
- Fields: `id`, `tenantId`, `name`, `code` (petty|internet), `description`, `isActive`
- Currently: Single workflow per type (petty, internet)

#### `workflow_steps`
- Approval steps within workflows
- Fields: `id`, `workflowId`, `stepOrder`, `name`, `approverRole`, `amountThreshold`, `isFinal`, `isActive`
- Current: Single step per workflow (stepOrder=1, isFinal=true)

#### `expenses`
- Main expense records
- Fields: `id`, `tenantId`, `submittedBy`, `approvedBy`, `workflowId`, `currentStepId`, `workflowType`, `expenseDate`, `invoiceNumber`, `vendorName`, `amount` (decimal), `natureOfExpense` (string - GL code description), `glCodeId`, `purpose`, `status` (draft|submitted|approved|rejected)
- **Note**: `natureOfExpense` stores GL code description, `glCodeId` stores reference

#### `expense_approvals`
- Approval decisions per expense
- Fields: `id`, `expenseId`, `workflowStepId`, `approverId`, `status` (pending|approved|rejected|skipped), `comments`, `actedAt`
- One record per workflow step per expense

#### `expense_history`
- Audit trail for expense changes
- Fields: `id`, `expenseId`, `userId`, `action` (created|submitted|approved|rejected|updated), `comments`, `changes` (jsonb), `createdAt`

#### `expense_attachments`
- File attachments for expenses
- Fields: `id`, `expenseId`, `fileName`, `s3Key`, `contentType`, `fileSize`, `uploadedAt`

### Key Relationships
```
tenants → users, expenses, gl_codes, expense_workflows
expense_workflows → workflow_steps, expenses
expenses → users (submitter, approver), gl_codes, expense_workflows, workflow_steps (currentStep)
expenses → expense_approvals, expense_history, expense_attachments
```

---

## File Structure

```
expense-mgmt/
├── drizzle/
│   ├── schema.ts              # Database schema definitions
│   ├── seed.ts                 # Database seeding
│   └── migrations/             # Drizzle migrations
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Public auth routes
│   │   │   └── login/
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── expenses/      # Expense management pages
│   │   │   ├── approvals/      # Approval workflow pages
│   │   │   ├── reports/        # Report generation pages
│   │   │   └── DashboardShell.tsx
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── expenses/       # Expense CRUD endpoints
│   │   │   ├── attachments/    # File upload/download
│   │   │   ├── gl-codes/       # GL code endpoints
│   │   │   └── health/         # Health check
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── atoms/              # Basic UI elements
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DateInput.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Icon.tsx
│   │   │   └── NavLink.tsx
│   │   ├── molecules/          # Composite components
│   │   │   ├── FormField.tsx
│   │   │   ├── FileUploadZone.tsx
│   │   │   ├── NatureOfExpenseSelect.tsx
│   │   │   ├── UserCard.tsx
│   │   │   └── LogoutButton.tsx
│   │   └── organisms/          # Complex components
│   │       ├── ExpenseSubmissionForm.tsx
│   │       ├── LoginForm.tsx
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── db.ts               # Drizzle database client
│   │   ├── config.ts           # Configuration management
│   │   ├── env.ts              # Environment variables
│   │   ├── storage.ts          # S3/local file storage
│   │   └── auth/               # Authentication module
│   │       ├── mock-sso.ts     # Mock Azure AD SSO
│   │       ├── jwt.ts          # JWT utilities (Node)
│   │       ├── jwt-edge.ts     # JWT utilities (Edge)
│   │       ├── session.ts      # Session management
│   │       ├── request-context.ts  # API request context
│   │       └── permissions.ts  # RBAC permissions
│   ├── services/               # Business logic layer
│   │   ├── expense.service.ts  # Expense CRUD & workflow
│   │   └── attachment.service.ts  # File attachment logic
│   ├── schemas/                # Zod validation schemas
│   │   ├── expense.schema.ts
│   │   ├── attachment.schema.ts
│   │   ├── auth.schema.ts
│   │   ├── query.schema.ts
│   │   └── report.schema.ts
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.types.ts        # API response types
│   │   ├── auth.types.ts       # Auth types
│   │   ├── query.types.ts      # Query/pagination types
│   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── expense.dto.ts
│   │   │   ├── attachment.dto.ts
│   │   │   └── ...
│   │   └── entities/           # Entity types with relations
│   │       ├── base.entity.ts  # Base Drizzle types
│   │       ├── expense.entity.ts
│   │       ├── user.entity.ts
│   │       └── ...
│   ├── constants/              # Application constants
│   │   ├── api.constants.ts    # API error codes, HTTP status
│   │   ├── auth.constants.ts   # Permissions, roles
│   │   ├── query.constants.ts  # Pagination defaults
│   │   └── file.constants.ts   # File upload restrictions
│   ├── hooks/                  # React hooks
│   │   └── useFileUpload.ts
│   └── stories/                # Storybook stories
└── prompts/                    # Milestone prompt history
```

---

## Shared Architecture Patterns

### Multi-Tenancy (CRITICAL)

**Rule**: Every database query MUST include `tenant_id` filtering.

```typescript
// ✅ CORRECT
const expenses = await db.query.expenses.findMany({
  where: eq(expenses.tenantId, currentUser.tenantId),
});

// ❌ INCORRECT - NEVER DO THIS
const expenses = await db.query.expenses.findMany();
```

**Implementation**:
- Tenant context extracted from authenticated user session
- Middleware enforces tenant isolation on all API routes
- Services receive `tenantId` as parameter
- Database queries always filter by `tenantId`

### Type Organization

**Separation Rules**:
- **Constants** (`constants/*.constants.ts`): Runtime values, `as const` objects
- **Types** (`types/*.types.ts`): Pure type definitions derived from constants using `typeof`
- **DTOs** (`types/dto/*.dto.ts`): Request/response shapes per domain
- **Entities** (`types/entities/*.entity.ts`): Database entity types with relations

**Reference**: See `constants/api.constants.ts` and `types/api.types.ts` for pattern.

### Validation Pattern (Zod)

**Schema Location**: `src/schemas/`

**Pattern**:
- Define schemas with `z.object()`, use `z.coerce` for type conversion (dates, numbers)
- GL Code fields: `natureOfExpense` (string UUID), `glCodeId` (string UUID optional)
- Validate all API request bodies (backend) and form inputs (frontend)

**Reference**: See `src/schemas/expense.schema.ts` for examples.

### Expense Workflow

**State Flow**:
```
draft → submitted → approved/rejected
```

**Submission Process**:
1. Validate expense is in `draft` status
2. Validate required fields (natureOfExpense, amount)
3. Get workflow for expense type
4. Get first workflow step
5. Create `expense_approval` record (status: pending)
6. Update expense: `workflowId`, `currentStepId`, `status: submitted`
7. Log history entry

**Approval Process**:
1. Validate expense is in `submitted` status
2. Validate user has approver role
3. Update `expense_approval` record (status: approved/rejected, approverId, actedAt)
4. Update expense: `approvedBy`, `status: approved/rejected`
5. Log history entry

### GL Code Mapping

**Important**: The `natureOfExpense` field stores the GL code **description** (string), while `glCodeId` stores the reference (UUID).

**Pattern**:
1. Lookup GL code by ID with tenant filtering and `isActive` check
2. Store both `glCodeId` (UUID reference) and `natureOfExpense` (description string) in expense record

**Reference**: See `src/services/expense.service.ts` for implementation.

---

## Frontend Guidelines

> **Reference this section** when working on React components, pages, UI/UX, client-side logic, or frontend testing.

### Component Architecture (Atomic Design)

**Atoms** (`components/atoms/`):
- Basic UI elements: Button, Input, Select, DateInput, CurrencyInput, Textarea, Badge, Avatar, Spinner, Icon, NavLink
- Props pattern: `label`, `error`, `helperText`, `isRequired`, `forwardRef`
- Use `next/image` except for blob URLs (use native `<img>` with eslint-disable)

**Molecules** (`components/molecules/`):
- Composite components: FormField, FileUploadZone, NatureOfExpenseSelect, UserCard, LogoutButton
- Combine atoms with layout logic

**Organisms** (`components/organisms/`):
- Complex components: ExpenseSubmissionForm, LoginForm, Header, Sidebar
- Contain business logic and state management

### React Patterns

**Client Components**:
- Add `'use client'` directive before hooks usage
- Import order: React → external → internal → types

**Server Components**:
- Default in Next.js App Router
- Can directly access database/server resources
- Cannot use hooks or browser APIs

**Form Handling**:
- Use React Hook Form for complex forms
- Validate with Zod schemas on client-side
- Show validation errors inline
- Handle loading and error states

**State Management**:
- Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
- Consider Context API for shared state
- Use server actions for mutations when possible

### UI/UX Patterns

**Styling**:
- Use Tailwind CSS utility classes
- Use `tailwind-merge` for conditional classes
- Follow consistent spacing and color schemes

**Accessibility**:
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper focus management

**Loading States**:
- Show spinners for async operations
- Use skeleton loaders for content
- Disable buttons during submissions

**Error Handling**:
- Display user-friendly error messages
- Show validation errors inline
- Handle network errors gracefully
- Provide retry mechanisms when appropriate

### Client-Side Validation

**Pattern**:
- Use React Hook Form with `zodResolver` and Zod schemas from `@/schemas`
- Validate on blur and submit, show errors inline
- Prevent submission if validation fails
- Share Zod schemas with backend for consistency

**Reference**: See `src/components/organisms/ExpenseSubmissionForm.tsx` for example.

### File Upload (Frontend)

**Pattern**:
- Use `useFileUpload` hook for upload logic
- Validate file type and size before upload
- Show upload progress
- Handle presigned URL flow:
  1. Get presigned URL from `/api/attachments/upload-url`
  2. Upload file directly to S3
  3. Confirm upload via `/api/attachments/confirm`

**Restrictions**:
- Allowed types: PDF, PNG, JPEG, HEIC
- Max size: 10 MB per file
- Max files: 5 per submission

### Frontend Testing

**Jest Unit Tests**:
- Location: `__tests__/` folders next to source files
- Use React Testing Library, test user interactions not implementation
- Mock File/Blob APIs for upload tests (see existing test files)

**Storybook Component Tests**:
- Location: `*.stories.tsx` files next to components
- Usage: Visual component testing and documentation

**Reference**: See `src/components/molecules/__tests__/` for examples.

### Frontend Pitfalls to Avoid

1. **❌ Client components without 'use client'** - Add directive when using hooks
2. **❌ Using HTML entities in JSX** - Use `{"text's here"}` instead
3. **❌ Skipping client-side validation** - Always validate before submission
4. **❌ Not handling loading states** - Show feedback during async operations
5. **❌ Missing error boundaries** - Wrap components in error boundaries
6. **❌ Not optimizing images** - Use `next/image` for all images except blob URLs
7. **❌ Hardcoding API URLs** - Use environment variables for API endpoints

---

## Backend Guidelines

> **Reference this section** when working on API routes, services, database queries, authentication, or backend testing.

### API Route Pattern

**Standard Structure**:
1. Get authenticated user context via `requireRequestContext(request)` → `{ user, tenantId }`
2. Parse and validate request body with Zod schema
3. Call service layer with `tenantId` and `userId`
4. Return standardized response: `{ success: true, data: {...} }` or `{ success: false, error: { code, message } }`
5. Handle errors: ZodError → 400, others → 500

**API Response Format**:
- Success: `{ success: true, data: {...}, message?: string }`
- Error: `{ success: false, error: { code: string, message: string } }`

**Reference**: See `src/app/api/expenses/route.ts` for complete example.

### Service Layer Pattern

**Structure**:
- Services contain business logic, accept `tenantId` as first parameter
- Always filter queries by `tenantId`, use Drizzle ORM
- Return typed results or throw errors
- Handle database transactions for multi-step operations
- Log audit trail entries for important actions

**Reference**: See `src/services/expense.service.ts` for complete example.

### Database Queries

**Always use tenant filtering**:
- Use Drizzle relations: `db.query.expenses.findMany({ where: eq(expenses.tenantId, tenantId), with: {...} })`
- Manual joins: `db.select().from(...).where(and(eq(expenses.tenantId, tenantId), ...))`
- Always include `tenantId` in WHERE clauses (CRITICAL)
- Use transactions for multi-step operations
- Handle database errors appropriately

**Reference**: See `src/services/expense.service.ts` for query examples.

### Error Handling

**Standardized Errors**:
- Service layer throws errors: `throw new Error('message')`
- API route catches and formats: ZodError → 400 with `VALIDATION_ERROR`, others → 500 with `INTERNAL_ERROR`
- Return format: `{ success: false, error: { code: string, message: string } }`

**Error Codes** (`constants/api.constants.ts`):
- `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `INTERNAL_ERROR` (500)

**Reference**: See `src/app/api/expenses/route.ts` for error handling pattern.

### Authentication & Authorization

**Auth Flow**:
1. Mock SSO (`lib/auth/mock-sso.ts`) - Simulates Azure AD
2. JWT tokens (`lib/auth/jwt.ts` or `jwt-edge.ts`)
3. Session management (`lib/auth/session.ts`)
4. Request context (`lib/auth/request-context.ts`)
5. Permissions (`lib/auth/permissions.ts`)

**Roles**:
- **Admin (Facility)**: Submit expenses, view audit trail
- **Approver (Accountant)**: Submit, approve/reject, view all expenses, generate reports

**Permission Checks**:
- Use `hasPermission(user.role, ROUTE_PERMISSIONS.EXPENSES.APPROVE)` from `@/lib/auth`
- Throw error if permission check fails

**Request Context Pattern**:
- Use `requireRequestContext(request)` → returns `{ user, tenantId }`
- `user` contains: `id`, `email`, `name`, `role`, `tenantId`
- `tenantId` extracted from user's tenant

**Reference**: See `src/lib/auth/request-context.ts` and `src/lib/auth/permissions.ts`.

### File Upload (Backend)

**API Endpoints**:
- `POST /api/attachments/upload-url` - Get presigned URL for S3 upload
- `POST /api/attachments/confirm` - Confirm upload and create attachment record
- `GET /api/attachments/[attachmentId]` - Get attachment info
- `GET /api/attachments/download-local` - Download (dev only)

**Storage**:
- Production: S3 (`lib/storage.ts`)
- Development: Local folder (`public/uploads/`)

**Restrictions**:
- Allowed types: PDF, PNG, JPEG, HEIC
- Max size: 10 MB per file
- Max files: 5 per submission

**Pattern**:
1. Validate file metadata (type, size)
2. Generate presigned URL for S3
3. Client uploads directly to S3
4. Client confirms upload
5. Create attachment record in database

### Backend Validation

**Pattern**:
- Always validate request bodies with Zod schemas: `createExpenseSchema.parse(body)`
- Validate permissions before operations
- Validate business rules (e.g., expense status, workflow state)
- ZodError thrown on validation failure, caught in API route error handler

**Reference**: See `src/app/api/expenses/route.ts` for validation pattern.

### Backend Testing

**Unit Tests**:
- Test service layer functions
- Mock database calls
- Test error handling
- Test business logic

**Integration Tests**:
- Test API routes end-to-end
- Use test database
- Clean up after tests
- Test authentication and authorization

**Test Commands**:
- `pnpm test` - Run Jest tests
- `pnpm test:watch` - Watch mode
- `pnpm test:coverage` - Coverage report

### Backend Pitfalls to Avoid

1. **❌ Querying without tenant_id** - Always filter by tenant (CRITICAL)
2. **❌ Skipping validation** - Always validate with Zod
3. **❌ Missing error handling** - Handle all error cases
4. **❌ Not logging audit trail** - Log all important actions
5. **❌ Exposing sensitive data** - Never return passwords or tokens
6. **❌ Not checking permissions** - Verify user permissions before operations
7. **❌ Hardcoding values** - Use constants or env variables
8. **❌ Not handling transactions** - Use transactions for multi-step operations

---

## Development Workflow

### Database Commands
```bash
pnpm db:generate    # Generate migrations
pnpm db:migrate      # Run migrations
pnpm db:push         # Push schema changes
pnpm db:studio       # Open Drizzle Studio
pnpm db:seed         # Seed database
```

### Docker Commands
```bash
pnpm docker:up       # Start PostgreSQL
pnpm docker:down     # Stop PostgreSQL
pnpm docker:logs     # View logs
pnpm docker:reset    # Reset database
```

### Code Quality
```bash
pnpm lint            # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
```

### Git Hooks
- **Pre-commit**: Runs Prettier, ESLint, and Jest tests on staged files
- Configured via Husky and lint-staged

---

## Key Constants

### API Error Codes (`constants/api.constants.ts`)
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `NOT_FOUND`
- `FORBIDDEN`
- `INTERNAL_ERROR`

### Roles (`constants/auth.constants.ts`)
- `ADMIN` - Facility Admin
- `APPROVER` - Accountant/Approver

### Permissions (`constants/auth.constants.ts`)
- `EXPENSES.SUBMIT`
- `EXPENSES.APPROVE`
- `EXPENSES.VIEW_ALL`
- `REPORTS.GENERATE`

### File Upload (`constants/file.constants.ts`)
- `MAX_FILE_SIZE`: 10 MB
- `MAX_FILES`: 5
- `ALLOWED_TYPES`: ['application/pdf', 'image/png', 'image/jpeg', 'image/heic']

### Pagination (`constants/query.constants.ts`)
- `DEFAULT_LIMIT`: 50
- `MAX_LIMIT`: 100

---

## Environment Variables

**Required** (`.env.local`):
```env
DATABASE_URL=postgresql://expense:expense123@localhost:5433/expense_mgmt
JWT_SECRET=your-jwt-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AWS (for production)
AWS_REGION=us-east-1
AWS_S3_BUCKET=expense-attachments
AWS_SES_FROM_EMAIL=noreply@example.com

# Local development (optional)
LOCAL_STORAGE_PATH=./public/uploads
```

---

## Reference Files

### Backend Reference Files
- `drizzle/schema.ts` - Complete database schema
- `src/lib/db.ts` - Database client setup
- `src/services/expense.service.ts` - Service layer example
- `src/lib/auth/request-context.ts` - Auth context pattern
- `src/app/api/expenses/route.ts` - API route example
- `src/schemas/expense.schema.ts` - Validation schema example

### Frontend Reference Files
- `src/components/organisms/ExpenseSubmissionForm.tsx` - Component example
- `src/components/atoms/Button.tsx` - Atom component example
- `src/components/molecules/FormField.tsx` - Molecule component example
- `src/hooks/useFileUpload.ts` - Custom hook example

---

## Notes

- **Prompt History**: After completing tasks, update `prompts/milestone-{N}.md`
- **Testing**: Always ask user if they want Jest/Storybook tests after completing a task
- **Multi-tenancy**: This is the #1 critical rule - never forget tenant_id filtering
- **Workflow**: Currently single-level approval, but schema supports multi-level
- **Guidelines**: Reference Frontend Guidelines for UI/component work, Backend Guidelines for API/service work

---

*Last Updated: Reorganized for frontend/backend separation to reduce token consumption*
