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

## Development Guidelines
- Build features step by step with testing
- Follow minimal code principles
- Focus on core functionality
- Maintain clean, readable code structure
- Use TypeScript for type safety
- Implement proper error handling
- Follow Next.js best practices