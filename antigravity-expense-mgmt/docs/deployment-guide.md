# Deployment Guide

This guide explains how to deploy the Multi-tenant Expense Management System to AWS using CDK.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure AWS CLI with your credentials
   ```bash
   aws configure
   ```
3. **Node.js**: Node.js 18+ installed
4. **Dependencies**: Install all dependencies
   ```bash
   npm install
   ```

## Available Deployment Scripts

### Root Level Scripts

All deployment scripts are available from the root directory:

#### Build Scripts
```bash
# Build all workspaces (web + infra)
npm run build

# Build only the web application
npm run build:web

# Build only the infrastructure
npm run build:infra
```

#### Deployment Scripts
```bash
# Deploy to development environment (auto-approval)
npm run deploy:dev

# Deploy to production environment (requires manual approval)
npm run deploy:prod

# Deploy with default settings (auto-approval)
npm run deploy
```

#### CDK Utility Scripts
```bash
# Synthesize CloudFormation templates
npm run synth

# Show differences between deployed stack and current state
npm run diff

# Destroy all stacks (use with caution!)
npm run destroy

# Bootstrap CDK in your AWS account (one-time setup)
npm run bootstrap
```

## Deployment Workflow

### First-Time Deployment

1. **Bootstrap CDK** (one-time per AWS account/region):
   ```bash
   npm run bootstrap
   ```

2. **Build and Deploy to Development**:
   ```bash
   npm run deploy:dev
   ```

3. **Verify Deployment**:
   - Check the CloudFormation console for stack status
   - Note the CloudFront URL from the output
   - Test the application at the provided URL

### Subsequent Deployments

1. **Check what will change**:
   ```bash
   npm run diff
   ```

2. **Deploy changes**:
   ```bash
   # For development
   npm run deploy:dev
   
   # For production
   npm run deploy:prod
   ```

### Production Deployment

Production deployments require manual approval for security-sensitive changes:

```bash
npm run deploy:prod
```

You'll be prompted to approve:
- IAM policy changes
- Security group modifications
- Other security-sensitive changes

## Environment-Specific Configuration

The deployment supports different environments through CDK context:

- **Development (`dev`)**: 
  - Auto-approval enabled
  - S3 buckets are destroyed when stack is deleted
  - Lower Lambda memory allocation
  
- **Production (`prod`)**:
  - Manual approval required for sensitive changes
  - S3 buckets are retained when stack is deleted
  - Higher Lambda memory allocation
  - Optimized for performance

## Deployed Resources

### NextJsStack
- **Lambda Functions**: For Next.js SSR
- **S3 Bucket**: For static assets
- **CloudFront Distribution**: For global CDN
- **Lambda@Edge**: For routing

### StorageStack
- **S3 Bucket**: For document storage (receipts, invoices)
- **Versioning**: Enabled for data protection
- **Encryption**: S3-managed encryption

## Outputs

After successful deployment, you'll see:

```
Outputs:
ExpenseManagementNextJsStack.NextJsAppUrl = https://xxxxx.cloudfront.net
ExpenseManagementNextJsStack.DistributionId = EXXXXXXXXXXXXX
ExpenseManagementStorageStack.DocumentBucketName = expensemanagement-storage-documentbucket-xxxxx
```

Save these values for application configuration.

## Troubleshooting

### Build Failures

**Issue**: Web build fails
```bash
# Check web build independently
npm run build:web
```

**Issue**: Infrastructure build fails
```bash
# Check TypeScript compilation
npm run build:infra
```

### Deployment Failures

**Issue**: CDK not bootstrapped
```bash
npm run bootstrap
```

**Issue**: Insufficient permissions
- Verify AWS credentials: `aws sts get-caller-identity`
- Ensure IAM user/role has necessary permissions

**Issue**: Stack already exists
```bash
# View differences
npm run diff

# Update existing stack
npm run deploy:dev
```

### Rollback

If deployment fails, CDK automatically rolls back. To manually destroy:

```bash
npm run destroy
```

**Warning**: This will delete all resources. In production, S3 buckets are retained.

## CI/CD Integration

For automated deployments, use these scripts in your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Build
  run: npm run build

- name: Deploy to Dev
  run: npm run deploy:dev
  if: github.ref == 'refs/heads/develop'

- name: Deploy to Prod
  run: npm run deploy:prod
  if: github.ref == 'refs/heads/main'
```

## Cost Optimization

- **Development**: Use `deploy:dev` for lower costs
- **Production**: Use `deploy:prod` for optimized performance
- **Cleanup**: Run `npm run destroy` for dev environments when not in use

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use IAM roles** in production environments
3. **Review changes** before production deployment
4. **Enable CloudTrail** for audit logging
5. **Use AWS Secrets Manager** for sensitive configuration

## Next Steps

After deployment:
1. Configure custom domain (optional)
2. Set up monitoring and alerts
3. Configure environment variables
4. Set up CI/CD pipeline (Task 1.1.5)
