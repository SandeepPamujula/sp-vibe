/**
 * API Response types
 * 
 * Defines the standardized API response format used across all API endpoints
 * to ensure consistent response structure.
 */

/**
 * Standardized API response format
 * Used for all API endpoints to ensure consistent response structure
 * 
 * @template T - The type of data in the response
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Response data (only present when success is true) */
  data?: T;
  /** Error information (only present when success is false) */
  error?: {
    /** Human-readable error message */
    message: string;
    /** Optional error code for programmatic error handling */
    code?: string;
  };
}

