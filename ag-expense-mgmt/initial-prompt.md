Project folder: ag-expense-mgmt/
No Code in this step.
Design multi-tenant expense management system step by step. There will be multiple workflows to be supported per tenant. 
Workflow : As a facility-admin, I should be able to submit a petty expense. approver should be able to approve or reject it.
Roles -  facility-admin (facility admin), approver(accountant)

Use case1: as an employee, I should be able to login using azure entra SSO. Mock SSO for now. Create test users for each role.
Use case 2: as an admin, I should be able to submit an expense(date of expense, invoice number, vendor name, amount spent, expense description, expense-category, (expense-category mapping with GL code will be done in the backend for reports).
Use case 3: as an approver, I should be able to approve/reject an expense.
Use case 4: as an admin, approver, I should be able to see the expense history(audit trail)
Use case 5: as an approver, I should be able to generate report for a date range.

Let us create a plan for multiple milestones and each milestone have multiple tasks to be implemented.
Also, create separate rules for frontend, backend and infrastructure which is used to implement a task.
Let us improve the plan(milestones and tasks) before implementing them. Keep seperate tasks for frontend, backend and infrastructure.
Store the prompt history for planning and each milestone in separate files.

Create HLD and Create a deployment strategy as well.

Use S3 + CloudFront (Static) for frontend deployment and  API Gateway + Lambda for Backend deployment 
Use mongodb for DB.

## Tech Stack
- **Frontend & Backend**: Next.js with TypeScript
- **Database**: MongoDB
- **File Storage**: Amazon S3 (invoice attachments)
- **Email Service**: Amazon SES (event notifications)
- **Infrastructure**: AWS CDK
- **Validation**: Zod for schema validation
- **Testing**: Jest (unit/integration tests)
- **Component Testing**: Storybook
- **Code Quality**: ESLint, Prettier

Good job so far. Now Create a plan for multiple milestones and each milestone have multiple tasks to be implemented. add incremental numbers to each task.
split into multiple milestones and each milestone have multiple tasks to be implemented.
========================
Create ER diagram for the database.
Expense type and gl-code collections should be created. user should be able to select expense type while submitting an expense. 

each tenant can have different workflows. each workflow can have different approval steps. in our use case we have only one approval step(final step). each step can have a threshold limit. if the expense amount is less than the threshold limit, the step can be skipped.
isFinalStep can be added to workflow_step

========================
use atomic design to create components.

