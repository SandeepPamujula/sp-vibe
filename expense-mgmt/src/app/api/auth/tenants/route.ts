/**
 * Available Tenants API
 *
 * Returns list of active tenants for login selection.
 * Used by the mock SSO login page.
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { getAvailableTenants } from '@/lib';
import type { ApiResponse } from '@/types/api.types';

interface TenantListItem {
  id: string;
  name: string;
  slug: string;
}

type TenantsResponse = ApiResponse<TenantListItem[]>;

/**
 * GET /api/auth/tenants
 *
 * Returns all active tenants for login selection.
 */
export async function GET(): Promise<NextResponse<TenantsResponse>> {
  try {
    const tenants = await getAvailableTenants();

    return NextResponse.json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error('Failed to fetch tenants:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.DATABASE_ERROR,
          message: 'Failed to fetch available tenants',
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
