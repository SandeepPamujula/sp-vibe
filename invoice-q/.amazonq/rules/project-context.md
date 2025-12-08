# Invoice Q Project Context

## Project Overview
Invoice Q is an expense invoice processing application with role-based access control for admin and accountant users.

## Requirements
### Authentication
- SSO login with mock implementation
- Admin user: sandeeppamujula@gmail.com
- Accountant user: spamujula@progressresidential.com

### Admin Features
- Submit expense invoices via web portal

### Accountant Features
- View list of submitted expenses
- Manual approval of expenses
- Download expense/invoice details to CSV (monthly basis)

## Tech Stack
- **Frontend & Backend**: Next.js
- **Database**: DynamoDB
- **Infrastructure**: AWS CDK

## Implementation Milestones

### Milestone 1: Project Setup & Infrastructure
- Initialize Next.js project with TypeScript
- Set up AWS CDK infrastructure
- Configure DynamoDB tables (users, invoices)
- Deploy basic infrastructure

### Milestone 2: Authentication System
- Implement mock SSO authentication
- Create user session management
- Set up role-based routing (admin/accountant)
- Add login/logout functionality

### Milestone 3: Admin Portal - Invoice Submission
- Create invoice submission form
- Implement file upload for invoice attachments
- Add form validation and error handling
- Store invoice data in DynamoDB

### Milestone 4: Accountant Portal - Invoice Management
- Build invoice list view with filtering
- Implement invoice approval workflow
- Add invoice detail view
- Update invoice status in database

### Milestone 5: CSV Export Feature
- Create monthly expense report generation
- Implement CSV download functionality
- Add date range filtering
- Optimize query performance

### Milestone 6: Testing & Deployment
- Add unit tests for core functions
- Implement integration tests
- Set up CI/CD pipeline
- Deploy to production environment

## Development Guidelines
- Build features step by step with testing
- Follow minimal code principles
- Focus on core functionality
- Maintain clean, readable code structure
- Use TypeScript for type safety
- Implement proper error handling
- Follow Next.js best practices