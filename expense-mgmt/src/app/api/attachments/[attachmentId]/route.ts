/**
 * Single Attachment API
 *
 * GET /api/attachments/:attachmentId - Get attachment with download URL
 * DELETE /api/attachments/:attachmentId - Delete attachment
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { getAttachmentWithUrl, deleteAttachment } from '@/services/attachment.service';
import type { ApiResponse } from '@/types/api.types';
import type { ExpenseAttachmentWithUrl } from '@/types/entities';

type GetAttachmentResponse = ApiResponse<ExpenseAttachmentWithUrl>;
type DeleteAttachmentResponse = ApiResponse<{ message: string }>;

interface RouteParams {
  params: Promise<{ attachmentId: string }>;
}

const attachmentIdSchema = z.string().uuid('Invalid attachment ID');

/**
 * GET /api/attachments/:attachmentId
 *
 * Get attachment details with a presigned download URL.
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<GetAttachmentResponse>> {
  try {
    // Get authenticated user context
    const context = await requireRequestContext();
    const { tenant } = context;
    const { attachmentId } = await params;

    // Validate attachment ID
    const idValidation = attachmentIdSchema.safeParse(attachmentId);
    if (!idValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid attachment ID',
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Get attachment with download URL
    const attachment = await getAttachmentWithUrl(attachmentId, tenant.tenantId);

    if (!attachment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.NOT_FOUND,
            message: 'Attachment not found',
          },
        },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error('Failed to get attachment:', error);

    const message = error instanceof Error ? error.message : 'Failed to get attachment';

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
          message: 'Failed to get attachment',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/attachments/:attachmentId
 *
 * Delete an attachment from storage and database.
 * Only allowed for draft or rejected expenses.
 */
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<DeleteAttachmentResponse>> {
  try {
    // Get authenticated user context
    const context = await requireRequestContext();
    const { tenant } = context;
    const { attachmentId } = await params;

    // Validate attachment ID
    const idValidation = attachmentIdSchema.safeParse(attachmentId);
    if (!idValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid attachment ID',
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Delete attachment
    const deleted = await deleteAttachment(attachmentId, tenant.tenantId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.NOT_FOUND,
            message: 'Attachment not found',
          },
        },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Attachment deleted successfully' },
    });
  } catch (error) {
    console.error('Failed to delete attachment:', error);

    const message = error instanceof Error ? error.message : 'Failed to delete attachment';

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

    const isForbidden = message.includes('Cannot delete');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isForbidden ? API_ERROR_CODES.FORBIDDEN : API_ERROR_CODES.INTERNAL_ERROR,
          message,
        },
      },
      { status: isForbidden ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
