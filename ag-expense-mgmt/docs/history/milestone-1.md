# Milestone 1: Foundation & Core Setup - Prompt History

## 1. Project Initialization & Structure
- **User Prompt**: "implement task 1.2"
- **Actions**:
    - Initialized Next.js project with TypeScript, TailwindCSS, ESLint, and Prettier.
    - Configured Atomic Design structure (`components/atoms`, `molecules`, `organisms`, `templates`).
    - Implemented `APIResponse` wrapper and Global Error Handler.
    - Verified build succeeds.
- **Outcome**: Foundational Next.js app is ready.

## 2. Infrastructure Setup (CDK)
- **User Prompt**: "implement task 1.1", "implement task 1.1.1 and 1.1.2"
- **Actions**:
    - Initialized CDK project in `infra/`.
    - Defined `NextJsStack` (Lambda/S3/CF for Next.js) using OpenNext.
    - Defined `StorageStack` (S3 for documents).
    - Created placeholder `app` directory to enable CDK synthesis.
- **Outcome**: Infrastructure code exists and synthesizes correctly.

## 3. Renaming & Refactoring
- **User Prompt**: "suggest a different name for app folder" -> "yes, web looks good"
- **Actions**:
    - Renamed `app/` to `web/` for better monorepo clarity.
    - Updated all references in `package.json` and CDK configs.
- **Outcome**: Clean monorepo structure with `web/` and `infra/` workspaces.

## 4. Deployment & Environment Configuration
- **User Prompt**: "implement task 1.1.3"
- **Actions**:
    - Configured orchestrated deployment scripts in root `package.json`.
    - Updated `infra` stacks to support environment context (dev/prod).
    - Created `docs/deployment-guide.md`.
    - Fixed Next.js build issue with `global-error.tsx`.
    - Verified CDK synthesis with OpenNext integration.
- **Outcome**: Project can be deployed via `npm run deploy`.

## 5. Bug Fixes & Optimizations
- **User Prompt**: "ignore temp files"
- **Actions**: Updated `.gitignore` to exclude build artifacts.
- **User Prompt**: "display health api data on inital page"
- **Actions**: Re-designed landing page with premium UI and health status integration.
- **User Prompt**: "unable to npm run deploy:dev Error: ENOENT..."
- **Actions**: Fixed OpenNext symlink issue with a post-build cleanup script. Documented in `docs/troubleshooting/rca-001-opennext-symlink-enoent.md`.
- **User Prompt**: "Health api details are not shown using cloudfront url..."
- **Actions**: Fixed production health check by dynamically determining base URL via headers.
- **Outcome**: Working production-ready landing page with health telemetry.

## 6. Library Configuration (In Progress)
- **User Prompt**: "implement task 1.3" (Continuous work)
- **Actions**:
    - Installed and configured Zod, Jest, and Storybook.
    - Added Storybook addons for interactions and accessibility.
- **Outcome**: Development environment enriched with testing and documentation tools.
