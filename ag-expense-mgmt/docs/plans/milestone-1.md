# Milestone 1: Foundation & Core Setup - Detailed Plan

## Goals
- Setup Next.js Monorepo structure.
- Deploy infrastructure (S3, CloudFront).
- Implement Mock Auth and Database Connection.

## Tasks

### Infrastructure (CDK)
- [ ] **1.1**: Initialize CDK project in `infra/`.
- [ ] **1.1.1**: Define `NextJsStack` (Lambda/S3/CF for Next.js).
- [ ] **1.1.2**: Define `StorageStack` (S3 for documents).
- [ ] **1.1.3**: Configure Deployment Scripts (`npm run deploy`).
- [ ] **1.1.4**: *Test*: Verify CDK synthesis and stack structure (`cdk synth`).

### Application Core (Next.js)
- [ ] **1.2**: Initialize Next.js project.
    - [ ] Setup TypeScript, TailwindCSS, ESLint, Prettier.
    - [ ] Configure Atomic Design structure (`components/atoms`, etc).
    - [ ] *Test*: Verify build (`npm run build`).
- [ ] **1.3**: Configure Libraries.
    - [ ] Setup Zod for validation.
    - [ ] Setup Jest & React Testing Library.
    - [ ] *Test*: Create a sample unit test to verify Jest setup.
    - [ ] Setup Storybook.

### Authentication & Database
- [ ] **1.4**: Implement Mock Authentication.
    - [ ] Create `AuthContext`.
    - [ ] Build Login Page with Role Selection.
    - [ ] *Test*: Unit test for `AuthContext` (Login/Logout logic).
- [ ] **1.5**: Database Setup.
    - [ ] Configure Mongoose Connection.
    - [ ] Define `Tenant` and `User` Schemas.
    - [ ] *Test*: Unit/Integration test for Database connection (using `mongodb-memory-server` if possible, or mock).
- [ ] **1.6**: Seeding.
    - [ ] Create seed script.
    - [ ] *Test*: Verify seed script runs without error.

## Deliverables
- Deployed Next.js App URL.
- Local Storybook URL.
- Working Login Page with Tests.
- Database connected.

## Execution Log
*(Prompt history and completion notes will be added here)*
