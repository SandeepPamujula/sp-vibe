import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
    public readonly documentBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create S3 bucket for documents
        this.documentBucket = new s3.Bucket(this, 'DocumentBucket', {
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep data even if stack is deleted
            autoDeleteObjects: false, // Do not auto-delete objects
        });

        // Output the Bucket Name
        new cdk.CfnOutput(this, 'DocumentBucketName', {
            value: this.documentBucket.bucketName,
            description: 'The name of the S3 bucket for documents',
            exportName: 'ExpenseManagementDocumentBucketName',
        });

        // Add tags
        cdk.Tags.of(this).add('Project', 'ExpenseManagement');
        cdk.Tags.of(this).add('Stack', 'Storage');
    }
}
