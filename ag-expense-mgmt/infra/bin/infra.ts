#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { NextJsStack } from '../lib/nextjs-stack';
import { StorageStack } from '../lib/storage-stack';

const app = new cdk.App();

// Get environment from context or environment variables
const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

const env = { account, region };

// Create StorageStack
const storageStack = new StorageStack(app, 'ExpenseManagementStorageStack', {
  env,
  description: 'Storage stack for Multi-tenant Expense Management System',
  stackName: 'ExpenseManagement-Storage',
});

// Create NextJsStack for the expense management application
new NextJsStack(app, 'ExpenseManagementNextJsStack', {
  env,
  description: 'Next.js application stack for Multi-tenant Expense Management System',

  // Stack name for CloudFormation
  stackName: 'ExpenseManagement-NextJs',

  // Enable termination protection for production
  // terminationProtection: true, // Uncomment for production
});
