# Planning Phase History

## 1. Initial Requirements
- **Goal**: Multi-tenant Expense Management System.
- **Roles**: Facility Admin (Submitter), Approver (Accountant).
- **Stack**: Next.js, MongoDB, AWS (S3, CloudFront, Lambda, SES).
- **Core Flows**: Submission -> Approval -> Reporting.

## 2. Design Refinements
- **Tech Stack**: Switched from React/API Gateway to Fullstack Next.js on Lambda.
- **Database**: 
    - Added `ExpenseType` and `GLCode` collections.
    - Added `Workflow` and `WorkflowStep` entities for dynamic approvals.
- **Workflows**:
    - Added Threshold logic (Auto-approve if amount < threshold).
    - Added `isFinalStep` boolean to Workflow Steps.
    - Added **Resubmission Flow**: Rejected expenses can be edited and resubmitted.
- **Infrastructure**:
    - Deferred `StorageStack` (S3) from Milestone 1 to Milestone 3.
    - Added CI/CD (GitHub Actions) to Milestone 1.

## 3. Project Structure
- **Frontend**: Adopted Atomic Design (`atoms`, `molecules`, `organisms`).
- **Milestones**: Split into 5 detailed milestone plans with incremental task numbering.
