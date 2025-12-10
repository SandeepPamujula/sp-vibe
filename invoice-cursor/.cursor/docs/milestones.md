# Implementation Milestones

**Build Approach**: Follow these milestones sequentially. Complete each milestone before moving to the next. Test thoroughly at each step.

**Progress Tracking**: 
- ✅ = Completed
- ⏳ = In Progress
- ⬜ = Pending

**Current Status**: Working on Milestone 1.10

## Milestone 1: Project Setup & Infrastructure
✅ 1.1 Initialize Next.js project with TypeScript
✅ 1.2 Configure ESLint and Prettier for code quality and formatting
✅ 1.3 Configure Jest for testing
✅ 1.4 Set up Storybook for component development
✅ 1.5 Create UI component folder structure:
    - components/atoms (buttons, inputs, labels)
    - components/molecules (form fields, cards)
    - components/organisms (forms, lists, headers)
✅ 1.6 Create BE component folder structure:
    - controllers (API route handlers)
    - services (business logic)
    - db (database operations)
✅ 1.7 Define TypeScript interfaces for data models (User, Invoice, Response, InvoiceHistoryEntry)
    - Types organized in separate files: user.ts, invoice.ts, invoice-history.ts, response.ts
    - Supports multiple S3 files per invoice via InvoiceFileMetadata array
    - Unified history system combining comments and audit trail in single InvoiceHistoryEntry array
    - All transactional information (submittedBy, approvedBy, rejectionReason, timestamps) derived from history
    - State transitions derived from entryType and chronological order
✅ 1.8 Set up Zod schemas for input validation
    - Schemas organized in separate files: user.schema.ts, invoice.schema.ts, invoice-history.schema.ts, response.schema.ts
    - Validation schemas for all data models and common operations
    - Input schemas for create/update operations, file uploads, comments, and queries
    - File validation: PDF, PNG, JPEG, HEIC only; max 10 MB per file
✅ 1.9 Configure environment variables and centralized config
    - Centralized config module with Zod validation (src/lib/config.ts)
    - Type-safe access to all environment variables
    - Validation with clear error messages for missing/invalid config
    - Support for development, test, staging, and production environments
    - Configuration for AWS (DynamoDB, S3, SES), Sentry, CORS, rate limiting
    - .env.example file with all variables documented
⬜ 1.10 Create common library wrappers:
    - HTTP client wrapper (Axios with interceptors)
    - Logging wrapper (Winston with structured format)
    - Response wrapper (standardized API responses)
    - DB connection wrapper (DynamoDB client)
⬜ 1.11 Set up security middleware (CORS, rate limiting)
⬜ 1.12 Configure Sentry for error tracking
⬜ 1.13 Set up AWS CDK infrastructure:
    - Initialize CDK project in infrastructure/ directory
    - Create CDK app entry point and stack structure
    - Configure CDK dependencies and TypeScript
⬜ 1.14 Configure DynamoDB tables with proper schema:
    - Create UsersTable with partition key (email) for user authentication and roles
    - Create InvoicesTable with partition key (invoiceId) and sort key (createdAt)
    - Add Global Secondary Indexes:
      - vendor-index (for vendor name search)
      - status-index (for status filtering: DRAFT/UNDER_REVIEW/APPROVED/REJECTED)
    - Note: submittedBy and approvedBy queries derive from history array (search for SUBMITTED/APPROVED entry types)
⬜ 1.15 Create S3 bucket with file validation rules:
    - Configure bucket with CORS for web uploads (support batch uploads)
    - Set up lifecycle policies for cost optimization
    - Implement bucket policies and access controls
    - Enable versioning and encryption
    - Support multiple file uploads per request (max 5 files)
    - File type validation: PDF, PNG, JPEG, HEIC only
    - File size validation: maximum 10 MB per file
⬜ 1.16 Set up Amazon SES for email notifications:
    - Configure SES with verified email addresses
    - Create IAM roles for sending emails
    - Set up email templates (optional)
⬜ 1.17 Create health check endpoints:
    - Add /api/health endpoint
    - Verify database connectivity
    - Check S3 bucket access
⬜ 1.18 Deploy basic infrastructure:
    - Configure Next.js for standalone output
    - Create Next.js Lambda construct
    - Set up API Gateway integration
    - Deploy to staging environment

## Milestone 2: Authentication System
⬜ 2.1 Implement mock SSO authentication
⬜ 2.2 Create user session management
⬜ 2.3 Set up role-based routing (admin/accountant)
⬜ 2.4 Add login/logout functionality

## Milestone 3: Admin Portal - Invoice Submission
⬜ 3.1 Create invoice submission form with support for multiple invoices (max 5)
⬜ 3.2 Implement multiple file upload to S3 for invoice attachments (batch upload)
⬜ 3.3 Add form validation and error handling:
    - Validate maximum 5 invoices per submission
    - Validate file types: PDF, PNG, JPEG, HEIC only
    - Validate file size: maximum 10 MB per file
    - Validate required fields for each invoice
⬜ 3.4 Store invoice IDs and expense details in DynamoDB (batch processing)
⬜ 3.5 Link S3 file paths to DynamoDB records (multiple files per invoice via InvoiceFileMetadata array)
⬜ 3.6 Send email confirmation to admin on submission (include count of submitted invoices)
⬜ 3.7 Send email notification to accountant for new invoices (include count of new invoices)
⬜ 3.8 Implement invoice resubmission flow:
    - Allow Admin to view rejected invoices
    - Enable editing of rejected invoice details
    - Allow uploading new file(s) for rejected invoices
    - Implement resubmit functionality (REJECTED → DRAFT → UNDER_REVIEW)
⬜ 3.9 Implement unified history system:
    - Allow Admin and Accountant to add comments (COMMENT entry type) to invoices
    - Automatically record all state transitions (CREATED, SUBMITTED, APPROVED, REJECTED, RESUBMITTED, UPDATED, FILES_ADDED, FILES_REMOVED)
    - Support threaded conversations via parentHistoryId
    - Store all entries chronologically in single history array
    - Derive transactional data (submittedBy, approvedBy, rejectionReason, timestamps) from history entries

## Milestone 4: Accountant Portal - Invoice Management
⬜ 4.1 Build invoice list view with pagination and filtering
⬜ 4.2 Implement search functionality with filters: partial vendor name, partial invoice ID
⬜ 4.3 Add invoice preview capability
⬜ 4.4 Implement invoice approval workflow
⬜ 4.5 Add invoice detail view
⬜ 4.6 Update invoice status in database with audit trail:
    - Record state transition in unified history array with appropriate entryType
    - Add history entry with entryType (APPROVED, REJECTED, etc.), createdBy, createdByRole, createdAt
    - Include content field for rejection reasons or action descriptions
    - Update status field on invoice
    - All transactional timestamps derive from history entry createdAt
⬜ 4.7 Send email confirmation on approval/rejection to both users

## Milestone 5: CSV Export Feature
⬜ 5.1 Create month selector for accountant to dynamically choose month and download APPROVED/REJECTED invoice details in CSV
⬜ 5.2 Implement CSV download functionality with status filtering
⬜ 5.3 Add date range filtering
⬜ 5.4 Optimize query performance

## Milestone 6: Testing & Deployment
⬜ 6.1 Add Jest unit tests for core functions
⬜ 6.2 Create Storybook stories for UI components
⬜ 6.3 Implement Jest integration tests
⬜ 6.4 Manual CDK deployment (Staging):
    - Build Next.js application with standalone output
    - Package application artifacts for Lambda
    - Deploy CDK stack to staging environment
    - Configure environment variables via CDK
    - Verify Lambda functions and API Gateway
    - Test health check endpoints
    - Validate DynamoDB tables and S3 bucket access
⬜ 6.5 Configure production deployment:
    - Build Next.js application for production
    - Deploy CDK stack to production environment
    - Configure custom domain with Route53 and Certificate Manager (optional)
    - Set up CloudFront distribution for static assets (optional)
    - Enable CloudWatch monitoring and alarms
    - Configure CloudWatch Logs retention
    - Set up X-Ray tracing (optional)
    - Perform smoke tests and validation
