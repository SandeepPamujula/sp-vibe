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
- View list of submitted expenses
- Manual approval of expenses
- Download expense/invoice details to CSV (monthly basis)
- Receive email notifications for new invoice submissions
- Receive email confirmation on invoice approval/rejection

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
- **HTTP Client Wrapper**: Custom Axios wrapper with interceptors
- **Logging Wrapper**: Custom Winston wrapper with structured logging
- **Response Wrapper**: Standardized API response utility
- **DB Connection Wrapper**: Custom DynamoDB client wrapper
- **UI Architecture**: Atomic Design (Atoms, Molecules, Organisms)
- **BE Architecture**: Layered (Controller, Service, DB)
- **Static Analysis**: ESLint
- **Code Formatting**: Prettier
- **Testing**: Jest (unit/integration tests)
- **Component Testing**: Storybook

## Implementation Milestones

### Milestone 1: Project Setup & Infrastructure
1.1 Initialize Next.js project with TypeScript
1.2 Configure ESLint and Prettier for code quality and formatting
1.3 Configure Jest for testing
1.4 Set up Storybook for component development
1.5 Create UI component folder structure:
    - components/atoms (buttons, inputs, labels)
    - components/molecules (form fields, cards)
    - components/organisms (forms, lists, headers)
1.6 Create BE component folder structure:
    - controllers (API route handlers)
    - services (business logic)
    - db (database operations)
1.7 Create common library wrappers:
    - HTTP client wrapper (Axios with interceptors)
    - Logging wrapper (Winston with structured format)
    - Response wrapper (standardized API responses)
    - DB connection wrapper (DynamoDB client)
1.8 Set up AWS CDK infrastructure
1.9 Configure DynamoDB tables (users, invoices)
1.10 Create S3 bucket for invoice file storage
1.11 Set up Amazon SES for email notifications
1.12 Deploy basic infrastructure

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
4.1 Build invoice list view with filtering
4.2 Implement invoice approval workflow
4.3 Add invoice detail view
4.4 Update invoice status in database
4.5 Send email confirmation on approval/rejection to both users

### Milestone 5: CSV Export Feature
5.1 Create month selector for accountant to dynamically choose month and download approved/rejected invoice details in CSV
5.2 Implement CSV download functionality with status filtering
5.3 Add date range filtering
5.4 Optimize query performance

### Milestone 6: Testing & Deployment
6.1 Add Jest unit tests for core functions
6.2 Create Storybook stories for UI components
6.3 Implement Jest integration tests
6.4 Set up CI/CD pipeline
6.5 Deploy to production environment

## Development Guidelines
- Build features step by step with testing
- Follow minimal code principles
- Focus on core functionality
- Maintain clean, readable code structure
- Use TypeScript for type safety
- Implement proper error handling
- Follow Next.js best practices