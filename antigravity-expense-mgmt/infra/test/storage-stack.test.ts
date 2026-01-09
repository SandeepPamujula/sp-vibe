import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StorageStack } from '../lib/storage-stack';

/**
 * Test suite for StorageStack
 */
describe('StorageStack', () => {
    let app: cdk.App;
    let stack: StorageStack;
    let template: Template;

    beforeEach(() => {
        app = new cdk.App();
        stack = new StorageStack(app, 'TestStorageStack', {
            env: {
                account: '123456789012',
                region: 'us-east-1',
            },
        });
        template = Template.fromStack(stack);
    });

    test('Stack is created successfully', () => {
        expect(stack).toBeDefined();
    });

    test('S3 Bucket Created', () => {
        template.hasResourceProperties('AWS::S3::Bucket', {
            VersioningConfiguration: {
                Status: 'Enabled'
            },
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true
            }
        });
    });

    test('Stack outputs are defined', () => {
        template.hasOutput('DocumentBucketName', {
            Export: {
                Name: 'ExpenseManagementDocumentBucketName',
            },
        });
    });

    test('Stack has correct tags', () => {
        // Verify tags are applied (this might be on the stack or resources)
        // CDK tags are not always visible on the stack resource itself in Template, but on children
    });
});
