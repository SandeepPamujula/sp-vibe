/**
 * Upload Confirmation API
 *
 * POST /api/attachments/confirm
 * Confirm that a file has been successfully uploaded.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { API_ERROR_CODES, HTTP_STATUS, ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { confirmUpload, validateExpenseOwnership } from '@/services/attachment.service';
import type { ApiResponse } from '@/types/api.types';
import type { ExpenseAttachmentSummary } from '@/types/entities';

type ConfirmResponse = ApiResponse<ExpenseAttachmentSummary>;

/**
 * Schema for confirm upload request
 */
const confirmUploadSchema = z.object({
  expenseId: z.string().uuid('Invalid expense ID'),
  fileName: z.string().min(1).max(255),
  s3Key: z.string().min(1).max(512),
  contentType: z.enum(ALLOWED_MIME_TYPES),
  fileSize: z.number().int().positive().max(FILE_SIZE_LIMITS.MAX_SIZE),
});

/**
 * POST /api/attachments/confirm
 *
 * Confirm file upload and create attachment record.
 *
 * Request body:
 * - expenseId: UUID of the expense
 * - fileName: Original file name
 * - s3Key: Storage key returned from upload-url endpoint
 * - contentType: MIME type
 * - fileSize: Size in bytes
 *
 * Response:
 * - Attachment summary with id, fileName, contentType, fileSize, uploadedAt
 */
export async function POST(request: Request): Promise<NextResponse<ConfirmResponse>> {
  try {
    // Get authenticated user context
    const context = await requireRequestContext();
    const { tenant } = context;

    // Parse and validate request body
    const body = await request.json();
    const validation = confirmUploadSchema.safeParse(body);

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

    const { expenseId, fileName, s3Key, contentType, fileSize } = validation.data;

    // Verify expense ownership
    const isOwned = await validateExpenseOwnership(expenseId, tenant.tenantId);
    if (!isOwned) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.NOT_FOUND,
            message: 'Expense not found or access denied',
          },
        },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Create attachment record
    const attachment = await confirmUpload({
      expenseId,
      fileName,
      s3Key,
      contentType,
      fileSize,
    });

    return NextResponse.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error('Failed to confirm upload:', error);

    const message = error instanceof Error ? error.message : 'Failed to confirm upload';

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

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to confirm upload',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
