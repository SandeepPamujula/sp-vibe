/**
 * Reject Expense API
 *
 * POST /api/expenses/:expenseId/reject - Reject an expense
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { rejectExpenseSchema } from '@/schemas';
import { rejectExpense } from '@/services';
import type { ApiResponse } from '@/types/api.types';

type RejectExpenseResponse = ApiResponse<{ expenseId: string }>;

interface RouteParams {
  params: Promise<{ expenseId: string }>;
}

/**
 * POST /api/expenses/:expenseId/reject
 *
 * Reject an expense at the current workflow step.
 *
 * Body:
 * - comments: Required rejection reason (max 5000 characters)
 *
 * This endpoint:
 * 1. Validates the expense is in submitted status
 * 2. Finds the pending approval record for the current step
 * 3. Verifies the user has approver role
 * 4. Updates the expense_approval record
 * 5. Updates expenses.status to 'rejected' (rejection is always final)
 * 6. Records action in expense_history
 */
export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<RejectExpenseResponse>> {
  try {
    const context = await requireRequestContext();
    const { user, tenant } = context;

    // Verify user has approver role
    if (user.role !== 'approver') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.FORBIDDEN,
            message: 'Only approvers can reject expenses',
          },
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const { expenseId } = await params;
    const body = await request.json();

    // Validate request body (expenseId comes from params)
    const bodySchema = rejectExpenseSchema.omit({ expenseId: true });
    const validated = bodySchema.parse(body);

    await rejectExpense(expenseId, tenant.tenantId, user.id, validated.comments);

    return NextResponse.json({
      success: true,
      data: { expenseId },
    });
  } catch (error) {
    console.error('Failed to reject expense:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: error.issues[0]?.message || 'Validation error',
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to reject expense';

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
            message: 'Expense or approval not found',
          },
        },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    if (
      message.includes('Only submitted') ||
      message.includes('No pending approval') ||
      message.includes('has no current workflow step') ||
      message.includes('Rejection reason is required')
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
