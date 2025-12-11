/**
 * Common Library Wrappers
 * 
 * This directory contains shared utilities and wrappers:
 * - HTTP client wrapper (Axios with interceptors)
 * - Logging wrapper (Winston with structured format)
 * - Response wrapper (standardized API responses)
 * - DB connection wrapper (DynamoDB client)
 * - Centralized configuration management
 * - Other shared utilities
 */

// Configuration
export { config, type Config, validateProductionConfig } from './config';

// Response wrapper
export {
  successResponse,
  errorResponse,
  isSuccessResponse,
  isErrorResponse,
} from './response';

// Logger wrapper (Singleton)
export { logger, Logger } from './logger';

// HTTP client wrapper (Singleton)
export { httpClient, HttpClient, getAxiosErrorMessage } from './http-client';

// DB client wrapper (Singleton)
export { dbClient, DbClient, getDynamoDBErrorMessage } from './db-client';

