# Infrastructure Rules

# Infrastructure Rules

## Tech Stack
- **IaC**: AWS CDK (TypeScript).
- **Constructs**: `OpenNext` or generic Lambda supports for Next.js.

## Guidelines
1.  **Deployment**:
    - Single Stack for the Next.js App.
    - Separate resources for Stateful components (MongoDB Atlas access, S3 Buckets, SES specific configuration).
2.  **Security**:
    - IAM Roles for Lambda to access S3 (PutObject/GetObject) and SES (SendEmail).
    - Environment variables for `MONGODB_URI` and Auth secrets.
