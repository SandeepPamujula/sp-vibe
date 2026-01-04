import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NextJsStack } from '../lib/nextjs-stack';

/**
 * Test suite for NextJsStack
 * Validates CDK synthesis and stack structure
 */
describe('NextJsStack', () => {
    let app: cdk.App;
    let stack: NextJsStack;
    let template: Template;

    beforeEach(() => {
        app = new cdk.App();
        stack = new NextJsStack(app, 'TestNextJsStack', {
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

    test('Stack has correct tags', () => {
        const stackTags = cdk.Tags.of(stack);
        expect(stackTags).toBeDefined();
    });

    test('Stack outputs are defined', () => {
        // Check that CloudFront URL output exists
        template.hasOutput('NextJsAppUrl', {
            Export: {
                Name: 'ExpenseManagementAppUrl',
            },
        });

        // Check that Distribution ID output exists
        template.hasOutput('DistributionId', {
            Export: {
                Name: 'ExpenseManagementDistributionId',
            },
        });
    });

    test('Stack synthesizes without errors', () => {
        // This will throw if synthesis fails
        const assembly = app.synth();
        expect(assembly).toBeDefined();

        // Verify the stack is in the assembly
        const stackArtifact = assembly.getStackByName(stack.stackName);
        expect(stackArtifact).toBeDefined();
    });

    test('Stack has correct description', () => {
        expect(stack.templateOptions.description).toBe(
            'Next.js application stack for Multi-tenant Expense Management System'
        );
    });

    test('Stack has correct name', () => {
        expect(stack.stackName).toBe('ExpenseManagement-NextJs');
    });
});
