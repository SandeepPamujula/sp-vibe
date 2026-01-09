# Milestone 7: S3 + CloudFront Frontend + Lambda API Backend Migration

## Overview

Migrate from ALB + Lambda (full Next.js) architecture to S3 + CloudFront (static frontend) + Lambda + API Gateway (API-only backend). This separation improves cost efficiency, reduces Lambda invocations, and enables better caching strategies.

**Current Architecture**: ALB → Lambda (Next.js standalone) → handles all routes (pages + API)

**Target Architecture**: CloudFront → S3 (static pages/assets) + API Gateway → Lambda (API only)

**Target Cost**: Reduced Lambda invocations, lower operational costs

---

## Testing Reminder

> **After each task, ask:** "Would you like me to add Jest unit tests and/or Storybook component tests for this task?"

---

## Resource Constraints (CRITICAL)

All infrastructure must adhere to these constraints:

- **Lambda (API-only)**: 512 MB memory, 30s timeout, no reserved concurrency
- **CloudFront**: Price class "Use only North America and Europe", basic caching policies
- **S3 (Frontend)**: No versioning, SSE-S3 encryption, public read access for CloudFront
- **API Gateway**: HTTP API (not REST), no caching, CORS configured
- **CloudWatch**: 7-day log retention, minimal alarms

---

## Tasks

### Phase 1: Frontend Stack Infrastructure

| Task ID | Description | Status |
|---------|-------------|--------|
| 7.1 | Create FrontendStack (`lib/stacks/frontend-stack.ts` - S3 bucket for static assets, CloudFront distribution) | Pending |
| 7.2 | Create CloudFront distribution construct (`lib/constructs/cloudfront-distribution.ts` - behaviors, origins, cache policies) | Pending |
| 7.3 | Configure S3 bucket for frontend assets (public read via CloudFront OAC, no versioning, SSE-S3) | Pending |
| 7.4 | Configure CloudFront behaviors (default: S3 origin, API: API Gateway origin) | Pending |
| 7.5 | Set up CloudFront cache policies (static assets: long TTL, HTML: short TTL, API: no cache) | Pending |
| 7.6 | Configure CloudFront origin request policies (forward headers/cookies for API routes) | Pending |

### Phase 2: Compute Stack Migration

| Task ID | Description | Status |
|---------|-------------|--------|
| 7.7 | Modify ComputeStack to add API Gateway HTTP API (`lib/stacks/compute-stack.ts` - add HttpApi construct) | Pending |
| 7.8 | Create API-only Lambda function construct (`lib/constructs/api-lambda.ts` - handles only `/api/*` routes) | Pending |
| 7.9 | Integrate API Gateway with Lambda (`lib/constructs/api-gateway.ts` - HttpLambdaIntegration) | Pending |
| 7.10 | Configure API Gateway CORS for CloudFront origin | Pending |
| 7.11 | Remove ALB infrastructure from ComputeStack (`lib/stacks/compute-stack.ts` - remove AlbLambda construct) | Pending |
| 7.12 | Update Lambda handler to filter non-API routes (return 404 for non-API paths) | Pending |

### Phase 3: CloudFront Routing Configuration

| Task ID | Description | Status |
|---------|-------------|--------|
| 7.13 | Configure CloudFront default behavior (S3 origin for `/`, `/_next/static/*`, `/public/*`) | Pending |
| 7.14 | Configure CloudFront API behavior (`/api/*` → API Gateway custom origin) | Pending |
| 7.15 | Set up CloudFront error responses (SPA routing: 404 → index.html) | Pending |
| 7.16 | Configure CloudFront viewer certificate (default CloudFront certificate or custom domain) | Pending |
| 7.17 | Wire CloudFront distribution to API Gateway origin (custom HTTP origin) | Pending |

### Phase 4: Environment Configuration

| Task ID | Description | Status |
|---------|-------------|--------|
| 7.18 | Update StagingStack to include FrontendStack (`lib/stacks/staging-stack.ts` - instantiate FrontendStack) | Pending |
| 7.19 | Configure environment variables for frontend build (`NEXT_PUBLIC_API_URL` - CloudFront distribution URL) | Pending |
| 7.20 | Update Next.js build configuration for static export (`next.config.ts` - `output: 'export'` or static generation) | Pending |
| 7.21 | Create build script for static frontend (`scripts/build-static-frontend.sh` - build and upload to S3) | Pending |
| 7.22 | Configure SSM Parameter Store for CloudFront URL (store distribution URL for Lambda/build process) | Pending |

### Phase 5: Migration and Testing

| Task ID | Description | Status |
|---------|-------------|--------|
| 7.23 | Build and deploy static frontend to S3 (test CloudFront distribution without custom domain) | Pending |
| 7.24 | Verify static assets load correctly via CloudFront (test `/_next/static/*`, `/public/*`) | Pending |
| 7.25 | Verify API routes work via CloudFront (`/api/*` → API Gateway → Lambda) | Pending |
| 7.26 | Test CORS configuration (API calls from CloudFront origin) | Pending |
| 7.27 | Verify caching behavior (static assets cached, API responses not cached) | Pending |
| 7.28 | Test authentication flow (cookies forwarded from CloudFront to API Gateway) | Pending |

### Phase 6: DNS and Custom Domain (Optional)

| Task ID | Description | Status |
|---------|-------------|--------|
| 7.29 | Configure ACM certificate for custom domain (`lib/stacks/frontend-stack.ts` - ViewerCertificate) | Pending |
| 7.30 | Update CloudFront distribution with custom domain (alternate domain names, certificate) | Pending |
| 7.31 | Create DNS records (Route53 or external DNS - CNAME to CloudFront) | Pending |
| 7.32 | Test custom domain access (verify SSL certificate, CloudFront routing) | Pending |

### Phase 7: Cleanup and Documentation

| Task ID | Description | Status |
|---------|-------------|--------|
| 7.33 | Remove ALB-related outputs from ComputeStack (update CfnOutput exports) | Pending |
| 7.34 | Update monitoring stack for API Gateway metrics (`lib/stacks/monitoring-stack.ts` - add API Gateway alarms) | Pending |
| 7.35 | Update deployment documentation (`docs/deployment-staging.md` - new architecture, build process) | Pending |
| 7.36 | Create migration runbook (`docs/migration-cloudfront.md` - step-by-step migration guide) | Pending |
| 7.37 | Update infrastructure diagram (`docs/architecture.md` - new CloudFront + S3 + API Gateway flow) | Pending |

---

## Infrastructure Structure

```
infrastructure/
├── bin/
│   └── expense-app.ts              # CDK app entry point (add FrontendStack)
├── lib/
│   ├── stacks/
│   │   ├── staging-stack.ts        # Main staging stack (add FrontendStack)
│   │   ├── frontend-stack.ts       # NEW: S3 + CloudFront stack
│   │   ├── compute-stack.ts        # MODIFIED: Remove ALB, add API Gateway
│   │   ├── database-stack.ts       # Unchanged
│   │   ├── storage-stack.ts        # Unchanged (separate bucket for files)
│   │   ├── email-stack.ts          # Unchanged
│   │   └── monitoring-stack.ts     # MODIFIED: Add API Gateway metrics
│   └── constructs/
│       ├── cloudfront-distribution.ts  # NEW: CloudFront setup
│       ├── api-lambda.ts               # NEW: API-only Lambda
│       ├── api-gateway.ts              # MODIFIED: Update for CloudFront CORS
│       ├── nextjs-lambda.ts            # DEPRECATED: Remove after migration
│       └── alb-lambda.ts               # DEPRECATED: Remove after migration
├── config/
│   └── staging.json                # MODIFIED: Add CloudFront config
└── scripts/
    └── build-static-frontend.sh    # NEW: Build and upload static assets
```

---

## CloudFront Routing Rules

### Default Behavior (Priority 1)
- **Paths**: `/`, `/_next/static/*`, `/public/*`, `/*.html`, `/*.js`, `/*.css`, `/*.json`
- **Origin**: S3 bucket (frontend assets)
- **Cache Policy**: `CachingOptimized` (long TTL for static assets)
- **Origin Request Policy**: None (direct S3 access)
- **Viewer Protocol**: `RedirectToHTTPS`
- **Methods**: `GET`, `HEAD`, `OPTIONS`

### API Behavior (Priority 2)
- **Paths**: `/api/*`
- **Origin**: API Gateway HTTP API (custom HTTP origin)
- **Cache Policy**: `CachingDisabled` (no caching for API)
- **Origin Request Policy**: `AllViewer` (forward all headers, query strings, cookies)
- **Viewer Protocol**: `RedirectToHTTPS`
- **Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`

---

## Environment Variables

### Frontend Build-Time Variables
```env
NEXT_PUBLIC_API_URL=https://d1234.cloudfront.net  # CloudFront distribution URL
NEXT_PUBLIC_APP_URL=https://staging.expense-mgmt.example.com
NODE_ENV=production  # For static export
```

### Backend Runtime Variables (Lambda)
```env
NODE_ENV=staging
DATABASE_SECRET_ARN=arn:aws:secretsmanager:...
JWT_SECRET_ARN=arn:aws:secretsmanager:...
S3_BUCKET=expense-mgmt-staging-files  # StorageStack bucket (not frontend bucket)
SES_FROM_EMAIL=noreply@staging.expense-mgmt.example.com
```

---

## Caching Strategy

### CloudFront Caching
- **Static Assets** (`/_next/static/*`, `/public/*`): 1 year TTL, immutable
- **HTML Pages** (`/`, `/*.html`): 5 minutes TTL or no cache, revalidate
- **API Routes** (`/api/*`): No caching, forward all headers/cookies

### Browser Caching
- **Static Assets**: `Cache-Control: public, max-age=31536000, immutable`
- **HTML Pages**: `Cache-Control: public, max-age=0, must-revalidate`
- **API Responses**: `Cache-Control: no-cache` (set by Lambda)

---

## Migration Order

1. **Phase 1-2**: Create new infrastructure (FrontendStack, API Gateway) - no traffic
2. **Phase 3**: Configure CloudFront routing (test with placeholder content)
3. **Phase 4**: Build and deploy static frontend to S3
4. **Phase 5**: Test CloudFront + API Gateway integration
5. **Phase 6**: Configure custom domain (optional)
6. **Phase 7**: Remove ALB infrastructure, update documentation

---

## Key References

- **Migration Plan**: `/Users/deepu/.cursor/plans/s3_cloudfront_lambda_migration_78421d77.plan.md`
- **Infrastructure Rules**: `.cursor/rules/31-infrastructure-cloudfront.mdc`
- **Architecture Doc**: `docs/architecture.md`
- **Current Infrastructure**: `.cursor/rules/30-infrastructure-staging.mdc`

---

## Decision Points

1. **API Gateway vs ALB**: API Gateway HTTP API (lower cost, simpler)
2. **CloudFront API Routing**: API Gateway as custom HTTP origin (simplest)
3. **Frontend Bucket**: Separate S3 bucket for frontend (different from StorageStack)
4. **Static Export**: Full static export (all pages pre-rendered)
5. **Custom Domain**: Optional (can use CloudFront domain initially)

---

## Assumptions

1. Next.js can be built as static export (`output: 'export'`)
2. All API routes are under `/api/*` path
3. Authentication is stateless (JWT tokens in cookies/headers)
4. File uploads handled via API (presigned S3 URLs)
5. `NEXT_PUBLIC_*` variables injected at build time
6. Lambda remains in VPC for RDS access

---

## Prompt History

(Prompts will be added as tasks are completed)

