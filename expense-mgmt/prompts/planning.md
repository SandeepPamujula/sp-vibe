# Planning Conversation History

This document captures the planning conversation for the Multi-Tenant Expense Management System.

---

## Planning Session - 2024-12-19

### Initial Requirements

The user requested a multi-tenant expense management system with the following:

**Workflows:**
1. **Workflow 1 (Petty Expense)**: Admin can submit, Approver can approve/reject
2. **Workflow 2 (Internet Expense)**: User can submit, Approver can approve/reject (Deferred to Phase 2)

**Roles:**
- **User**: Any employee (Phase 2)
- **Admin**: Facility admin (can submit petty expenses)
- **Approver**: Accountant (can approve/reject expenses)

### Clarification Questions

1. **Multi-tenancy model?** → Row-level isolation (tenant_id column)
2. **GL codes management?** → Configurable per tenant (backfilled by System/DB Admin)
3. **Approval workflow?** → Single-level (any approver can approve)
4. **Report format?** → Excel only

### Key Decisions

1. **Focus on Workflow 1 first** - Petty Expense only in Phase 1
2. **Local PostgreSQL for development** - AWS RDS deferred
3. **Drizzle ORM** instead of Prisma
4. **Admin is Facility Admin** - not system admin
5. **GL codes backfilled by System/DB Admin** - not through app UI

### Tech Stack

- Frontend & Backend: Next.js with TypeScript
- Database: PostgreSQL (local for dev)
- ORM: Drizzle ORM
- File Storage: Amazon S3 (local folder for dev)
- Email Service: Amazon SES (mocked for dev)
- Infrastructure: AWS CDK (deferred)
- Validation: Zod
- Testing: Jest, Storybook

### Milestones

1. **Milestone 1**: Project Setup and Infrastructure
2. **Milestone 2**: Authentication and Authorization
3. **Milestone 3**: Petty Expense Submission (Workflow 1)
4. **Milestone 4**: Approval Workflow and Notifications
5. **Milestone 5**: Reports and Audit Trail
6. **Milestone 6**: AWS Infrastructure and Deployment

### Phase 2 (Deferred)

- Workflow 2: Internet Expense
- User role for internet expense submission
- Workflow selection UI

---

## Notes

- See `docs/architecture.md` for HLD
- See `docs/guidelines.md` for development guidelines
- See `.cursor/rules/expense-mgmt.mdc` for Cursor rules

