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
3.  **Environments**:
    - **DEV**: Development environment (for active development).
    - **PROD**: Production environment (stable release).
    - *Note*: No Staging or UAT environments.

## Implementation Details

### 1. StorageStack (`lib/storage-stack.ts`)
- **Resources**:
    - `InvoiceBucket`: S3 Bucket by `Environment` (e.g., `dev-invoices`, `prod-invoices`).
    - **Encryption**: S3 Managed.
    - **CORS**: Allow GET/PUT from web domain.

### 2. NextJsStack (`lib/nextjs-stack.ts`)
- **Resources**:
    - `NextJsLambda`: NodejsFunction (hosting the Next.js app).
        - **Strategy**: Build `output: 'standalone'`, Zip, Deploy with Adapter.
    - `StaticAssetsBucket`: S3 Bucket for public assets (`/_next/static/*`).
    - `Distribution`: CloudFront Distribution.
        - Behaviors:
            - `/api/*` -> Lambda
            - `/_next/*` -> S3
            - `/*` -> Lambda (SSR)

### 3. Naming Strategy
- **Stacks**: `ExpenseMgmt-{Env}-Storage`, `ExpenseMgmt-{Env}-NextJs`.
- **Resources**: Tagged with `Environment={Env}`.
