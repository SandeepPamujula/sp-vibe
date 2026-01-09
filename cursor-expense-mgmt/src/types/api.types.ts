/**
 * API Response Types
 *
 * Standardized API response wrappers for consistent client handling.
 */

import { API_ERROR_CODES } from '@/constants';

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Response metadata for paginated results
 */
export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta;
}

/**
 * Success response helper type
 */
export type SuccessResponse<T> = {
  success: true;
  data: T;
  error?: never;
  meta?: ResponseMeta;
};

/**
 * Error response helper type
 */
export type ErrorResponse = {
  success: false;
  data?: never;
  error: ApiError;
  meta?: never;
};

/**
 * API error code type derived from constants
 */
export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
