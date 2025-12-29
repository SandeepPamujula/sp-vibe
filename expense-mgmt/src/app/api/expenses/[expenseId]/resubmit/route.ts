/**
 * Resubmit Expense API
 *
 * POST /api/expenses/:expenseId/resubmit - Resubmit a rejected expense
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { resubmitExpenseSchema } from '@/schemas';
import { resubmitExpense } from '@/services';
import type { ApiResponse } from '@/types/api.types';

type ResubmitExpenseResponse = ApiResponse<{ expenseId: string }>;

interface RouteParams {
  params: Promise<{ expenseId: string }>;
}

/**
 * POST /api/expenses/:expenseId/resubmit
 *
 * Resubmit a rejected expense for approval.
 *
 * This endpoint:
 * 1. Validates the expense is in rejected status
 * 2. Verifies the user is the original submitter
 * 3. Validates required fields are filled (including natureOfExpense)
 * 4. Changes status from 'rejected' to 'submitted'
 * 5. Links the expense to the appropriate workflow
 * 6. Creates a new expense_approval record for the first workflow step
 * 7. Sets the expense's current_step_id to the pending step
 * 8. Records action in expense_history
 */
export async function POST(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<ResubmitExpenseResponse>> {
  try {
    const context = await requireRequestContext();
    const { user, tenant } = context;
    const { expenseId } = await params;

    // Validate expenseId format
    resubmitExpenseSchema.parse({ expenseId });

    await resubmitExpense(expenseId, tenant.tenantId, user.id);

    return NextResponse.json({
      success: true,
      data: { expenseId },
    });
  } catch (error) {
    console.error('Failed to resubmit expense:', error);

    const message = error instanceof Error ? error.message : 'Failed to resubmit expense';

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
      message.includes('Only rejected') ||
      message.includes('Only the expense owner') ||
      message.includes('Invalid expense ID') ||
      message.includes('Nature of expense is required') ||
      message.includes('Valid amount is required') ||
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
