# Architecture & Deployment

## Tech Stack

- **Frontend & Backend**: Next.js with TypeScript
- **Database**: PostgreSQL (local for development, AWS RDS for production)
- **ORM**: Drizzle ORM
- **File Storage**: Amazon S3 (invoice attachments) - local folder for development
- **Email Service**: Amazon SES (event notifications) - mocked for development
- **Infrastructure**: AWS CDK
- **Validation**: Zod for schema validation
- **Testing**: Jest (unit/integration tests)
- **Component Testing**: Storybook
- **Code Quality**: ESLint, Prettier

---

## System Architecture Overview

```mermaid
flowchart TB
    subgraph client [Client Layer]
        WebApp[Next.js Web App]
    end
    
    subgraph auth [Authentication]
        SSO[Azure Entra SSO]
        Session[Session Management]
    end
    
    subgraph api [API Layer]
        Routes[Next.js API Routes]
        Middleware[Auth + Tenant Middleware]
        Controllers[Controllers]
    end
    
    subgraph business [Business Layer]
        ExpenseService[Expense Service]
        WorkflowService[Workflow Service]
        ApprovalService[Approval Service]
        ReportService[Report Service]
        AuditService[Audit Service]
    end
    
    subgraph data [Data Layer]
        PG[(PostgreSQL)]
        S3[(Amazon S3)]
    end
    
    subgraph notifications [Notification Layer]
        SES[Amazon SES]
    end
    
    WebApp --> SSO
    SSO --> Session
    WebApp --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> ExpenseService
    Controllers --> WorkflowService
    Controllers --> ApprovalService
    Controllers --> ReportService
    ExpenseService --> AuditService
    ApprovalService --> AuditService
    ExpenseService --> PG
    ExpenseService --> S3
    ApprovalService --> PG
    ReportService --> PG
    AuditService --> PG
    ApprovalService --> SES
```

---

## Multi-Tenancy Model

This system uses **Row-Level Isolation** for multi-tenancy:

- All tables include a `tenant_id` column
- Every query must filter by `tenant_id`
- Tenant context is extracted from the authenticated user session
- Middleware enforces tenant isolation on all API routes

---

## Database Schema

```mermaid
erDiagram
    TENANTS ||--o{ USERS : has
    TENANTS ||--o{ EXPENSES : has
    TENANTS ||--o{ GL_CODES : has
    TENANTS ||--o{ EXPENSE_WORKFLOWS : has
    EXPENSE_WORKFLOWS ||--o{ WORKFLOW_STEPS : has
    EXPENSE_WORKFLOWS ||--o{ EXPENSES : uses
    WORKFLOW_STEPS ||--o{ EXPENSE_APPROVALS : defines
    USERS ||--o{ EXPENSES : submits
    USERS ||--o{ EXPENSES : approves
    USERS ||--o{ EXPENSE_APPROVALS : acts
    EXPENSES ||--o{ EXPENSE_APPROVALS : has
    EXPENSES ||--o{ EXPENSE_HISTORY : has
    EXPENSES ||--o{ EXPENSE_ATTACHMENTS : has
    GL_CODES ||--o{ EXPENSES : maps
    
    TENANTS {
        uuid id PK
        string name
        string slug
        boolean is_active
        timestamp created_at
    }
    
    USERS {
        uuid id PK
        uuid tenant_id FK
        string email
        string name
        enum role "admin|approver"
        boolean is_active
        timestamp last_login
    }
    
    GL_CODES {
        uuid id PK
        uuid tenant_id FK
        string code
        string description
        boolean is_active
    }
    
    EXPENSE_WORKFLOWS {
        uuid id PK
        uuid tenant_id FK
        string name
        enum code "petty|internet"
        text description
        boolean is_active
    }
    
    WORKFLOW_STEPS {
        uuid id PK
        uuid workflow_id FK
        integer step_order
        string name
        text description
        enum approver_role "admin|approver"
        decimal amount_threshold
        boolean is_final
        boolean is_active
    }
    
    EXPENSES {
        uuid id PK
        uuid tenant_id FK
        uuid submitted_by FK
        uuid approved_by FK
        uuid workflow_id FK
        uuid current_step_id FK
        enum workflow_type "petty|internet"
        date expense_date
        string invoice_number
        string vendor_name
        decimal amount
        string nature_of_expense
        uuid gl_code_id FK
        string purpose
        enum status "draft|submitted|approved|rejected"
        timestamp created_at
        timestamp updated_at
    }
    
    EXPENSE_APPROVALS {
        uuid id PK
        uuid expense_id FK
        uuid workflow_step_id FK
        uuid approver_id FK
        enum status "pending|approved|rejected|skipped"
        text comments
        timestamp acted_at
        timestamp created_at
    }
    
    EXPENSE_HISTORY {
        uuid id PK
        uuid expense_id FK
        uuid user_id FK
        enum action "created|submitted|approved|rejected|updated"
        string comments
        jsonb changes
        timestamp created_at
    }
    
    EXPENSE_ATTACHMENTS {
        uuid id PK
        uuid expense_id FK
        string file_name
        string s3_key
        string content_type
        integer file_size
        timestamp uploaded_at
    }
```

---

## Role-Based Access Control (Phase 1 - Petty Expense)

| Action | Admin (Facility) | Approver |
|--------|------------------|----------|
| Submit Petty Expense | Yes | Yes |
| Approve/Reject Petty Expense | No | Yes |
| View Own Expenses | Yes | Yes |
| View All Expenses | No | Yes |
| View Audit Trail | Yes | Yes |
| Generate Reports | No | Yes |

### Role Definitions

- **Admin (Facility Admin)**: Can submit petty expenses and view audit trail
- **Approver (Accountant)**: Can submit petty expenses, approve/reject, view all expenses, and generate reports

### GL Code Management

GL codes are managed by **System/DB Admin** (not a role in the application). GL codes are backfilled via database seed scripts or migrations per tenant.

---

## Expense State Flow

### Workflow-Based Approval

The system uses configurable workflows with approval steps:

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    Draft --> Submitted: Submit (routes to workflow)
    Submitted --> Approved: Step Approved (if final step)
    Submitted --> Rejected: Step Rejected
    Rejected --> Submitted: Resubmit
    Approved --> [*]
```

### Current Configuration (Single-Level Approval)

Each tenant has workflows configured with a single approval step:

| Table | Purpose |
|-------|---------|
| `expense_workflows` | Workflow definitions per tenant (petty, internet) |
| `workflow_steps` | Approval steps (currently 1 step per workflow) |
| `expense_approvals` | Tracks approval decisions per expense |

**How it works:**
1. Expense is created and linked to a workflow based on `workflow_type`
2. On submit, an `expense_approval` record is created for the workflow step
3. Approver reviews and approves/rejects
4. `expense_approvals.status` and `expenses.status` are updated
5. Audit trail recorded in `expense_history`

### Multi-Level Approval (Future Ready)

The schema supports multi-level approval - just add more steps:

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    Draft --> Submitted: Submit
    Submitted --> Step1: Route to Workflow
    Step1 --> Step2: Step 1 Approved
    Step1 --> Rejected: Step 1 Rejected
    Step2 --> Step3: Step 2 Approved
    Step2 --> Rejected: Step 2 Rejected
    Step3 --> Approved: Final Approval
    Step3 --> Rejected: Final Rejected
    Rejected --> Submitted: Resubmit
    Approved --> [*]
```

**To enable multi-level:**
1. Add more `workflow_steps` with incrementing `step_order` (1, 2, 3...)
2. Set `is_final = false` for intermediate steps
3. Use `amount_threshold` to skip steps for small amounts
4. Track progress via `expenses.current_step_id`

---

## Development Environment

### Local PostgreSQL Setup

```bash
# Docker (recommended)
docker compose up -d
# or manually:
docker run --name expense-db \
  -e POSTGRES_USER=expense \
  -e POSTGRES_PASSWORD=expense123 \
  -e POSTGRES_DB=expense_mgmt \
  -p 5433:5432 \
  -d postgres:16
```

### Environment Variables (.env.local)

```env
DATABASE_URL=postgresql://expense:expense123@localhost:5433/expense_mgmt
JWT_SECRET=your-jwt-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Production Deployment (Deferred)

### Infrastructure (AWS CDK)

```
infrastructure/
├── bin/
│   └── expense-app.ts
├── lib/
│   ├── stacks/
│   │   ├── expense-stack.ts       # Main application stack
│   │   ├── database-stack.ts      # RDS PostgreSQL (deferred)
│   │   ├── storage-stack.ts       # S3 bucket
│   │   └── email-stack.ts         # SES configuration
│   └── constructs/
│       ├── nextjs-lambda.ts       # Next.js Lambda deployment
│       └── api-gateway.ts         # API Gateway setup
└── config/
    ├── staging.json
    └── production.json
```

### Deployment Model

1. **Next.js**: Deployed as serverless Lambda functions (standalone output)
2. **PostgreSQL**: Local for development, AWS RDS for production
3. **S3**: Invoice attachments with lifecycle policies
4. **SES**: Email notifications for approval actions
5. **CloudFront**: CDN for static assets

---

## Architecture Patterns

### Frontend Architecture

- **UI Architecture**: Atomic Design Pattern
  - `components/atoms/` - Basic UI elements (buttons, inputs, labels)
  - `components/molecules/` - Composite components (form fields, cards)
  - `components/organisms/` - Complex components (forms, lists, headers)
- Use TypeScript for all components
- Implement proper error boundaries
- Follow Next.js App Router conventions

### Backend Architecture

- **Layered Architecture**:
  - `app/api/` - API route handlers (Next.js API routes)
  - `services/` - Business logic layer
  - `lib/db.ts` - Database operations (Drizzle ORM)
- All API routes should use proper error handling
- Implement request validation using Zod schemas
- Use standardized API response format

