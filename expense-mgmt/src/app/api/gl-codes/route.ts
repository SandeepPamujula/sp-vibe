/**
 * GL Codes / Nature of Expense API
 *
 * GET /api/gl-codes - Get all nature of expense options for the tenant
 *
 * This endpoint returns GL codes which are used as "Nature of Expense" options
 * in expense forms. The frontend should display the `description` field to users,
 * and submit the `id` as the `natureOfExpense` value when creating/updating expenses.
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { getGlCodes } from '@/services';
import type { ApiResponse } from '@/types/api.types';

interface NatureOfExpenseOption {
  /** Use this as the value when submitting expense form */
  id: string;
  /** GL code number (for reference) */
  code: string;
  /** Display this to users as the nature of expense option */
  description: string;
}

type NatureOfExpenseResponse = ApiResponse<NatureOfExpenseOption[]>;

/**
 * GET /api/gl-codes
 *
 * Get all nature of expense options for the tenant.
 *
 * Response fields:
 * - id: Submit this as `natureOfExpense` when creating/updating an expense
 * - code: GL code number (can be shown as secondary info)
 * - description: Display this as the dropdown option text
 *
 * The backend will automatically map the selected `id` to both
 * `glCodeId` and `natureOfExpense` (description) when saving.
 */
export async function GET(): Promise<NextResponse<NatureOfExpenseResponse>> {
  try {
    const context = await requireRequestContext();
    const { tenant } = context;

    const glCodes = await getGlCodes(tenant.tenantId);

    return NextResponse.json({
      success: true,
      data: glCodes,
    });
  } catch (error) {
    console.error('Failed to get GL codes:', error);

    const message = error instanceof Error ? error.message : 'Failed to get GL codes';

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
          message,
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
