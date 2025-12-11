/**
 * Standardized API Response Wrapper
 * 
 * Provides helper functions to create consistent API responses
 * following the standardized ApiResponse format.
 * 
 * @example
 * ```typescript
 * import { successResponse, errorResponse } from '@/lib/response';
 * 
 * // Success response
 * return successResponse({ invoiceId: '123', status: 'APPROVED' });
 * 
 * // Error response
 * return errorResponse('Invoice not found', 'INVOICE_NOT_FOUND');
 * ```
 */

import type { ApiResponse } from '@/types/response';

/**
 * Creates a successful API response
 * 
 * @template T - The type of data in the response
 * @param data - The response data
 * @returns A successful ApiResponse object
 */
export function successResponse<T = unknown>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates an error API response
 * 
 * @param message - Human-readable error message
 * @param code - Optional error code for programmatic error handling
 * @returns An error ApiResponse object
 */
export function errorResponse(message: string, code?: string): ApiResponse<never> {
  return {
    success: false,
    error: {
      message,
      ...(code && { code }),
    },
  };
}

/**
 * Type guard to check if a response is successful
 * 
 * @param response - The API response to check
 * @returns True if the response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true;
}

/**
 * Type guard to check if a response is an error
 * 
 * @param response - The API response to check
 * @returns True if the response is an error
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: false; error: { message: string; code?: string } } {
  return response.success === false;
}

