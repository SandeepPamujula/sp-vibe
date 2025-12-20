/**
 * Submit Expense API
 *
 * POST /api/expenses/:expenseId/submit - Submit expense for approval
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { submitExpense } from '@/services';
import type { SubmitExpenseResult } from '@/services';
import type { ApiResponse } from '@/types/api.types';

type SubmitExpenseResponse = ApiResponse<SubmitExpenseResult>;

interface RouteParams {
  params: Promise<{ expenseId: string }>;
}

/**
 * POST /api/expenses/:expenseId/submit
 *
 * Submit an expense for approval.
 *
 * This endpoint:
 * 1. Validates the expense is in draft status
 * 2. Links the expense to the appropriate workflow based on workflow_type
 * 3. Creates an expense_approval record for the first workflow step
 * 4. Sets the expense's current_step_id to the pending step
 * 5. Updates the expense status to 'submitted'
 */
export async function POST(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<SubmitExpenseResponse>> {
  try {
    const context = await requireRequestContext();
    const { user, tenant } = context;
    const { expenseId } = await params;

    const result = await submitExpense(expenseId, tenant.tenantId, user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to submit expense:', error);

    const message = error instanceof Error ? error.message : 'Failed to submit expense';

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

    if (message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.NOT_FOUND,
            message: 'Expense not found',
          },
        },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    if (
      message.includes('Only draft') ||
      message.includes('Only the expense owner') ||
      message.includes('No active workflow')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message,
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
          message,
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
