/**
 * DynamoDB Client Wrapper - Singleton Pattern
 * 
 * Provides a configured DynamoDB client with proper error handling
 * and logging. Uses AWS SDK v3 for DynamoDB operations.
 * 
 * Uses singleton pattern to ensure only one DynamoDB client instance exists.
 * 
 * @example
 * ```typescript
 * import { DbClient } from '@/lib/db-client';
 * 
 * const dbClient = DbClient.getInstance();
 * 
 * // Get the underlying DynamoDB client
 * const dynamoClient = dbClient.getDynamoDBClient();
 * 
 * // Use with DocumentClient (recommended)
 * import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
 * const docClient = DynamoDBDocumentClient.from(dynamoClient);
 * ```
 */

import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { config } from './config';
import { Logger } from './logger';

/**
 * DynamoDB Client Singleton Class
 * 
 * Ensures only one DynamoDB client instance exists throughout the application.
 */
class DbClient {
  private static instance: DbClient;
  private dynamoDBClient: DynamoDBClient;
  private logger: Logger;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.logger = Logger.getInstance();

    // DynamoDB client configuration
    const dynamoDBConfig: DynamoDBClientConfig = {
      region: config.dynamodb.region,
      ...(config.app.isDevelopment && {
        // In development, you might want to use local DynamoDB
        // endpoint: 'http://localhost:8000',
      }),
    };

    // Create DynamoDB client instance
    this.dynamoDBClient = new DynamoDBClient(dynamoDBConfig);

    // Log DynamoDB client initialization
    this.logger.info('DynamoDB client initialized', {
      region: config.dynamodb.region,
      usersTable: config.dynamodb.usersTable,
      invoicesTable: config.dynamodb.invoicesTable,
    });
  }

  /**
   * Get the singleton instance of DbClient
   * 
   * @returns The singleton DbClient instance
   */
  public static getInstance(): DbClient {
    if (!DbClient.instance) {
      DbClient.instance = new DbClient();
    }
    return DbClient.instance;
  }

  /**
   * Get the underlying DynamoDB client instance
   * 
   * Usage:
   * - Use with @aws-sdk/lib-dynamodb for DocumentClient operations (recommended)
   * - Use with @aws-sdk/client-dynamodb for low-level operations
   * 
   * @example Using DocumentClient (recommended for easier usage):
   * ```typescript
   * import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
   * import { DbClient } from '@/lib/db-client';
   * 
   * const dbClient = DbClient.getInstance();
   * const docClient = DynamoDBDocumentClient.from(dbClient.getDynamoDBClient());
   * 
   * const result = await docClient.send(new GetCommand({
   *   TableName: config.dynamodb.invoicesTable,
   *   Key: { invoiceId: '123' }
   * }));
   * ```
   */
  public getDynamoDBClient(): DynamoDBClient {
    return this.dynamoDBClient;
  }
}

/**
 * Export singleton instance for convenience
 * 
 * Usage:
 * - const dbClient = DbClient.getInstance();
 * - const dynamoClient = dbClient.getDynamoDBClient();
 */
export const dbClient = DbClient.getInstance();

/**
 * Export DbClient class for advanced usage
 */
export { DbClient };

/**
 * Helper function to handle DynamoDB errors
 * 
 * @param error - DynamoDB error
 * @param operation - The operation that failed (for logging)
 * @returns User-friendly error message
 */
export function getDynamoDBErrorMessage(error: unknown, operation?: string): string {
  const logger = Logger.getInstance();

  if (error instanceof Error) {
    logger.error('DynamoDB operation failed', {
      operation,
      error: error.message,
      stack: error.stack,
    });

    // Provide user-friendly error messages
    if (error.name === 'ResourceNotFoundException') {
      return 'Database resource not found';
    }
    if (error.name === 'ConditionalCheckFailedException') {
      return 'Operation failed: condition not met';
    }
    if (error.name === 'ProvisionedThroughputExceededException') {
      return 'Database temporarily unavailable. Please try again later';
    }
    if (error.name === 'ValidationException') {
      return 'Invalid request data';
    }

    return error.message || 'Database operation failed';
  }

  logger.error('Unknown DynamoDB error', { error, operation });
  return 'An unexpected database error occurred';
}

