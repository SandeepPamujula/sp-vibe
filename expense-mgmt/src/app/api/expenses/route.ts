/**
 * Expenses API
 *
 * POST /api/expenses - Create a new expense
 * GET /api/expenses - List expenses with filters
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { createExpenseSchema } from '@/schemas';
import { createExpense, getExpenses } from '@/services';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { ExpenseSummary } from '@/types/entities';

type CreateExpenseResponse = ApiResponse<{ expenseId: string }>;
type ListExpensesResponse = PaginatedResponse<ExpenseSummary>;

/**
 * POST /api/expenses
 *
 * Create a new expense in draft status.
 */
export async function POST(request: Request): Promise<NextResponse<CreateExpenseResponse>> {
  try {
    const context = await requireRequestContext();
    const { user, tenant } = context;

    const body = await request.json();
    const validation = createExpenseSchema.safeParse(body);
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

    const expenseId = await createExpense({
      tenantId: tenant.tenantId,
      userId: user.id,
      ...validation.data,
    });

    return NextResponse.json(
      {
        success: true,
        data: { expenseId },
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Failed to create expense:', error);

    const message = error instanceof Error ? error.message : 'Failed to create expense';

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

    if (message.includes('No active workflow')) {
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
 * GET /api/expenses
 *
 * List expenses with optional filters.
 *
 * Query params:
 * - status: Filter by expense status (draft, submitted, approved, rejected)
 * - workflowType: Filter by workflow type (petty, internet)
 * - submittedBy: Filter by submitter ID
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 */
export async function GET(request: Request): Promise<NextResponse<ListExpensesResponse>> {
  try {
    const context = await requireRequestContext();
    const { tenant } = context;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as
      | 'draft'
      | 'submitted'
      | 'approved'
      | 'rejected'
      | null;
    const workflowType = searchParams.get('workflowType') as 'petty' | 'internet' | null;
    const submittedBy = searchParams.get('submittedBy');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
    const offset = (page - 1) * limit;

    const { expenses, total } = await getExpenses(tenant.tenantId, {
      status: status ?? undefined,
      workflowType: workflowType ?? undefined,
      submittedBy: submittedBy ?? undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: expenses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to list expenses:', error);

    const message = error instanceof Error ? error.message : 'Failed to list expenses';

    if (message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
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
        data: [],
        meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message,
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
