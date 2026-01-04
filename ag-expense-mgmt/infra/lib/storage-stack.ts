import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
    public readonly documentBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Get environment from context (dev, staging, prod)
        const environment = this.node.tryGetContext('environment') || 'dev';
        const isProd = environment === 'prod';

        // Create S3 bucket for documents
        this.documentBucket = new s3.Bucket(this, 'DocumentBucket', {
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: !isProd, // Auto-delete in dev, retain in prod
        });

        // Output the Bucket Name
        new cdk.CfnOutput(this, 'DocumentBucketName', {
            value: this.documentBucket.bucketName,
            description: 'The name of the S3 bucket for documents',
            exportName: `ExpenseManagementDocumentBucketName-${environment}`,
        });

        // Add tags
        cdk.Tags.of(this).add('Project', 'ExpenseManagement');
        cdk.Tags.of(this).add('Stack', 'Storage');
        cdk.Tags.of(this).add('Environment', environment);
    }
}
