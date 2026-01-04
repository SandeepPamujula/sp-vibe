import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

/**
 * NextJsStack - Deploys the Next.js application using Lambda, S3, and CloudFront
 * 
 * This stack handles:
 * - Next.js SSR/SSG deployment via Lambda
 * - Static asset hosting on S3
 * - CloudFront distribution for global CDN
 * - Automatic build and deployment
 */
export class NextJsStack extends cdk.Stack {
    public readonly nextjs: Nextjs;
    public readonly nextjsUrl: string;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Deploy Next.js application
        this.nextjs = new Nextjs(this, 'ExpenseManagementApp', {
            // Path to Next.js app (will be created in milestone 1.2)
            nextjsPath: '../app',

            // Environment variables for the Next.js app
            environment: {
                NODE_ENV: 'production',
            },

            // Skip build for now since app doesn't exist yet
            skipBuild: true,

            // Reduce build output
            quiet: false,
        });

        // Store URL for outputs
        this.nextjsUrl = this.nextjs.url;

        // Output the CloudFront URL
        new cdk.CfnOutput(this, 'NextJsAppUrl', {
            value: this.nextjsUrl,
            description: 'CloudFront URL for the Next.js application',
            exportName: 'ExpenseManagementAppUrl',
        });

        // Output the CloudFront Distribution ID
        // new cdk.CfnOutput(this, 'DistributionId', {
        //     value: this.nextjs.distribution.distributionId,
        //     description: 'CloudFront Distribution ID',
        //     exportName: 'ExpenseManagementDistributionId',
        // });

        // Add tags for resource management
        cdk.Tags.of(this).add('Project', 'ExpenseManagement');
        cdk.Tags.of(this).add('Stack', 'NextJs');
        cdk.Tags.of(this).add('Environment', props?.env?.account || 'dev');
    }
}
