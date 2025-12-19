/**
 * Test Users API
 *
 * Returns list of test users for mock SSO login.
 * This endpoint is only available in development mode.
 */

import { NextRequest, NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { getTestUsers } from '@/lib';
import type { TestUser } from '@/lib/auth';
import { features } from '@/lib/config';
import type { ApiResponse } from '@/types/api.types';

type UsersResponse = ApiResponse<TestUser[]>;

/**
 * GET /api/auth/users
 *
 * Returns all active test users for mock login.
 *
 * Query params:
 * - tenant: Optional tenant slug to filter users
 */
export async function GET(request: NextRequest): Promise<NextResponse<UsersResponse>> {
  // Only allow in development/mock auth mode
  if (!features.mockAuth) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.FORBIDDEN,
          message: 'Test user endpoint is only available in development mode',
        },
      },
      { status: HTTP_STATUS.FORBIDDEN }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get('tenant') || undefined;

    const users = await getTestUsers(tenantSlug);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Failed to fetch test users:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.DATABASE_ERROR,
          message: 'Failed to fetch test users',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
