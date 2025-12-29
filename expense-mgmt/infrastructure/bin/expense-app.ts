#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StagingStack } from '../lib/stacks/staging-stack';

const app = new cdk.App();

new StagingStack(app, 'ExpenseAppStaging', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Expense Management Application - Staging Environment',
});

