# Architecture & Deployment

## Tech Stack
- **Frontend & Backend**: Next.js with TypeScript
- **Database**: DynamoDB (invoice metadata & expense details)
- **File Storage**: Amazon S3 (invoice attachments)
- **Email Service**: Amazon SES (event notifications)
- **Infrastructure**: AWS CDK
- **Validation**: Zod for schema validation
- **Testing**: Jest (unit/integration tests)
- **Component Testing**: Storybook
- **Error Tracking**: Sentry
- **Code Quality**: ESLint, Prettier

## Deployment Architecture

### Deployment Model: Serverless with Lambda + API Gateway

**Primary Components:**
1. **Next.js Application** - Deployed as serverless Lambda functions with standalone output
2. **API Gateway** - REST API or HTTP API for routing requests to Lambda functions
3. **DynamoDB** - Invoice metadata and expense details tables with GSI indexes
4. **S3 Bucket** - Invoice file attachments with CORS, lifecycle policies, and access controls
5. **Amazon SES** - Email notification service with verified email addresses
6. **CloudFront** - CDN for static assets and edge caching (optional)
7. **IAM Roles** - Least privilege access policies for all services
8. **CloudWatch** - Logging, monitoring, and alarms

### Next.js Deployment Strategy

**Build Configuration:**
- Use Next.js `output: 'standalone'` mode for optimized serverless deployment
- Build Next.js with `npm run build` to generate standalone output
- Package API routes as Lambda functions
- Deploy static assets to S3 + CloudFront (or serve from Lambda)

**Lambda Function Structure:**
- Each Next.js API route becomes a Lambda function
- Use Lambda layers for shared dependencies
- Configure appropriate timeout and memory settings
- Environment variables injected at deployment time

### Infrastructure Structure

```
infrastructure/
├── cdk.json                    # CDK configuration
├── package.json                # CDK dependencies
├── tsconfig.json               # TypeScript config for CDK
├── bin/
│   └── app.ts                  # CDK app entry point
├── lib/
│   ├── stacks/
│   │   ├── invoice-stack.ts    # Main application stack
│   │   ├── database-stack.ts   # DynamoDB tables and indexes
│   │   ├── storage-stack.ts    # S3 buckets and policies
│   │   └── email-stack.ts      # SES configuration
│   └── constructs/
│       ├── nextjs-lambda-construct.ts  # Next.js Lambda deployment
│       └── api-gateway-construct.ts    # API Gateway setup
└── config/
    ├── staging.json            # Staging environment config
    └── production.json         # Production environment config
```

### DynamoDB Schema Design

**UsersTable:**
- Partition Key: `email` (String)
- Attributes: `role` (admin/accountant), `name`, `createdAt`, `lastLogin`
- Purpose: Store user authentication and role information

**InvoicesTable:**
- Partition Key: `invoiceId` (String)
- Sort Key: `createdAt` (String/Number)
- Attributes: `vendorName`, `amount`, `status` (DRAFT/UNDER_REVIEW/APPROVED/REJECTED), `files` (array of InvoiceFileMetadata objects supporting multiple files), `description`, `invoiceDate`, `history` (array of InvoiceHistoryEntry objects - unified comments and audit trail)
- Global Secondary Indexes:
  - `vendor-index`: Partition key `vendorName`, Sort key `createdAt` (for vendor search)
  - `status-index`: Partition key `status`, Sort key `createdAt` (for status filtering)
  - Note: submittedBy and approvedBy derived from history entries (SUBMITTED and APPROVED entry types)
- Purpose: Store invoice/expense records with unified history containing both comments and audit trail entries

### S3 Bucket Configuration

**Bucket Features:**
- CORS configuration for web uploads
- Lifecycle policies for cost optimization (move to Glacier after X days)
- Bucket policies restricting access to authenticated users only
- File validation (allowed types: PDF, PNG, JPEG, HEIC; max size: 10 MB per file; max 5 files per submission)
- Versioning enabled for audit trail
- Server-side encryption (SSE-S3 or SSE-KMS)

### Deployment Process

1. **Build Phase:**
   - Run `npm run build` to build Next.js application
   - Generate standalone output optimized for Lambda
   - Package application artifacts

2. **CDK Deployment:**
   - Run `cdk deploy` to provision AWS resources
   - CDK creates/updates all infrastructure components
   - Application code deployed to Lambda functions
   - Static assets deployed to S3
   - Environment variables configured

3. **Post-Deployment:**
   - Health check validation
   - Smoke tests for critical endpoints
   - Verify DynamoDB tables and indexes
   - Verify S3 bucket access
   - Verify SES email configuration

### Environment Management

- **Separate CDK Stacks**: One stack per environment (staging, production)
- **Configuration Files**: Environment-specific config in `config/` directory
- **Secrets Management**: Use AWS Secrets Manager or Parameter Store for sensitive data
- **Environment Variables**: Injected at deployment time via CDK

### Security Considerations

- IAM roles with least privilege principle
- S3 bucket policies restricting access
- DynamoDB access policies via IAM
- API Gateway authentication (API keys, IAM, or Cognito if needed)
- VPC configuration if required for private resources
- Security groups for network isolation
- Encryption at rest (DynamoDB, S3)
- Encryption in transit (HTTPS/TLS)

### Monitoring & Logging

- **CloudWatch Logs**: All Lambda function logs
- **CloudWatch Metrics**: DynamoDB, S3, API Gateway, Lambda metrics
- **CloudWatch Alarms**: Error rates, latency, throttling
- **X-Ray Tracing**: Optional for distributed tracing
- **Sentry Integration**: Application-level error tracking

### Cost Optimization

- Lambda: Pay per request, optimize memory/timeout settings
- DynamoDB: On-demand or provisioned capacity based on usage
- S3: Lifecycle policies to move old files to cheaper storage tiers
- CloudFront: Cache static assets to reduce origin requests
- API Gateway: Use HTTP API for lower cost vs REST API

### Next.js Configuration for Serverless

**next.config.js requirements:**
```javascript
module.exports = {
  output: 'standalone',  // Required for Lambda deployment
  // Other Next.js config...
}
```

**Build Script:**
- Ensure build generates `.next/standalone` directory
- Package standalone output for Lambda deployment
- Include necessary dependencies in Lambda layer or function package

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
  - `controllers/` - API route handlers (Next.js API routes)
  - `services/` - Business logic layer
  - `db/` - Database operations (DynamoDB)
- All API routes should use proper error handling
- Implement request validation using Zod schemas
- Use standardized API response format
