import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handler';
import { successResponse } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

/**
 * Sample API route demonstrating error handling
 * GET /api/health
 */
async function handler(request: NextRequest) {
    // Example: throw an error conditionally
    const { searchParams } = new URL(request.url);
    const shouldFail = searchParams.get('fail');

    if (shouldFail === 'true') {
        throw new NotFoundError('Resource');
    }

    return NextResponse.json(
        successResponse({
            status: 'healthy',
            timestamp: new Date().toISOString(),
        }),
    );
}

export const GET = withErrorHandler(handler);
