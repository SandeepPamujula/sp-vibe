# Architecture Decision Record 001: Next.js Monolith vs Split Architecture

## Context
The initial requirement stated: "Use S3 + CloudFront (Static) for frontend deployment and API Gateway + Lambda for Backend deployment". Example use case involves a Multi-tenant Expense Management System.

## Decision
**Selected Strategy: Option A (Next.js Monolith)**
We will deploy the application as a combined Next.js unit on AWS Lambda (using `cdk-nextjs-standalone` or similar constructs), handling both Server-Side Rendering (SSR) and API Routes (`/app/api`).

## Trade-off Analysis

### Option A: Next.js Monolith (Selected)
**Pros:**
1.  **Velocity**: Single codebase, zero context switching between "frontend" and "backend" projects.
2.  **Type Safety**: End-to-end type safety (TypeScript) is automatic. No need to share DTOs via packages.
3.  **Atomic Deployments**: Frontend and Backend are always in sync. No "breaking API changes" causing UI errors during partial rollouts.
4.  **Simplicity**: No CORS (Cross-Origin Resource Sharing) issues. No complex API Gateway configuration.

**Cons:**
1.  **Cold Starts**: The Lambda bundle is larger (contains React, all dependencies, and API logic), potentially increasing cold start times compared to tiny, single-purpose Lambdas.
2.  **Coupling**: UI and Logic are tightly coupled. Harder to "swap out" the frontend later if we moved to Mobile-only.
3.  **Vendor Lock-in**: Heavily relies on Next.js constructs.

### Option B: Split Architecture (Static S3 + API Gateway/Lambda)
**Pros:**
1.  **Decoupling**: Backend is generic JSON API. Can serve Web, Mobile, CLI equally.
2.  **Independent Scaling**: High-traffic API endpoints don't impact the UI rendering infrastructure (though Serverless mitigates this).
3.  **Granular Security**: easier to apply strict WAF rules specifically to `/api` via API Gateway.

**Cons:**
1.  **Complexity**: Requires managing two deployment pipelines, two stacks, and syncing versions.
2.  **CORS**: Browsers will enforce CORS, adding development friction.
3.  **Network Latency**: Extra hop (CloudFront -> Client -> API Gateway) vs internal routing (in Monolith).

## Conclusion
For the current stage (Milestone 1) and team size, **Option A** provides the best balance of speed and functionality. We can refactor key endpoints to separate Lambdas later if performance dictates (Next.js allows rewriting specific routes to external URLs).
