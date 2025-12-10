/**
 * Common Library Wrappers
 * 
 * This directory will contain shared utilities and wrappers:
 * - HTTP client wrapper (Axios with interceptors)
 * - Logging wrapper (Winston with structured format)
 * - Response wrapper (standardized API responses)
 * - DB connection wrapper (DynamoDB client)
 * - Centralized configuration management
 * - Other shared utilities
 */

export { config, type Config, validateProductionConfig } from './config';

