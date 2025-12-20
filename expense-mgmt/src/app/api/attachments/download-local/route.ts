/**
 * Local Download API (Development Only)
 *
 * GET /api/attachments/download-local
 * Serves files from local storage in development mode.
 */

import { NextRequest, NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { isDevelopment } from '@/lib/env';
import { readLocalFile } from '@/lib/storage';

/**
 * GET /api/attachments/download-local
 *
 * Download a file from local storage (development only).
 *
 * Query params:
 * - key: Storage key (path to the file)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Only available in development
  if (!isDevelopment) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.FORBIDDEN,
          message: 'Local download not available in production',
        },
      },
      { status: HTTP_STATUS.FORBIDDEN }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

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

    // Read file from local storage
    const buffer = await readLocalFile(key);

    // Determine content type from key
    const extension = key.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      heic: 'image/heic',
    };
    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

    // Extract filename from key
    const fileName = key.split('/').pop() || 'download';

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: HTTP_STATUS.OK,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Failed to download file locally:', error);

    const isNotFound = (error as NodeJS.ErrnoException).code === 'ENOENT';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isNotFound ? API_ERROR_CODES.NOT_FOUND : API_ERROR_CODES.INTERNAL_ERROR,
          message: isNotFound ? 'File not found' : 'Failed to download file',
        },
      },
      { status: isNotFound ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
