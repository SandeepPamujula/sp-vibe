/**
 * Mock SSO Authentication API
 *
 * Simulates Azure Entra ID SSO authentication for development.
 * Validates user credentials against the database and returns user info.
 *
 * In production, this would be replaced with actual Azure AD authentication.
 */

import { NextRequest, NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { mockSsoAuthenticate } from '@/lib';
import type { TestUser, AzureAdUserProfile } from '@/lib/auth';
import { features } from '@/lib/config';
import { loginSchema } from '@/schemas';
import type { ApiResponse } from '@/types/api.types';

interface MockSsoResponse {
  user: TestUser;
  profile: AzureAdUserProfile;
}

type AuthResponse = ApiResponse<MockSsoResponse>;

/**
 * POST /api/auth/mock-sso
 *
 * Authenticate a user using mock SSO.
 *
 * Request body:
 * - email: User's email address
 * - tenantSlug: Tenant identifier
 *
 * Returns:
 * - user: User information with tenant context
 * - profile: Mock Azure AD profile claims
 */
export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  // Only allow in development/mock auth mode
  if (!features.mockAuth) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.FORBIDDEN,
          message: 'Mock SSO is only available in development mode',
        },
      },
      { status: HTTP_STATUS.FORBIDDEN }
    );
  }

  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid login credentials',
            details: fieldErrors,
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { email, tenantSlug } = validation.data;

    // Perform mock SSO authentication
    const result = await mockSsoAuthenticate(email, tenantSlug);

    if (!result.success || !result.user || !result.profile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.UNAUTHORIZED,
            message: result.error || 'Authentication failed',
          },
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
      },
    });
  } catch (error) {
    console.error('Mock SSO authentication failed:', error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid request body',
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: 'Authentication service error',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
