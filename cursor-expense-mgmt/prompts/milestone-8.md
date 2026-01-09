# Milestone 8: Hybrid Architecture Migration (CloudFront + S3 + Lambda)

## Overview

Migrate from ALB + Lambda (full Next.js) architecture to a hybrid architecture: CloudFront → S3 (static pages) + Lambda (dynamic routes) + API Gateway → Lambda (API routes). This approach preserves Server Components for dynamic routes while achieving cost savings on static pages.

**Current Architecture**: ALB → Lambda (Next.js standalone) → handles all routes (pages + API)

**Target Architecture**: 
- CloudFront → S3 (static pages: `/`, `/login`, `/expenses`, `/approvals`, `/reports`)
- CloudFront → Lambda (dynamic routes: `/expenses/[expenseId]/*`)
- CloudFront → API Gateway → Lambda (API routes: `/api/*`)

**Target Cost**: Reduced Lambda invocations (~60-70% reduction), lower operational costs

**Key Benefit**: Preserves Server Components and middleware functionality for dynamic routes while optimizing static page delivery.

---

## Testing Reminder

> **After each task, ask:** "Would you like me to add Jest unit tests and/or Storybook component tests for this task?"

---

## Resource Constraints (CRITICAL)

All infrastructure must adhere to these constraints:

- **Lambda (Next.js + API)**: 512 MB memory, 30s timeout, no reserved concurrency
- **CloudFront**: Price class "Use only North America and Europe", basic caching policies
- **S3 (Frontend)**: No versioning, SSE-S3 encryption, public read access for CloudFront
- **API Gateway**: HTTP API (not REST), no caching, CORS configured
- **CloudWatch**: 7-day log retention, minimal alarms

---

## Route Classification

### Static Routes (S3 + CloudFront)
These routes can be statically exported and served from S3:
- `/` - Home page (public)
- `/login` - Login page (public)
- `/expenses` - Expenses list page (requires client-side data fetching)
- `/expenses/submit` - Expense submission form (requires client-side data fetching)
- `/approvals` - Approvals list page (requires client-side data fetching)
- `/reports` - Reports page (requires client-side data fetching)

**Note**: List pages will use client-side data fetching via API calls.

### Dynamic Routes (Lambda - Next.js)
These routes require Server Components and must remain on Lambda:
- `/expenses/[expenseId]` - Expense detail page (Server Component wrapper)
- `/expenses/[expenseId]/edit` - Expense edit page (Server Component wrapper)

**Note**: These pages already use Client Components for data fetching, but the Server Component wrapper provides route params extraction.

### API Routes (API Gateway + Lambda)
All API routes go through API Gateway:
- `/api/*` - All API endpoints

---

## Tasks

### Phase 0: Pre-Migration Assessment

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.1 | Audit all routes and classify as static vs dynamic (`docs/route-classification.md`) | Pending |
| 8.2 | Identify Server Components that need to remain on Lambda | Pending |
| 8.3 | Document current middleware behavior (`proxy.ts` analysis) | Pending |
| 8.4 | Create route mapping document (static → S3, dynamic → Lambda, API → Gateway) | Pending |
| 8.5 | Baseline current performance metrics (Lambda invocations, response times) | Pending |

### Phase 1: Frontend Stack Infrastructure

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.6 | Create FrontendStack (`lib/stacks/frontend-stack.ts` - S3 bucket for static assets, CloudFront distribution) | Pending |
| 8.7 | Create CloudFront distribution construct (`lib/constructs/cloudfront-distribution.ts` - behaviors, origins, cache policies) | Pending |
| 8.8 | Configure S3 bucket for frontend assets (public read via CloudFront OAC, no versioning, SSE-S3) | Pending |
| 8.9 | Configure CloudFront behaviors (static: S3 origin, dynamic: Lambda origin, API: API Gateway origin) | Pending |
| 8.10 | Set up CloudFront cache policies (static assets: long TTL, HTML: short TTL, API: no cache) | Pending |
| 8.11 | Configure CloudFront origin request policies (forward headers/cookies for dynamic routes and API) | Pending |

### Phase 2: Compute Stack Migration

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.12 | Modify ComputeStack to add API Gateway HTTP API (`lib/stacks/compute-stack.ts` - add HttpApi construct) | Pending |
| 8.13 | Create API-only Lambda function construct (`lib/constructs/api-lambda.ts` - handles only `/api/*` routes) | Pending |
| 8.14 | Create Next.js Lambda function construct (`lib/constructs/nextjs-lambda.ts` - handles dynamic routes only) | Pending |
| 8.15 | Integrate API Gateway with API Lambda (`lib/constructs/api-gateway.ts` - HttpLambdaIntegration) | Pending |
| 8.16 | Configure API Gateway CORS for CloudFront origin | Pending |
| 8.17 | Update Next.js Lambda handler to filter routes (only handle `/expenses/[expenseId]/*`, return 404 for others) | Pending |
| 8.18 | Configure Lambda function URL or ALB target for Next.js Lambda (for CloudFront origin) | Pending |
| 8.19 | Remove old ALB infrastructure from ComputeStack (after migration complete) | Pending |

### Phase 3: CloudFront Routing Configuration

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.20 | Configure CloudFront API behavior (`/api/*` → API Gateway custom HTTP origin) | Pending |
| 8.21 | Configure CloudFront dynamic routes behavior (`/expenses/[expenseId]/*` → Lambda function URL/ALB) | Pending |
| 8.22 | Configure CloudFront default behavior (S3 origin for static routes: `/`, `/login`, `/expenses`, `/approvals`, `/reports`) | Pending |
| 8.23 | Configure CloudFront static assets behavior (`/_next/static/*`, `/public/*` → S3 origin) | Pending |
| 8.24 | Set up CloudFront error responses (404 → index.html for SPA fallback on static routes) | Pending |
| 8.25 | Configure CloudFront viewer certificate (default CloudFront certificate or custom domain) | Pending |
| 8.26 | Wire CloudFront distribution to all origins (S3, Lambda function URL, API Gateway) | Pending |

### Phase 4: Next.js Configuration for Hybrid Build

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.27 | Update Next.js build configuration (`next.config.ts` - configure static export for static routes only) | Pending |
| 8.28 | Create route matcher for static export (`next.config.ts` - `output: 'export'` with route filtering) | Pending |
| 8.29 | Configure `generateStaticParams` for static routes (empty arrays for list pages, client-side fetch) | Pending |
| 8.30 | Ensure dynamic routes are excluded from static export (`/expenses/[expenseId]/*` remain server-side) | Pending |
| 8.31 | Update middleware configuration (ensure `proxy.ts` works for Lambda routes, not needed for static) | Pending |
| 8.32 | Configure environment variables for frontend build (`NEXT_PUBLIC_API_URL` - CloudFront distribution URL) | Pending |

### Phase 5: Build and Deployment Scripts

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.33 | Create build script for static frontend (`scripts/build-static-frontend.sh` - build static export and upload to S3) | Pending |
| 8.34 | Create build script for Next.js Lambda (`scripts/build-nextjs-lambda.sh` - build standalone for dynamic routes) | Pending |
| 8.35 | Create deployment script (`scripts/deploy-hybrid.sh` - deploy static to S3, Lambda functions, invalidate CloudFront) | Pending |
| 8.36 | Configure SSM Parameter Store for CloudFront URL (store distribution URL for Lambda/build process) | Pending |
| 8.37 | Update CI/CD pipeline for hybrid deployment (build static + Lambda separately) | Pending |

### Phase 6: Environment Configuration

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.38 | Update StagingStack to include FrontendStack (`lib/stacks/staging-stack.ts` - instantiate FrontendStack) | Pending |
| 8.39 | Configure environment variables for static frontend build (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`) | Pending |
| 8.40 | Configure environment variables for Next.js Lambda (same as current, plus CloudFront URL) | Pending |
| 8.41 | Configure environment variables for API Lambda (same as current API routes) | Pending |
| 8.42 | Update environment variable documentation (`docs/environment-variables.md`) | Pending |

### Phase 7: Migration and Testing

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.43 | Build and deploy static frontend to S3 (test CloudFront distribution without custom domain) | Pending |
| 8.44 | Deploy Next.js Lambda for dynamic routes (test Lambda function URL/ALB integration) | Pending |
| 8.45 | Deploy API Lambda via API Gateway (test API routes) | Pending |
| 8.46 | Verify static routes load correctly via CloudFront (`/`, `/login`, `/expenses`, `/approvals`, `/reports`) | Pending |
| 8.47 | Verify dynamic routes work via CloudFront (`/expenses/[expenseId]`, `/expenses/[expenseId]/edit`) | Pending |
| 8.48 | Verify API routes work via CloudFront (`/api/*` → API Gateway → Lambda) | Pending |
| 8.49 | Test static assets load correctly (`/_next/static/*`, `/public/*`) | Pending |
| 8.50 | Test CORS configuration (API calls from CloudFront origin) | Pending |
| 8.51 | Verify caching behavior (static assets cached, dynamic routes not cached, API not cached) | Pending |
| 8.52 | Test authentication flow (cookies forwarded from CloudFront to Lambda and API Gateway) | Pending |
| 8.53 | Test middleware behavior (`proxy.ts` works for dynamic routes, client-side auth for static routes) | Pending |
| 8.54 | Verify multi-tenancy isolation (tenant context preserved across all routes) | Pending |
| 8.55 | Performance testing (compare Lambda invocations before/after migration) | Pending |

### Phase 8: DNS and Custom Domain (Optional)

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.56 | Configure ACM certificate for custom domain (`lib/stacks/frontend-stack.ts` - ViewerCertificate) | Pending |
| 8.57 | Update CloudFront distribution with custom domain (alternate domain names, certificate) | Pending |
| 8.58 | Create DNS records (Route53 or external DNS - CNAME to CloudFront) | Pending |
| 8.59 | Test custom domain access (verify SSL certificate, CloudFront routing for all route types) | Pending |

### Phase 9: Cleanup and Documentation

| Task ID | Description | Status |
|---------|-------------|--------|
| 8.60 | Remove ALB infrastructure from ComputeStack (update CfnOutput exports) | Pending |
| 8.61 | Update monitoring stack for hybrid architecture (`lib/stacks/monitoring-stack.ts` - CloudFront, API Gateway, Lambda metrics) | Pending |
| 8.62 | Update deployment documentation (`docs/deployment-staging.md` - hybrid architecture, build process) | Pending |
| 8.63 | Create migration runbook (`docs/migration-hybrid.md` - step-by-step migration guide) | Pending |
| 8.64 | Update infrastructure diagram (`docs/architecture.md` - hybrid CloudFront + S3 + Lambda flow) | Pending |
| 8.65 | Document route classification and routing logic (`docs/route-routing.md`) | Pending |

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
│   │   ├── compute-stack.ts        # MODIFIED: Remove ALB, add API Gateway + Next.js Lambda
│   │   ├── database-stack.ts       # Unchanged
│   │   ├── storage-stack.ts        # Unchanged (separate bucket for files)
│   │   ├── email-stack.ts          # Unchanged
│   │   └── monitoring-stack.ts     # MODIFIED: Add CloudFront + API Gateway metrics
│   └── constructs/
│       ├── cloudfront-distribution.ts  # NEW: CloudFront setup with multiple origins
│       ├── api-lambda.ts               # NEW: API-only Lambda
│       ├── nextjs-lambda.ts            # MODIFIED: Next.js Lambda for dynamic routes only
│       ├── api-gateway.ts              # MODIFIED: Update for CloudFront CORS
│       └── alb-lambda.ts               # DEPRECATED: Remove after migration
├── config/
│   └── staging.json                # MODIFIED: Add CloudFront config, route classification
└── scripts/
    ├── build-static-frontend.sh    # NEW: Build and upload static assets
    ├── build-nextjs-lambda.sh      # NEW: Build Next.js Lambda for dynamic routes
    └── deploy-hybrid.sh            # NEW: Deploy all components
```

---

## CloudFront Routing Rules

### Priority 1: API Routes
- **Paths**: `/api/*`
- **Origin**: API Gateway HTTP API (custom HTTP origin)
- **Cache Policy**: `CachingDisabled` (no caching for API)
- **Origin Request Policy**: `AllViewer` (forward all headers, query strings, cookies)
- **Viewer Protocol**: `RedirectToHTTPS`
- **Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`

### Priority 2: Dynamic Routes
- **Paths**: `/expenses/[expenseId]/*` (e.g., `/expenses/123`, `/expenses/123/edit`)
- **Origin**: Lambda Function URL or ALB target (Next.js Lambda)
- **Cache Policy**: `CachingDisabled` (no caching for dynamic routes)
- **Origin Request Policy**: `AllViewer` (forward all headers, query strings, cookies)
- **Viewer Protocol**: `RedirectToHTTPS`
- **Methods**: `GET`, `HEAD`, `OPTIONS`

### Priority 3: Static Assets
- **Paths**: `/_next/static/*`, `/public/*`, `/*.js`, `/*.css`, `/*.json`, `/*.ico`, `/*.png`, `/*.jpg`, `/*.svg`
- **Origin**: S3 bucket (frontend assets)
- **Cache Policy**: `CachingOptimized` (long TTL for static assets)
- **Origin Request Policy**: None (direct S3 access)
- **Viewer Protocol**: `RedirectToHTTPS`
- **Methods**: `GET`, `HEAD`, `OPTIONS`

### Priority 4: Static Pages (Default)
- **Paths**: `/`, `/login`, `/expenses`, `/expenses/submit`, `/approvals`, `/reports`
- **Origin**: S3 bucket (frontend assets)
- **Cache Policy**: `CachingOptimizedForCompression` (short TTL for HTML, revalidate)
- **Origin Request Policy**: None (direct S3 access)
- **Viewer Protocol**: `RedirectToHTTPS`
- **Methods**: `GET`, `HEAD`, `OPTIONS`

**Note**: CloudFront evaluates behaviors in order, so API routes are checked first, then dynamic routes, then static assets, then default to static pages.

---

## Environment Variables

### Frontend Build-Time Variables (Static Export)
```env
NEXT_PUBLIC_API_URL=https://d1234.cloudfront.net  # CloudFront distribution URL
NEXT_PUBLIC_APP_URL=https://staging.expense-mgmt.example.com
NODE_ENV=production  # For static export
```

### Next.js Lambda Runtime Variables (Dynamic Routes)
```env
NODE_ENV=staging
DATABASE_SECRET_ARN=arn:aws:secretsmanager:...
JWT_SECRET_ARN=arn:aws:secretsmanager:...
S3_BUCKET=expense-mgmt-staging-files  # StorageStack bucket (not frontend bucket)
SES_FROM_EMAIL=noreply@staging.expense-mgmt.example.com
CLOUDFRONT_DISTRIBUTION_URL=https://d1234.cloudfront.net
```

### API Lambda Runtime Variables
```env
NODE_ENV=staging
DATABASE_SECRET_ARN=arn:aws:secretsmanager:...
JWT_SECRET_ARN=arn:aws:secretsmanager:...
S3_BUCKET=expense-mgmt-staging-files  # StorageStack bucket
SES_FROM_EMAIL=noreply@staging.expense-mgmt.example.com
```

---

## Caching Strategy

### CloudFront Caching
- **Static Assets** (`/_next/static/*`, `/public/*`): 1 year TTL, immutable
- **Static HTML Pages** (`/`, `/login`, `/expenses`, etc.): 5 minutes TTL or no cache, revalidate
- **Dynamic Routes** (`/expenses/[expenseId]/*`): No caching, forward all headers/cookies
- **API Routes** (`/api/*`): No caching, forward all headers/cookies

### Browser Caching
- **Static Assets**: `Cache-Control: public, max-age=31536000, immutable`
- **Static HTML Pages**: `Cache-Control: public, max-age=0, must-revalidate`
- **Dynamic Routes**: `Cache-Control: no-cache` (set by Lambda)
- **API Responses**: `Cache-Control: no-cache` (set by Lambda)

---

## Next.js Configuration

### Static Export Configuration
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Only export static routes, keep dynamic routes on Lambda
  output: 'export',
  
  // Exclude dynamic routes from static export
  // These will be handled by Next.js Lambda
  // Note: This is handled by build script logic, not Next.js config
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};
```

**Note**: Next.js doesn't natively support partial static export. The build script will:
1. Build static export (includes all routes that can be statically generated)
2. Extract dynamic routes to separate Lambda build
3. Upload static routes to S3
4. Deploy dynamic routes to Lambda

---

## Migration Order

1. **Phase 0**: Assess current architecture and classify routes
2. **Phase 1-2**: Create new infrastructure (FrontendStack, API Gateway, Next.js Lambda) - no traffic
3. **Phase 3**: Configure CloudFront routing (test with placeholder content)
4. **Phase 4**: Configure Next.js for hybrid build
5. **Phase 5**: Create build and deployment scripts
6. **Phase 6**: Configure environment variables
7. **Phase 7**: Build and deploy, test all route types
8. **Phase 8**: Configure custom domain (optional)
9. **Phase 9**: Remove ALB infrastructure, update documentation

---

## Key Differences from Milestone 7

| Aspect | Milestone 7 (Full Static) | Milestone 8 (Hybrid) |
|--------|---------------------------|----------------------|
| **Dynamic Routes** | Converted to CSR | Remain on Lambda (Server Components) |
| **Middleware** | Removed (client-side only) | Preserved for dynamic routes |
| **Refactoring** | Extensive (Server Components → Client) | Minimal (build script changes) |
| **SEO** | Poor (CSR for all pages) | Good (static pages pre-rendered) |
| **Cost Savings** | ~72% Lambda reduction | ~60-70% Lambda reduction |
| **Complexity** | Lower infrastructure, higher code changes | Higher infrastructure, lower code changes |

---

## Key References

- **Architectural Analysis**: `docs/architectural-tradeoffs-milestone-7.md`
- **Infrastructure Rules**: `.cursor/rules/31-infrastructure-cloudfront.mdc`
- **Architecture Doc**: `docs/architecture.md`
- **Current Infrastructure**: `.cursor/rules/30-infrastructure-staging.mdc`

---

## Decision Points

1. **Lambda Function URL vs ALB for Next.js Lambda**: 
   - **Decision**: Lambda Function URL (simpler, lower cost)
   - **Rationale**: No need for ALB features, Function URL provides HTTP endpoint

2. **Route Classification**:
   - **Decision**: List pages (`/expenses`, `/approvals`) are static with client-side data fetching
   - **Rationale**: Components already use client-side fetching, minimal refactoring needed

3. **Build Strategy**:
   - **Decision**: Separate builds for static export and Lambda
   - **Rationale**: Next.js doesn't support partial static export natively

4. **Middleware Handling**:
   - **Decision**: `proxy.ts` runs only on Lambda (dynamic routes), client-side auth for static routes
   - **Rationale**: Static routes don't need server-side middleware

---

## Assumptions

1. List pages (`/expenses`, `/approvals`, `/reports`) can use client-side data fetching (already implemented)
2. Dynamic routes (`/expenses/[expenseId]/*`) require Server Components (for route params)
3. Authentication is stateless (JWT tokens in cookies/headers)
4. File uploads handled via API (presigned S3 URLs)
5. `NEXT_PUBLIC_*` variables injected at build time
6. Lambda remains in VPC for RDS access
7. CloudFront can route to Lambda Function URL as origin

---

## Risk Mitigation

### Risk 1: Route Classification Errors
**Mitigation**: Thorough testing in Phase 7, route classification document in Phase 0

### Risk 2: Middleware Not Working for Dynamic Routes
**Mitigation**: Test middleware behavior in Phase 7, ensure Lambda has same middleware code

### Risk 3: Build Script Complexity
**Mitigation**: Create comprehensive build scripts in Phase 5, document build process

### Risk 4: CloudFront Routing Misconfiguration
**Mitigation**: Test all route types in Phase 7, verify CloudFront behavior order

### Risk 5: Performance Degradation
**Mitigation**: Baseline metrics in Phase 0, performance testing in Phase 7

---

## Success Criteria

- ✅ Static routes load from S3 via CloudFront
- ✅ Dynamic routes work via Lambda Function URL
- ✅ API routes work via API Gateway
- ✅ Authentication works for all route types
- ✅ Multi-tenancy isolation preserved
- ✅ Lambda invocations reduced by 60-70%
- ✅ No functionality regressions
- ✅ Performance maintained or improved

---

## Prompt History

(Prompts will be added as tasks are completed)

