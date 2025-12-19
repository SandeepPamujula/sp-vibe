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
        MockSSO[Mock Azure Entra SSO]
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
    
    WebApp --> MockSSO
    MockSSO --> Session
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
    USERS ||--o{ EXPENSES : submits
    USERS ||--o{ EXPENSES : approves
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
    
    EXPENSES {
        uuid id PK
        uuid tenant_id FK
        uuid submitted_by FK
        uuid approved_by FK
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

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    Draft --> Submitted: Submit
    Submitted --> Approved: Approve
    Submitted --> Rejected: Reject
    Rejected --> Submitted: Resubmit
    Approved --> [*]
```

---

## Development Environment

### Local PostgreSQL Setup

```bash
# Docker (recommended)
docker run --name expense-db \
  -e POSTGRES_USER=expense \
  -e POSTGRES_PASSWORD=expense123 \
  -e POSTGRES_DB=expense_mgmt \
  -p 5432:5432 \
  -d postgres:16
```

### Environment Variables (.env.local)

```env
DATABASE_URL=postgresql://expense:expense123@localhost:5432/expense_mgmt
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

