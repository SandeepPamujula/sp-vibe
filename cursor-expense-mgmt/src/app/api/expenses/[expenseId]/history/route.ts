/**
 * Expense History API
 *
 * GET /api/expenses/:expenseId/history - Get expense audit trail
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { getExpenseHistory } from '@/services';
import type { ApiResponse } from '@/types/api.types';
import type { ExpenseHistoryEntry } from '@/types/entities';

type ExpenseHistoryResponse = ApiResponse<ExpenseHistoryEntry[]>;

interface RouteParams {
  params: Promise<{ expenseId: string }>;
}

/**
 * GET /api/expenses/:expenseId/history
 *
 * Get expense audit trail/history.
 * Returns all history entries for an expense, ordered by creation date (oldest first).
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<ExpenseHistoryResponse>> {
  try {
    const context = await requireRequestContext();
    const { tenant } = context;
    const { expenseId } = await params;

    const history = await getExpenseHistory(expenseId, tenant.tenantId);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Failed to get expense history:', error);

    const message = error instanceof Error ? error.message : 'Failed to get expense history';

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
