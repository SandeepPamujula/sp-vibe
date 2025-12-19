/**
 * Session API
 *
 * Endpoints for managing user sessions.
 * - GET: Returns the current user session
 * - DELETE: Logs out the user (clears session)
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { getSession, clearSession } from '@/lib/auth';
import type { ApiResponse } from '@/types/api.types';
import type { UserSession } from '@/types/auth.types';

type SessionResponse = ApiResponse<{ session: UserSession }>;
type LogoutResponse = ApiResponse<{ message: string }>;

/**
 * GET /api/auth/session
 *
 * Returns the current user session from the session cookie.
 * Returns 401 if no valid session exists.
 */
export async function GET(): Promise<NextResponse<SessionResponse>> {
  try {
    const result = await getSession();

    if (!result.session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.UNAUTHORIZED,
            message: result.error || 'No valid session',
          },
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        session: result.session,
      },
    });
  } catch (error) {
    console.error('Failed to get session:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to retrieve session',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/auth/session
 *
 * Logs out the user by clearing the session cookie.
 */
export async function DELETE(): Promise<NextResponse<LogoutResponse>> {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  } catch (error) {
    console.error('Failed to clear session:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to logout',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
