# Invoice Q Project Context

## Project Overview
Invoice Q is an expense invoice processing application with role-based access control for admin and accountant users.

## Requirements
### Authentication
- SSO login with mock implementation
- Admin user: spamujula@progressresidential.com
- Accountant user: sandeeppamujula@gmail.com

### Admin Features
- Submit expense invoices via web portal
- Receive email confirmation on invoice submission

### Accountant Features
- View list of submitted expenses with pagination
- Manual approval of expenses
- Download expense/invoice details to CSV (monthly basis)
- Receive email notifications for new invoice submissions
- Receive email confirmation on invoice approval/rejection
- Search invoices by various criteria
- Preview uploaded invoices before approval

### Email Notifications
- Invoice submission confirmation (to admin)
- New invoice notification (to accountant)
- Invoice approval/rejection confirmation (to admin and accountant)

## Tech Stack
- **Frontend & Backend**: Next.js
- **Database**: DynamoDB (invoice metadata & expense details)
- **File Storage**: Amazon S3 (invoice attachments)
- **Email Service**: Amazon SES (event notifications)
- **Infrastructure**: AWS CDK
- **Deployment**: Manual CDK deployment
- **HTTP Client Wrapper**: Custom Axios wrapper with interceptors
- **Logging Wrapper**: Custom Winston wrapper with structured logging
- **Response Wrapper**: Standardized API response utility
- **DB Connection Wrapper**: Custom DynamoDB client wrapper
- **UI Architecture**: Atomic Design (Atoms, Molecules, Organisms)
- **BE Architecture**: Layered (Controller, Service, DB)
- **Validation**: Zod for schema validation
- **Environment Config**: Centralized configuration management
- **Security**: CORS, rate limiting, file validation
- **Error Tracking**: Sentry for production monitoring
- **Data Models**: TypeScript interfaces
- **Static Analysis**: ESLint
- **Code Formatting**: Prettier
- **Testing**: Jest (unit/integration tests)
- **Component Testing**: Storybook
- **Development**: Git hooks, Docker containerization

## Implementation Milestones

### Milestone 1: Project Setup & Infrastructure
1.1 Initialize Next.js project with TypeScript
1.2 Configure ESLint and Prettier for code quality and formatting
<!-- 1.3 Set up Git hooks for pre-commit linting/testing -->
1.4 Configure Jest for testing
1.5 Set up Storybook for component development
1.6 Create UI component folder structure:
    - components/atoms (buttons, inputs, labels)
    - components/molecules (form fields, cards)
    - components/organisms (forms, lists, headers)
1.7 Create BE component folder structure:
    - controllers (API route handlers)
    - services (business logic)
    - db (database operations)
1.8 Define TypeScript interfaces for data models (User, Invoice, Response)
1.9 Set up Zod schemas for input validation
1.10 Configure environment variables and centralized config
1.11 Create common library wrappers:
    - HTTP client wrapper (Axios with interceptors)
    - Logging wrapper (Winston with structured format)
    - Response wrapper (standardized API responses)
    - DB connection wrapper (DynamoDB client)
1.12 Set up security middleware (CORS, rate limiting)
1.13 Configure Sentry for error tracking
1.14 Set up AWS CDK infrastructure
1.15 Configure DynamoDB tables with proper schema
1.16 Create S3 bucket with file validation rules
1.17 Set up Amazon SES for email notifications
1.18 Create health check endpoints
1.19 Deploy basic infrastructure

### Milestone 2: Authentication System
2.1 Implement mock SSO authentication
2.2 Create user session management
2.3 Set up role-based routing (admin/accountant)
2.4 Add login/logout functionality

### Milestone 3: Admin Portal - Invoice Submission
3.1 Create invoice submission form
3.2 Implement file upload to S3 for invoice attachments
3.3 Add form validation and error handling
3.4 Store invoice ID and expense details in DynamoDB
3.5 Link S3 file path to DynamoDB record
3.6 Send email confirmation to admin on submission
3.7 Send email notification to accountant for new invoice

### Milestone 4: Accountant Portal - Invoice Management
4.1 Build invoice list view with pagination and filtering
4.2 Implement search functionality with filters: partial vendor name, partial invoice ID
4.3 Add invoice preview capability
4.4 Implement invoice approval workflow
4.5 Add invoice detail view
4.6 Update invoice status in database with audit trail
4.7 Send email confirmation on approval/rejection to both users

### Milestone 5: CSV Export Feature
5.1 Create month selector for accountant to dynamically choose month and download approved/rejected invoice details in CSV
5.2 Implement CSV download functionality with status filtering
5.3 Add date range filtering
5.4 Optimize query performance

### Milestone 6: Testing & Deployment
6.1 Add Jest unit tests for core functions
6.2 Create Storybook stories for UI components
6.3 Implement Jest integration tests
6.4 Manual CDK deployment:
    - Build Next.js application
    - Deploy infrastructure using CDK
    - Configure environment variables
    - Deploy to staging environment
6.5 Configure production deployment:
    - Manual production deployment via CDK
    - Configure custom domain (optional)
    - Enable monitoring and logging
<!-- 6.6 Set up CI/CD pipeline:
    - Automated testing on PR
    - Staging deployment on develop branch
    - Production deployment on main branch -->

## Development Guidelines
- Build features step by step with testing
- Follow minimal code principles
- Focus on core functionality
- Maintain clean, readable code structure
- Use TypeScript for type safety
- Implement proper error handling
- Follow Next.js best practices
- Validate all inputs with Zod schemas
- Implement proper file upload restrictions
- Use centralized error tracking
- Maintain audit trails for all operations
- Follow security best practices
- Use Docker for consistent development environment