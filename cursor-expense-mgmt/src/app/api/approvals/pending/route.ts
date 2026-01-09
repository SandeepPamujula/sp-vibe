/**
 * Pending Approvals API
 *
 * GET /api/approvals/pending - List pending expenses for approval
 */

import { NextResponse } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { PAGINATION_DEFAULTS } from '@/constants/query.constants';
import { requireRequestContext } from '@/lib/auth';
import { getPendingExpensesForApproval } from '@/services';
import type { PaginatedResponse } from '@/types/api.types';
import type { ExpenseSummary } from '@/types/entities';

type PendingApprovalsResponse = PaginatedResponse<ExpenseSummary>;

/**
 * GET /api/approvals/pending
 *
 * List pending expenses for approval (for approvers).
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 */
export async function GET(request: Request): Promise<NextResponse<PendingApprovalsResponse>> {
  try {
    const context = await requireRequestContext();
    const { tenant, user } = context;

    // Verify user has approver role
    if (user.role !== 'approver') {
      return NextResponse.json(
        {
          success: false,
          data: [],
          meta: { page: 1, limit: PAGINATION_DEFAULTS.LIMIT, total: 0, totalPages: 0 },
          error: {
            code: API_ERROR_CODES.FORBIDDEN,
            message: 'Only approvers can access pending approvals',
          },
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(
      PAGINATION_DEFAULTS.MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') ?? PAGINATION_DEFAULTS.LIMIT.toString(), 10))
    );
    const offset = (page - 1) * limit;

    const { expenses, total } = await getPendingExpensesForApproval(tenant.tenantId, {
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
    console.error('Failed to list pending approvals:', error);

    const message = error instanceof Error ? error.message : 'Failed to list pending approvals';

    if (message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          meta: { page: 1, limit: PAGINATION_DEFAULTS.LIMIT, total: 0, totalPages: 0 },
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
        meta: { page: 1, limit: PAGINATION_DEFAULTS.LIMIT, total: 0, totalPages: 0 },
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message,
        },
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
