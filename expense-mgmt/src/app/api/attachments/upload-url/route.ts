/**
 * Upload URL API
 *
 * POST /api/attachments/upload-url
 * Request a presigned URL for uploading a file attachment.
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import type { PresignedUrlResult } from '@/lib/storage';
import { uploadAttachmentSchema } from '@/schemas';
import { requestUploadUrl } from '@/services/attachment.service';
import type { ApiResponse } from '@/types/api.types';

interface UploadUrlResponseData extends PresignedUrlResult {
  pendingId: string;
}

type UploadUrlResponse = ApiResponse<UploadUrlResponseData>;

/**
 * POST /api/attachments/upload-url
 *
 * Request a presigned URL for uploading a file.
 *
 * Request body:
 * - expenseId: UUID of the expense
 * - fileName: Original file name
 * - contentType: MIME type (must be allowed type)
 * - fileSize: Size in bytes (must be within limit)
 *
 * Response:
 * - uploadUrl: Presigned URL for uploading
 * - key: Storage key (S3 key or local path)
 * - expiresAt: URL expiration timestamp
 * - pendingId: ID for confirming upload
 */
export async function POST(request: Request): Promise<NextResponse<UploadUrlResponse>> {
  try {
    // Get authenticated user context
    const context = await requireRequestContext();
    const { tenant } = context;

    // Parse and validate request body
    const body = await request.json();
    const validation = uploadAttachmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid request data',
            details: validation.error.flatten().fieldErrors as Record<string, string[]>,
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { expenseId, fileName, contentType, fileSize } = validation.data;

    // Request upload URL
    const result = await requestUploadUrl({
      tenantId: tenant.tenantId,
      expenseId,
      fileName,
      contentType,
      fileSize,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to generate upload URL:', error);

    const message = error instanceof Error ? error.message : 'Failed to generate upload URL';

    // Check if it's an auth error
    if (message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.UNAUTHORIZED,
            message: 'Authentication required',
          },
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const isValidationError = message.includes('not found') || message.includes('Maximum');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isValidationError
            ? API_ERROR_CODES.VALIDATION_ERROR
            : API_ERROR_CODES.INTERNAL_ERROR,
          message,
        },
      },
      { status: isValidationError ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
