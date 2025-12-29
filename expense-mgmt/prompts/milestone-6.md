# Milestone 6: AWS Infrastructure and Deployment (Staging)

## Overview

Implement AWS CDK infrastructure for staging environment following the Preferred AWS Deployment Model (serverless with Lambda + API Gateway). All resources must follow strict minimal constraints for <10 active users as defined in `.cursor/rules/30-infrastructure-staging.mdc`.

**Architecture**: Next.js standalone → Lambda → HTTP API Gateway → RDS PostgreSQL + S3 + SES + CloudWatch

**Target Cost**: ~$20-30/month for staging environment

---

## Testing Reminder

> **After each task, ask:** "Would you like me to add Jest unit tests and/or Storybook component tests for this task?"

---

## Resource Constraints (CRITICAL)

All infrastructure must adhere to these minimal constraints:

- **Lambda**: 128 MB memory, 30s timeout, no reserved concurrency
- **RDS**: db.t3.micro instance, 20 GB storage, single AZ, 7-day backups
- **S3**: No versioning, SSE-S3 encryption, no lifecycle policies
- **API Gateway**: HTTP API (not REST), no caching
- **CloudWatch**: 7-day log retention, minimal alarms
- **SES**: Sandbox mode only

---

## Tasks

### Phase 1: CDK Project Setup

| Task ID | Description | Status |
|---------|-------------|--------|
| 6.1 | Initialize CDK project structure (`infrastructure/` directory, `bin/expense-app.ts`, `cdk.json`, `package.json`, `tsconfig.json`) | Pending |
| 6.2 | Create staging configuration (`config/staging.json` with resource constraints and environment variables) | Pending |

### Phase 2: Core Infrastructure Stacks

| Task ID | Description | Status |
|---------|-------------|--------|
| 6.3 | Define RDS PostgreSQL stack (`lib/stacks/database-stack.ts` - db.t3.micro, single AZ, 20 GB, 7-day backups, Secrets Manager) | Pending |
| 6.4 | Define S3 storage stack (`lib/stacks/storage-stack.ts` - no versioning, SSE-S3, CORS, bucket policy) | Pending |
| 6.5 | Define SES email stack (`lib/stacks/email-stack.ts` - sandbox mode, verified emails) | Pending |
| 6.6 | Define CloudWatch monitoring stack (`lib/stacks/monitoring-stack.ts` - 7-day retention, minimal alarms) | Pending |

### Phase 3: Compute Infrastructure

| Task ID | Description | Status |
|---------|-------------|--------|
| 6.7 | Create Next.js Lambda construct (`lib/constructs/nextjs-lambda.ts` - Node.js 20.x, 128 MB, 30s timeout, VPC config) | Pending |
| 6.8 | Create API Gateway construct (`lib/constructs/api-gateway.ts` - HTTP API, CORS, Lambda integration) | Pending |
| 6.9 | Define compute stack (`lib/stacks/compute-stack.ts` - Lambda + API Gateway, IAM roles with least privilege) | Pending |

### Phase 4: Main Staging Stack

| Task ID | Description | Status |
|---------|-------------|--------|
| 6.10 | Create main staging stack (`lib/stacks/staging-stack.ts` - orchestrate all sub-stacks, apply constraints) | Pending |
| 6.11 | Configure Next.js for standalone output (`next.config.ts` - set `output: 'standalone'` for Lambda) | Pending |

### Phase 5: CI/CD Pipeline

| Task ID | Description | Status |
|---------|-------------|--------|
| 6.12 | Create GitHub Actions workflow for staging (`.github/workflows/deploy-staging.yml` - build, test, deploy to staging) | Pending |
| 6.13 | Add deployment scripts (`scripts/deploy-staging.sh`, `scripts/validate-infrastructure.sh`) | Pending |

### Phase 6: Documentation

| Task ID | Description | Status |
|---------|-------------|--------|
| 6.14 | Document deployment process (`docs/deployment-staging.md` - prerequisites, steps, troubleshooting) | Pending |
| 6.15 | Create pre-deployment checklist (verify all resource constraints are met) | Pending |

---

## Infrastructure Structure

```
infrastructure/
├── bin/
│   └── expense-app.ts          # CDK app entry point
├── lib/
│   ├── stacks/
│   │   ├── staging-stack.ts    # Main staging stack
│   │   ├── database-stack.ts   # RDS PostgreSQL (minimal)
│   │   ├── storage-stack.ts    # S3 bucket (minimal)
│   │   ├── email-stack.ts      # SES configuration
│   │   ├── monitoring-stack.ts # CloudWatch logs/alarms
│   │   └── compute-stack.ts    # Lambda + API Gateway
│   └── constructs/
│       ├── nextjs-lambda.ts    # Next.js Lambda deployment
│       ├── api-gateway.ts      # API Gateway setup
│       └── rds-instance.ts     # RDS instance (minimal)
├── config/
│   └── staging.json            # Staging-specific config
├── cdk.json
├── package.json
└── tsconfig.json
```

---

## Key References

- **Infrastructure Rules**: `.cursor/rules/30-infrastructure-staging.mdc`
- **Architecture Doc**: `docs/architecture.md`
- **Deployment Model**: Serverless with Lambda + API Gateway

---

## Prompt History

(Prompts will be added as tasks are completed)

