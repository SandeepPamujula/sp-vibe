# Backend Rules

# Backend Rules

## Tech Stack
- **Framework**: Next.js API Routes / Server Actions.
- **Database**: MongoDB (Mongoose).
- **Storage**: AWS S3 (via SDK).
- **Email**: Amazon SES (via SDK).
- **Validation**: Zod.

## Guidelines
1.  **Architecture**:
    - Use Next.js Server Actions for form submissions where appropriate.
    - Use Route Handlers (`app/api/...`) for external integrations or REST-like access.
2.  **Database**:
    - Maintain strict Zod schemas mirrors of Mongoose schemas.
    - Ensure `dbConnect` is cached (Singleton pattern) for serverless environment.
3.  **Validation**:
    - VALIDATE EVERYTHING.
    - Use Zod `.parse()` or `.safeParse()` on all inputs.
4.  **Authentication**:
    - NextAuth.js or custom middleware.
    - Verify roles (Facility Admin, Approver) in every Server Action/API route.
