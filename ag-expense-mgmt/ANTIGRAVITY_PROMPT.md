# Antigravity Project Prompt: Multi-Tenant Expense Management System

## Project Overview

Create a **comprehensive multi-tenant expense management system** from scratch that enables facility admins to submit petty expenses with invoice attachments, and approvers to review, approve, or reject these expenses. The system must support configurable approval workflows with threshold-based logic, multi-tenant isolation, and complete audit trail capabilities.

---

## Core Requirements

### 1. Multi-Tenancy
- **Strict tenant isolation**: All database queries MUST include `tenantId` in filter clauses
- Each tenant can have different workflows and approval configurations
- S3 keys prefixed with `tenants/{tenantId}/...` for clean data separation
- `tenantId` derived from authenticated user session (NOT from client input)

### 2. User Roles & Authentication
- **Facility Admin**: Super user for a tenant; can configure workflows, GL codes, submit expenses, and view all tenant expenses
- **Approver**: Can review and approve/reject expenses; can view all expenses for their tenant
- **Employee**: Can submit expenses and view their own submission history

**Authentication**: Azure Entra ID SSO (Mock SSO for initial development)
- Create test users for each role
- Use NextAuth.js or custom OIDC provider
- Session should contain: `email`, `oid`, `roles`, `tenantId`

### 3. Expense Workflow System

#### Workflow Configuration
Each tenant can configure multiple workflows. A workflow consists of:
- **Workflow Steps**: Ordered approval stages with:
  - `stepOrder`: Integer defining sequence
  - `approverRole`: Role required for this step (e.g., "MANAGER", "FINANCE")
  - `thresholdAmount`: Minimum expense amount requiring this approval
  - `isFinalStep`: Boolean indicating if this is the final approval stage

#### Workflow Execution Logic
1. When an expense is submitted, identify the associated workflow based on expense type
2. Iterate through workflow steps in order
3. For each step:
   - If `expense.amount >= step.thresholdAmount`: Set status to `PENDING_APPROVAL` at this step
   - If `expense.amount < step.thresholdAmount`: Skip this step (auto-approve)
4. If all steps are skipped, status becomes `APPROVED`
5. **Any user with Approver role** can act on pending expenses (no strict role-to-step assignment)

#### Resubmission Flow
- Rejected expenses can be edited and resubmitted by the original submitter
- Resubmission restarts the workflow from the beginning

---

## Use Cases

### UC1: User Login
- As an employee, I should be able to login using Azure Entra SSO
- Mock SSO implementation for development
- Test users created for each role (Facility Admin, Approver, Employee)

### UC2: Submit Expense
- As a facility admin or employee, I should be able to submit an expense with:
  - Date of expense
  - Invoice number
  - Vendor name
  - Amount spent
  - Expense description
  - Expense category (selected from dropdown)
  - Invoice attachment (uploaded to S3)
- Expense category automatically maps to GL code in backend
- System determines workflow and sets initial approval status

### UC3: Approve/Reject Expense
- As an approver, I should be able to:
  - View all pending expenses for my tenant
  - Approve or reject expenses with optional comments
  - See full expense details including invoice attachments

### UC4: Expense History & Audit Trail
- As an admin or approver, I should be able to view complete expense history
- Full audit trail showing all state changes (submitted, approved, rejected, resubmitted)
- Track who performed each action and when

### UC5: Generate Reports
- As an approver, I should be able to generate expense reports for a date range
- Reports should include GL code mappings for financial reporting

---

## Technology Stack

### Frontend & Backend
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Frontend State**: React Context/Hooks for UI state
- **Server State**: Server Components with Server Actions for mutations
- **Validation**: Zod for schema validation (shared between frontend and backend)
- **Styling**: TailwindCSS
- **Form Handling**: react-hook-form with zodResolver

### Database & Storage
- **Database**: MongoDB with Mongoose ORM
- **Connection**: Cached singleton pattern for serverless compatibility
- **File Storage**: Amazon S3 for invoice attachments
- **Email Service**: Amazon SES for notifications

### Infrastructure
- **Cloud**: AWS
- **IaC**: AWS CDK (TypeScript)
- **Frontend Deployment**: S3 + CloudFront for static assets
- **Backend Deployment**: Lambda (via Next.js adapter like OpenNext)
- **API Gateway**: API Gateway + Lambda for serverless backend

### Testing & Quality
- **Unit Tests**: Jest
- **Component Tests**: React Testing Library
- **Component Documentation**: Storybook with:
  - Interaction Tests (`play` functions)
  - Accessibility Testing (a11y addon)
- **E2E Tests**: Playwright for critical user flows
- **Code Quality**: ESLint, Prettier
- **Test Database**: mongodb-memory-server or containerized MongoDB

---

## Architecture & Design Patterns

### Frontend Architecture (Atomic Design)

```
app/
├── (auth)/             # Authentication Routes
├── (dashboard)/        # Main App Routes (Sidebar layout)
│   ├── expenses/       # Expense management
│   ├── approvals/      # Approval inbox
│   └── settings/       # Admin configurations
components/
├── atoms/              # Base UI elements (Button, Input, Badge)
├── molecules/          # Simple combinations (InputGroup, SearchBar)
├── organisms/          # Complex widgets (ExpenseForm, ExpenseTable)
├── templates/          # Page layouts (if reusable)
└── providers/          # Context Providers (AuthProvider, ThemeProvider)
lib/
├── api/                # API Client / Server Action wrappers
├── hooks/              # Custom React Hooks
└── utils/              # Helper functions
```

### Backend Architecture
- **Server Actions**: Primary method for form submissions and mutations
- **API Routes**: For external integrations or REST-like endpoints
- **Service Layer**: Modular services for:
  - Expense Module: Submission, Validation, Storage
  - Approval Module: Workflow evaluation, Status updates
  - Notification Module: Email alerts via Amazon SES
  - Reporting Module: Data aggregation and reports

### Database Schema (MongoDB Collections)

#### Tenants
```typescript
{
  id: string (PK),
  name: string
}
```

#### Users
```typescript
{
  id: string (PK),
  tenantId: string (FK),
  email: string,
  role: "ADMIN" | "APPROVER" | "EMPLOYEE"
}
```

#### Expense Types
```typescript
{
  id: string (PK),
  tenantId: string (FK),
  name: string,
  glCodeId: string (FK),
  workflowId: string (FK)
}
```
**Note**: Backfilled via seed scripts; no API endpoints for CRUD operations

#### GL Codes
```typescript
{
  id: string (PK),
  tenantId: string (FK),
  code: string,
  description: string
}
```
**Note**: Backfilled via seed scripts; no API endpoints for CRUD operations

#### Workflows
```typescript
{
  id: string (PK),
  tenantId: string (FK),
  name: string,
  isDefault: boolean
}
```

#### Workflow Steps
```typescript
{
  id: string (PK),
  workflowId: string (FK),
  stepOrder: integer,
  approverRole: string,
  thresholdAmount: float,
  isFinalStep: boolean
}
```

#### Expenses
```typescript
{
  id: string (PK),
  tenantId: string (FK),
  submitterUserId: string (FK),
  expenseTypeId: string (FK),
  workflowId: string (FK),
  currentStepOrder: integer,
  amount: float,
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED",
  invoiceNumber: string,
  vendorName: string,
  description: string,
  expenseDate: Date,
  invoiceUrl: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Audit Logs
```typescript
{
  id: string (PK),
  expenseId: string (FK),
  userId: string (FK),
  action: "SUBMITTED" | "APPROVED" | "REJECTED" | "RESUBMITTED",
  comments: string,
  timestamp: Date,
  metadata: object
}
```

---

## API Specification (Server Actions)

### Standard Response Format
```typescript
type ActionResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};
```

### Key Server Actions

#### Expense Management
1. **submitExpense(data: CreateExpenseSchema)**: Submit new expense
2. **approveExpense(expenseId: string, comment?: string)**: Approve an expense
3. **rejectExpense(expenseId: string, reason: string)**: Reject an expense
4. **getMyExpenses(filters: FilterSchema)**: Get user's submitted expenses
5. **getPendingApprovals()**: Get all pending approvals for approver

#### Workflow Management (Admin Only)
1. **upsertWorkflow(data: WorkflowSchema)**: Create or update workflow
2. **getWorkflows()**: List all workflows for tenant

#### Configuration (Read-Only)
1. **getExpenseTypes()**: Get all expense types (populated via seeds)
2. **getGLCodes()**: Get all GL codes (populated via seeds)

#### File Upload
1. **getUploadUrl(filename: string, fileType: string)**: Get S3 presigned upload URL

---

## Non-Functional Requirements

### Performance
- API Read Operations: < 200ms (P95)
- API Write Operations: < 500ms (P95)
- File Upload Start: < 1s
- Frontend Core Web Vitals:
  - Largest Contentful Paint (LCP): < 2.5s
  - First Input Delay (FID): < 100ms
  - Cumulative Layout Shift (CLS): < 0.1
- Support 100+ concurrent users per tenant

### Security & Compliance
- **Encryption**:
  - At Rest: AES-256 for MongoDB Atlas and S3 buckets
  - In Transit: TLS 1.3 for all HTTP traffic
- **Authentication**:
  - Token expiry < 1 hour
  - Refresh token rotation enabled
- **Input Validation**: All inputs validated via Zod; strict CSP headers
- **Audit Trail**: 100% of write operations logged

### Reliability & Availability
- Availability Target: 99.9% uptime during business hours
- RPO (Recovery Point Objective): 1 hour (MongoDB Atlas snapshots)
- RTO (Recovery Time Objective): 4 hours
- Stateless compute deployed across multiple AZs

### Scalability
- Logical tenant isolation enforced on ALL queries
- Database indexes optimized: `{ tenantId: 1, ... }` on all collections
- S3 keys partitioned by tenant for future migration capability

### Observability
- Structured JSON logging for all operations (requestId, tenantId, userId, latency)
- Distributed tracing (AWS X-Ray or OpenTelemetry)
- Alerts for:
  - API Error Rate > 1%
  - Latency P95 > 1s
  - Lambda Throttling

### Usability & Accessibility
- WCAG 2.1 AA Compliance
- All interactive elements have aria-labels and keyboard navigation
- Fully functional on Mobile (iOS/Android) and Desktop
- i18n-ready (initially USD/ISO dates)

### Maintainability
- Code Coverage: > 80% on business logic
- API Spec and architecture docs kept in sync with code

---

## Infrastructure Design

### Deployment Architecture
```
User → CloudFront → Lambda@Edge/Lambda (Next.js SSR/API)
                ↓
        S3 (Static Assets)
        S3 (Invoice Documents)
        Amazon SES (Email)
        MongoDB Atlas
```

### CDK Stack Structure

#### 1. StorageStack (`lib/storage-stack.ts`)
- **InvoiceBucket**: S3 bucket for invoice attachments
  - Naming: `{env}-invoices` (e.g., `dev-invoices`, `prod-invoices`)
  - Encryption: S3 Managed
  - CORS: Allow GET/PUT from web domain
  - Lifecycle policies for cost optimization

#### 2. NextJsStack (`lib/nextjs-stack.ts`)
- **NextJsLambda**: Lambda function hosting Next.js app
  - Build strategy: `output: 'standalone'`
  - Deploy with OpenNext or CDK adapter
- **StaticAssetsBucket**: S3 for public assets (`/_next/static/*`)
- **CloudFront Distribution**:
  - `/api/*` → Lambda
  - `/_next/*` → S3
  - `/*` → Lambda (SSR)

### Environments
- **DEV**: Development environment
- **PROD**: Production environment
- No Staging/UAT initially

### Naming Convention
- Stacks: `ExpenseMgmt-{Env}-Storage`, `ExpenseMgmt-{Env}-NextJs`
- Resources: Tagged with `Environment={Env}`

### CI/CD Pipeline
- **Tool**: GitHub Actions
- **Trigger**: Pull Request to `main`
- **Steps**:
  1. Lint code (ESLint, Prettier)
  2. Run unit & component tests
  3. Run integration tests (ephemeral DB)
  4. Build app to verify compilation
  5. Deploy to DEV on merge
  6. Manual promotion to PROD

---

## Implementation Plan: Milestones

### Milestone 1: Foundation & Core Setup
**Goal**: Initialize project, infrastructure, authentication, and core database schemas

**Tasks**:
1. **Infrastructure (CDK)**
   - 1.1: Initialize CDK project in `infra/`
   - 1.1.1: Define `NextJsStack` (Lambda/S3/CloudFront)
   - 1.1.2: Define `StorageStack` (S3 for documents)
   - 1.1.3: Configure deployment scripts (`npm run deploy`)
   - 1.1.4: Test CDK synthesis (`cdk synth`)
   - 1.1.5: Setup CI/CD pipeline (GitHub Actions)

2. **Application Core (Next.js)**
   - 1.2: Initialize Next.js project with TypeScript, TailwindCSS, ESLint, Prettier
   - 1.2.1: Configure Atomic Design structure
   - 1.2.2: Implement `APIResponse` wrapper and global error handler
   - 1.2.3: Test build process
   - 1.3: Configure libraries (Zod, Jest, React Testing Library)
   - 1.3.1: Setup Storybook with interaction and a11y testing
   - 1.3.2: Implement structured logger (JSON format with RequestId/TenantId)
   - 1.3.3: Configure security headers (CSP)

3. **Authentication & Database**
   - 1.4: Implement mock authentication with role selection
   - 1.5: Configure Mongoose connection and define Tenant/User schemas
   - 1.6: Create seed scripts for expense types, GL codes, tenants, and users

**Deliverables**: Deployed Next.js app, working login, database connected

### Milestone 2: Configuration & Master Data
**Goal**: Implement foundational data structures for workflows and finance

**Tasks**:
1. **Backend**
   - 2.1: Define Mongoose schemas for ExpenseType, GLCode, Workflow, WorkflowStep
   - 2.2: Create seed scripts for reference data
   - 2.3: Implement Workflow CRUD Server Actions (Admin only)
   - 2.4: Implement Audit Log service

2. **Frontend**
   - 2.5: Create Workflow configuration UI (Admin only)
   - 2.6: Build workflow step editor with threshold configuration
   - 2.7: Add Storybook stories for configuration components

**Deliverables**: Workflow configuration functional, reference data loaded

### Milestone 3: Expense Submission (Facility Admin)
**Goal**: Enable facility admins to create expenses with attachments and auto-workflow assignment

**Tasks**:
1. **Backend**
   - 3.1: Define Expense Mongoose schema
   - 3.2: Implement S3 presigned URL generation
   - 3.3: Implement expense submission server action with workflow logic
   - 3.4: Implement SES email notifications

2. **Frontend**
   - 3.5: Create ExpenseForm organism (Atomic Design)
   - 3.6: Implement file upload with progress indication
   - 3.7: Build expense list view (My Expenses)
   - 3.8: Add Storybook stories with interaction tests

**Deliverables**: Users can submit expenses with invoices, workflow auto-assigned

### Milestone 4: Approval Workflow (Approver)
**Goal**: Enable approvers to review pending expenses and make decisions

**Tasks**:
1. **Backend**
   - 4.1: Implement approve/reject server actions
   - 4.2: Add workflow progression logic
   - 4.3: Implement notification triggers

2. **Frontend**
   - 4.4: Create approval inbox view (Pending Approvals)
   - 4.5: Build expense detail modal with approve/reject actions
   - 4.6: Implement optimistic UI updates
   - 4.7: Add Storybook stories

**Deliverables**: Approvers can review and act on pending expenses

### Milestone 5: Reporting & History
**Goal**: Provide visibility into historical data and financial metrics

**Tasks**:
1. **Backend**
   - 5.1: Implement report generation service
   - 5.2: Create audit trail query API
   - 5.3: Optimize database queries with indexes

2. **Frontend**
   - 5.4: Build expense history view with filters
   - 5.5: Create audit trail timeline component
   - 5.6: Implement date range report generator
   - 5.7: Add export functionality (CSV/PDF)

**Deliverables**: Complete reporting and audit trail functionality

---

## Development Rules

### Frontend Rules
1. **Component Structure**: Follow Atomic Design strictly
2. **Server Components**: Use by default; add `"use client"` only when interactivity needed
3. **Validation**: Use `react-hook-form` + `zodResolver`; share Zod schemas with backend
4. **Protected Routes**: Implement middleware for authentication checks
5. **Tenant Extraction**: Extract tenant info from user session (never from client input)

### Backend Rules
1. **Architecture**: Use Server Actions for form submissions; Route Handlers for external integrations
2. **Database**: Maintain strict Zod schema mirrors of Mongoose schemas
3. **Connection**: Ensure `dbConnect` uses singleton pattern for serverless
4. **Validation**: VALIDATE EVERYTHING using Zod `.parse()` or `.safeParse()`
5. **Authorization**: Verify roles in every Server Action/API route
6. **Tenant Isolation**: ALWAYS include `tenantId` in every database query

### Infrastructure Rules
1. **IaC**: Use AWS CDK with TypeScript
2. **Security**: Configure IAM roles with least privilege for Lambda→S3/SES access
3. **Secrets**: Store `MONGODB_URI` and auth secrets in environment variables
4. **Tagging**: Tag all resources with `Environment={Env}` for cost tracking

### Testing Rules
1. **Unit Tests**: Test all helper functions, Zod schemas, utility logic
2. **Component Tests**: Test render correctness, user interactions, accessibility
3. **Integration Tests**: Use test database to verify Server Actions and DB interactions
4. **E2E Tests**: Test critical flows: login, expense submission, approval
5. **Storybook**: Document all reusable components with interaction tests
6. **Coverage**: Aim for > 80% coverage on business logic

---

## Quality Gates & Best Practices

### Code Quality
- ESLint + Prettier enforced on all commits
- Husky pre-commit hooks for linting and formatting
- Pull request reviews required before merge
- No direct commits to `main` branch

### Documentation
- API specification kept in sync with implementation
- Architecture diagrams updated with major changes
- README with setup and deployment instructions
- Inline code comments for complex business logic

### Error Handling
- Form errors: Inline validation messages from `useForm`
- Server errors: Toast notifications from `ActionResponse` failures
- Crash handling: React Error Boundaries (`error.tsx`)
- Logging: All errors logged with context (userId, tenantId, requestId)

### Performance Optimization
- Optimize database queries with proper indexing
- Implement pagination for large data sets
- Use Next.js Image component for optimized images
- Enable CloudFront caching for static assets
- Lazy load components where appropriate

---

## Success Criteria

### Functional
- ✅ Users can login with role-based authentication
- ✅ Facility admins can submit expenses with invoice attachments
- ✅ Configurable workflows with threshold-based approval logic
- ✅ Approvers can approve/reject expenses
- ✅ Complete audit trail for all expense state changes
- ✅ Users can view expense history and generate reports
- ✅ Multi-tenant isolation enforced across all operations

### Non-Functional
- ✅ API response times meet performance targets (< 200ms reads, < 500ms writes)
- ✅ Frontend meets Core Web Vitals standards
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ > 80% code coverage on business logic
- ✅ All security requirements implemented (encryption, CSP, audit logging)
- ✅ Infrastructure deployed via CDK with proper IaC practices

### Quality
- ✅ Comprehensive test coverage (unit, component, integration, E2E)
- ✅ Storybook documentation for all reusable components
- ✅ Clean, maintainable code following best practices
- ✅ All documentation up-to-date with implementation
- ✅ CI/CD pipeline operational with automated quality checks

---

## Getting Started Instructions

When implementing this project:

1. **Start with Milestone 1**: Set up the foundation before building features
2. **Follow the task numbering**: Each task builds upon previous ones
3. **Write tests for each task**: Don't defer testing to the end
4. **Update documentation**: Keep docs in sync as you implement
5. **Review security at each step**: Ensure tenant isolation and validation are correct
6. **Deploy incrementally**: Test each milestone in deployed environment
7. **Iterate based on feedback**: Use the execution log to track changes and refinements

This is a comprehensive, production-ready expense management system. Build it with quality, security, and scalability in mind from day one.
