import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './errors';
import { errorResponse } from './api-response';

/**
 * Global Error Handler for API Routes
 * Catches and formats errors consistently
 */
export function handleError(error: unknown, request?: NextRequest): NextResponse {
    console.error('Error occurred:', error);

    // Handle known AppError instances
    if (error instanceof AppError) {
        return NextResponse.json(
            errorResponse(error.code, error.message, error.details, {
                requestId: request?.headers.get('x-request-id') || undefined,
                tenantId: request?.headers.get('x-tenant-id') || undefined,
            }),
            { status: error.statusCode },
        );
    }

    // Handle validation errors from libraries (e.g., Zod)
    if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
            errorResponse('VALIDATION_ERROR', 'Validation failed', error, {
                requestId: request?.headers.get('x-request-id') || undefined,
                tenantId: request?.headers.get('x-tenant-id') || undefined,
            }),
            { status: 400 },
        );
    }

    // Handle generic errors
    if (error instanceof Error) {
        return NextResponse.json(
            errorResponse('INTERNAL_ERROR', error.message, undefined, {
                requestId: request?.headers.get('x-request-id') || undefined,
                tenantId: request?.headers.get('x-tenant-id') || undefined,
            }),
            { status: 500 },
        );
    }

    // Handle unknown errors
    return NextResponse.json(
        errorResponse('UNKNOWN_ERROR', 'An unexpected error occurred', undefined, {
            requestId: request?.headers.get('x-request-id') || undefined,
            tenantId: request?.headers.get('x-tenant-id') || undefined,
        }),
        { status: 500 },
    );
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler(
    handler: (request: NextRequest) => Promise<NextResponse>,
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        try {
            return await handler(request);
        } catch (error) {
            return handleError(error, request);
        }
    };
}
