# CDK Implementation Plan

## 1. StorageStack (`lib/storage-stack.ts`)
- **Resources**:
    - `InvoiceBucket`: S3 Bucket for storing expense attachments.
    - **Encryption**: S3 Managed.
    - **CORS**: Allow GET/PUT from web domain (localhost for now).

## 2. NextJsStack (`lib/nextjs-stack.ts`)
- **Resources**:
    - `NextJsLambda`: NodejsFunction (hosting the Next.js app).
        - *Note*: We will use a placeholder handler for now until the Next.js app is built.
    - `StaticAssetsBucket`: S3 Bucket for public assets.
    - `Distribution`: CloudFront Distribution.
        - Behaviors:
            - `/api/*`: Forward to Lambda.
            - `/_next/*`: Forward to S3.
            - `/*`: Forward to Lambda (SSR).
    
## 3. App Entry (`bin/infra.ts`)
- Instantiate both stacks.
