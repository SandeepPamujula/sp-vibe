# Infrastructure - Expense Management System

This directory contains the AWS CDK infrastructure code for the Multi-tenant Expense Management System.

## Overview

The infrastructure is built using AWS CDK (Cloud Development Kit) with TypeScript and includes:

- **NextJsStack**: Deploys the Next.js application using Lambda, S3, and CloudFront
- **StorageStack**: (To be implemented in Milestone 3) S3 buckets for document storage

## Architecture

The Next.js application is deployed using:
- **AWS Lambda**: Serverless compute for SSR/API routes
- **Amazon S3**: Static asset hosting
- **Amazon CloudFront**: Global CDN for low-latency content delivery
- **Lambda@Edge**: Edge computing for dynamic content

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- AWS CDK CLI (`npm install -g aws-cdk`)
- Valid AWS account with necessary permissions

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

3. **Bootstrap CDK** (first time only):
   ```bash
   npx cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

## Available Commands

### Build & Compile
```bash
npm run build        # Compile TypeScript to JavaScript
npm run watch        # Watch mode for development
```

### Testing
```bash
npm test            # Run Jest unit tests
```

### CDK Operations
```bash
npm run synth       # Synthesize CloudFormation template
npm run diff        # Compare deployed stack with current state
npm run deploy      # Deploy all stacks (auto-approve for dev)
npm run deploy:prod # Deploy with approval prompts (for production)
npm run destroy     # Destroy all stacks
```

### Direct CDK Commands
```bash
npx cdk ls          # List all stacks
npx cdk synth       # Synthesize CloudFormation template
npx cdk deploy      # Deploy stacks
npx cdk diff        # Show differences
npx cdk destroy     # Destroy stacks
```

## Environment Configuration

The infrastructure uses environment variables for configuration:

- `CDK_DEFAULT_ACCOUNT` or `AWS_ACCOUNT_ID`: AWS Account ID
- `CDK_DEFAULT_REGION` or `AWS_REGION`: AWS Region (defaults to us-east-1)

You can also set these in the `bin/infra.ts` file directly.

## Stacks

### NextJsStack (`lib/nextjs-stack.ts`)

Deploys the Next.js application with the following features:

- **CloudFront Distribution**: Global CDN with HTTPS redirect
- **Lambda Functions**: Serverless compute for SSR and API routes
- **S3 Buckets**: Static asset storage
- **Automatic Build**: Builds Next.js app during deployment

**Outputs**:
- `NextJsAppUrl`: CloudFront URL for accessing the application
- `DistributionId`: CloudFront distribution ID for cache invalidation

**Tags**:
- `Project`: ExpenseManagement
- `Stack`: NextJs
- `Environment`: dev/prod

## Testing

The infrastructure includes comprehensive tests:

```bash
npm test
```

Tests verify:
- Stack synthesis without errors
- Correct resource creation
- Output definitions
- Tag assignments
- Stack naming and descriptions

## Deployment Workflow

### Development
```bash
# 1. Make changes to infrastructure code
# 2. Run tests
npm test

# 3. Synthesize to check CloudFormation template
npm run synth

# 4. Deploy to AWS
npm run deploy
```

### Production
```bash
# 1. Review changes
npm run diff

# 2. Deploy with approval
npm run deploy:prod
```

## CI/CD Integration

The infrastructure is designed to work with GitHub Actions (Task 1.1.5):

```yaml
- name: Deploy Infrastructure
  run: |
    cd infra
    npm ci
    npm run build
    npm test
    npm run deploy
```

## Troubleshooting

### CDK Bootstrap Error
If you get a bootstrap error, run:
```bash
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Synthesis Errors
Check that:
- All dependencies are installed (`npm install`)
- TypeScript compiles without errors (`npm run build`)
- AWS credentials are configured

### Deployment Failures
- Check AWS CloudFormation console for detailed error messages
- Verify IAM permissions
- Check CloudWatch Logs for Lambda errors

## Cost Optimization

The infrastructure is configured for cost optimization:

- **CloudFront Price Class**: PRICE_CLASS_100 (North America & Europe)
- **Lambda**: Pay-per-use pricing
- **S3**: Standard storage class with lifecycle policies (to be configured)

For production, consider:
- Enabling CloudFront caching
- Setting up S3 lifecycle policies
- Using Reserved Capacity for predictable workloads

## Security

Security features included:

- HTTPS-only CloudFront distribution
- Encrypted S3 buckets (default)
- IAM least-privilege policies
- CloudFront Origin Access Identity for S3

## Next Steps

1. ✅ Task 1.1: Initialize CDK project
2. ✅ Task 1.1.1: Define NextJsStack
3. ⏳ Task 1.1.2: Define StorageStack (Milestone 3)
4. ✅ Task 1.1.3: Configure Deployment Scripts
5. ✅ Task 1.1.4: Test CDK synthesis
6. ⏳ Task 1.1.5: Setup CI/CD Pipeline

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [cdk-nextjs-standalone](https://github.com/jetbridge/cdk-nextjs)
- [Next.js on AWS](https://aws.amazon.com/blogs/mobile/host-a-next-js-ssr-app-with-real-time-data-on-aws-amplify/)

## Support

For issues or questions:
1. Check CloudFormation stack events in AWS Console
2. Review CloudWatch Logs
3. Check CDK documentation
4. Review project documentation in `../docs/`
