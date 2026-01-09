/**
 * Local Upload API (Development Only)
 *
 * PUT /api/attachments/upload-local
 * Handles file upload in development mode (local filesystem).
 */

import { NextRequest, NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS, ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS } from '@/constants';
import { isDevelopment } from '@/lib/env';
import { saveLocalFile } from '@/lib/storage';

/**
 * PUT /api/attachments/upload-local
 *
 * Upload a file to local storage (development only).
 * This endpoint mimics S3 presigned URL upload behavior.
 *
 * Query params:
 * - key: Storage key (path where file will be saved)
 * - contentType: Expected MIME type
 *
 * Body: Raw file data
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  // Only available in development
  if (!isDevelopment) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.FORBIDDEN,
          message: 'Local upload not available in production',
        },
      },
      { status: HTTP_STATUS.FORBIDDEN }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const contentType = searchParams.get('contentType');

    // Validate key
    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Missing key parameter',
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate content type
    if (
      !contentType ||
      !ALLOWED_MIME_TYPES.includes(contentType as (typeof ALLOWED_MIME_TYPES)[number])
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid content type',
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Read file data
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size
    if (buffer.length > FILE_SIZE_LIMITS.MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: `File too large. Maximum size is ${FILE_SIZE_LIMITS.MAX_SIZE / (1024 * 1024)}MB`,
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Save file to local storage
    await saveLocalFile(key, buffer);

    // Return 200 OK (matching S3 presigned URL behavior)
    return new NextResponse(null, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to upload file locally:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to upload file',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
