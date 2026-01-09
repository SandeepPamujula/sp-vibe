# Milestone 2: Configuration & Master Data - Detailed Plan

## Goals
- Implement backend services for Config (Workflows, GL Codes, Expense Types).
- Create Seeding Scripts for Master Data.
- Create API endpoints for Frontend consumption.

## Tasks

### Backend (Next.js API/Server Actions)
- [ ] **2.1**: Define Mongoose Schemas.
    - [ ] `GLCode` Schema.
    - [ ] `ExpenseType` Schema.
    - [ ] `Workflow` and `WorkflowStep` Schemas.
    - [ ] *Test*: Unit tests for Schema validation.
- [ ] **2.2**: Implement Seeding Logic.
    - [ ] Create `seed-master-data.ts` script.
    - [ ] Seed default GL Codes.
    - [ ] Seed default Expense Types (mapped to GL Codes).
    - [ ] Seed default Workflow (Single step approval).
    - [ ] *Test*: Verify database contains seeded data.
- [ ] **2.3**: Create Data Access Layer (Services).
    - [ ] `InventoryService` (for GL/ExpenseTypes).
    - [ ] `WorkflowService`.
    - [ ] **2.3.1**: `AuditLogService` (NFR: Security).
        - [ ] Implement `logAction(tenantId, userId, action, details)`.
    - [ ] *Test*: Unit tests for Service methods.
- [ ] **2.4**: Create API Endpoints / Server Actions.
    - [ ] `getExpenseTypes(tenantId)`
    - [ ] `getGLCodes(tenantId)`
    - [ ] *Test*: Integration test (API returns correct JSON).

## Execution Log
- **User Prompt**: "Expense type and gl-code collections should be created" -> Added Schema definitions and Seeding tasks.
- **User Prompt**: "each tenant can have different workflows" -> Added Workflow Schema tasks.
