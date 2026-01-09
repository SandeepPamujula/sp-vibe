/**
 * Expense Detail API
 *
 * GET /api/expenses/:expenseId - Get expense details
 * PUT /api/expenses/:expenseId - Update expense
 * DELETE /api/expenses/:expenseId - Delete expense
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { updateExpenseSchema } from '@/schemas';
import { getExpenseById, updateExpense, deleteExpense } from '@/services';
import type { ApiResponse } from '@/types/api.types';
import type { ExpenseWithRelations } from '@/types/entities';

type ExpenseDetailResponse = ApiResponse<ExpenseWithRelations>;
type UpdateExpenseResponse = ApiResponse<{ success: true }>;
type DeleteExpenseResponse = ApiResponse<{ deleted: true }>;

interface RouteParams {
  params: Promise<{ expenseId: string }>;
}

/**
 * GET /api/expenses/:expenseId
 *
 * Get expense details with all relations.
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<ExpenseDetailResponse>> {
  try {
    const context = await requireRequestContext();
    const { tenant } = context;
    const { expenseId } = await params;

    const expense = await getExpenseById(expenseId, tenant.tenantId);

    if (!expense) {
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

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Failed to get expense:', error);

    const message = error instanceof Error ? error.message : 'Failed to get expense';

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

/**
 * PUT /api/expenses/:expenseId
 *
 * Update an expense (draft or rejected status only).
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<UpdateExpenseResponse>> {
  try {
    const context = await requireRequestContext();
    const { user, tenant } = context;
    const { expenseId } = await params;

    const body = await request.json();
    const validation = updateExpenseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid request data',
            details: validation.error.flatten().fieldErrors as Record<string, string[]>,
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    await updateExpense(expenseId, tenant.tenantId, user.id, validation.data);

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error('Failed to update expense:', error);

    const message = error instanceof Error ? error.message : 'Failed to update expense';

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

    if (message.includes('Only draft') || message.includes('Only draft or rejected')) {
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

/**
 * DELETE /api/expenses/:expenseId
 *
 * Delete an expense (draft status only).
 */
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<DeleteExpenseResponse>> {
  try {
    const context = await requireRequestContext();
    const { tenant } = context;
    const { expenseId } = await params;

    const deleted = await deleteExpense(expenseId, tenant.tenantId);

    if (!deleted) {
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

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Failed to delete expense:', error);

    const message = error instanceof Error ? error.message : 'Failed to delete expense';

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

    if (message.includes('Only draft') || message.includes('Only draft or rejected')) {
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
