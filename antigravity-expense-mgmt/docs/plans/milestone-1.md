# Milestone 1: Foundation & Core Setup - Detailed Plan

## Goals
- Setup Next.js Monorepo structure.
- Deploy infrastructure (S3, CloudFront).
- Implement Mock Auth and Database Connection.

## Tasks

### Application Core (Next.js)
- [x] **1.2**: Initialize Next.js project.
    - [x] Setup TypeScript, TailwindCSS, ESLint, Prettier.
    - [x] Configure Atomic Design structure (`components/atoms`, etc).
    - [x] Implement `APIResponse` wrapper and Global Error Handler.
    - [x] *Test*: Verify build (`npm run build`).
- [x] **1.3**: Configure Libraries.
    - [x] Setup Zod for validation.
    - [x] Setup Jest & React Testing Library.
    - [x] *Test*: Create a sample unit test to verify Jest setup.
- [x] **1.3.1**: Observability Setup.
    - [x] Implement Structured Logger (JSON format with RequestId/TenantId) (NFR).
    - [x] *Test*: Verify logs appear in console/output.
- [x] **1.3.2**: Security Headers.
    - [x] Configure strict CSP and Security Headers in `next.config.js` (NFR).

### Authentication & Database
- [x] **1.4**: Implement Mock Authentication.
    - [x] Create `AuthContext`.
    - [x] Build Login Page with Role Selection.
    - [x] *Test*: Unit test for `AuthContext` (Login/Logout logic).
- [x] **1.5**: Database Setup.
    - [x] Configure Mongoose Connection.
    - [x] Define `Tenant` and `User` Schemas.
    - [x] *Test*: Unit/Integration test for Database connection (using `mongodb-memory-server` if possible, or mock).
- [x] **1.6**: Seeding & Backfilling.
    - [x] Create seed script for Reference Data (Expense Types, GL Codes - Backfilling support).
    - [x] Create seed script for Tenants/Users.
    - [x] *Test*: Verify seed script populates correct data in DB.

### Infrastructure (CDK)
- [x] **1.1**: Initialize CDK project in `infra/`.
- [x] **1.1.1**: Define `NextJsStack` (Lambda/S3/CF for Next.js).
- [x] **1.1.2**: Define `StorageStack` (S3 for documents).
- [x] **1.1.3**: Configure Deployment Scripts (`npm run deploy`).
- [x] **1.1.4**: *Test*: Verify CDK synthesis and stack structure (`cdk synth`).
- [ ] **1.1.5**: Setup CI/CD Pipeline (GitHub Actions).
    - [ ] Create `.github/workflows/ci.yml` (Build, Test, Lint).

## Deliverables
- Deployed Next.js App URL.
- Working Login Page with Tests.
- Database connected.

## Execution Log
- **User Prompt**: "add tests for each task" -> Added testing sub-tasks to all items.
- **User Prompt**: "add CI/CD" -> Added Task 1.1.5.
- **User Prompt**: "Impelment Global Error Handler" -> Added Task 1.2.x.
- **User Prompt**: "differ StorageStack" -> Moved Task 1.1.2 to Milestone 3.
- **User Prompt**: "implement task 1.1" -> Initialized CDK project, verified synthesis, and marked Task 1.1 as complete.
- [x] **User Prompt**: "Option A is fine. however, i like to know the tradeoffs" -> Documented decision for Next.js Monolith in `docs/design/architecture-decision-001-deployment-strategy.md` and explained trade-offs.
- **User Prompt**: "implement task 1.1.1 and 1.1.2" -> Defined `NextJsStack` and `StorageStack`, and created placeholder `app` directory to enable CDK synthesis.
- **User Prompt**: "move 1.1 and its subtasks to the end" -> Rearranged tasks to prioritize Application Core and Auth/DB implementation.
- **User Prompt**: "implement 1.2" -> Initialized Next.js project with TypeScript, TailwindCSS, ESLint, and Prettier. Configured Atomic Design structure (atoms/molecules/organisms/templates). Implemented APIResponse wrapper and Global Error Handler. Verified build succeeds.
- **User Prompt**: "why source code and package.json is present in /app instead of root?" -> Explained monorepo structure with separate workspaces for web application and infrastructure.
- **User Prompt**: "suggest a different name for app folder" -> Suggested `web` as the new name for better clarity and industry standard alignment.
- **User Prompt**: "yes, web looks good" -> Renamed `app/` to `web/` and updated all references in package.json files and CDK stack configuration. Verified build succeeds.
- **User Prompt**: "implement task 1.1.3" -> Configured orchestrated deployment scripts in root `package.json`. Updated `infra` stacks to support environment context (dev/prod). Created `docs/deployment-guide.md`. Fixed Next.js build issue with `global-error.tsx`. Verified CDK synthesis with OpenNext integration.
- **User Prompt**: "ignore temp files" -> Updated `.gitignore` files at root, `web/`, and `infra/` to exclude `.open-next/`, `cdk.out/`, and compiled JS artifacts.
- **User Prompt**: "display health api data on inital page" -> Re-designed the landing page with a premium UI and integrated live health status fetching from the system API.
- **User Prompt**: "unable to npm run deploy:dev Error: ENOENT..." -> Fixed OpenNext broken symlinks issue. Combined CDK asset exclusions with a post-build cleanup script. Documented RCA in `docs/troubleshooting/rca-001-opennext-symlink-enoent.md`.
- **User Prompt**: "Health api details are not shown using cloudfront url..." -> Fixed production health check by dynamically determining the base URL using request headers (`host` and `x-forwarded-proto`).
- **User Prompt**: "update prompt history" -> Created `docs/history/milestone-1.md` and updated `initial-prompt.md` with the latest progress. Marked Task 1.3 library setup as complete.
- **User Prompt**: "implement task 1.3.1" -> Implemented structured logger using Pino with JSON format and context support (RequestId/TenantId). Integrated logger into global error handler and health API. Verified with unit and output tests.
- **User Prompt**: "remove storybook support from the project" -> Completely removed Storybook dependencies, configurations, boilerplate components, and related Vitest/Playwright setups. Verified clean Next.js production build and linting.
- **User Prompt**: "implement task 1.3.2" -> Configured strict security headers (CSP, HSTS, X-Content-Type-Options, etc.) in `next.config.ts`. Verified with a successful production build.
- **User Prompt**: "implement task 1.4" -> Implemented `AuthContext` with mock login/logout, session persistence, and role-based access. Created a premium Login Page with role selection (`Facility Admin` and `Approver`). Updated mock credentials to use `sandeeppamujula@gmail.com` and `reachsandeepkp@gmail.com`. Verified with unit tests.
- [x] **User Prompt**: "implement task 1.5" -> Configured Mongoose connection with caching for Next.js. Defined `Tenant` and `User` schemas with multi-tenant support. Verified setup with unit tests using `mongodb-memory-server`.
- [x] **User Prompt**: "implement task 1.6 from @[ag-expense-mgmt/docs/plans/milestone-1.md]" -> Implemented database seeding script for Tenants, Users, GL Codes, and Expense Types. Added backfilling support via upserts. Configured Jest to handle ESM dependencies. Used `tsx` for seeding script to ensure better ESM compatibility. Verified with unit tests.

