/**
 * Standard API Response wrapper
 * Ensures consistent response format across all API endpoints
 */
export interface APIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        timestamp: string;
        requestId?: string;
        tenantId?: string;
    };
}

/**
 * Creates a successful API response
 */
export function successResponse<T>(
    data: T,
    meta?: Omit<APIResponse<T>['meta'], 'timestamp'>,
): APIResponse<T> {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
    };
}

/**
 * Creates an error API response
 */
export function errorResponse(
    code: string,
    message: string,
    details?: unknown,
    meta?: Omit<APIResponse['meta'], 'timestamp'>,
): APIResponse {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
    };
}
