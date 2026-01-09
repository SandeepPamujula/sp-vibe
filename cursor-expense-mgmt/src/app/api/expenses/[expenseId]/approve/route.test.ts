/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { approveExpense } from '@/services';

import { POST } from './route';

// Mock auth module
jest.mock('@/lib/auth', () => ({
  requireRequestContext: jest.fn(),
}));

// Mock expense service
jest.mock('@/services', () => ({
  approveExpense: jest.fn(),
}));

const mockRequireRequestContext = requireRequestContext as jest.MockedFunction<
  typeof requireRequestContext
>;
const mockApproveExpense = approveExpense as jest.MockedFunction<typeof approveExpense>;

const mockApproverContext = {
  user: {
    id: 'approver-123',
    email: 'approver@example.com',
    name: 'Approver User',
    role: 'approver' as const,
  },
  tenant: {
    tenantId: 'tenant-123',
    tenantSlug: 'test-tenant',
  },
};

const mockAdminContext = {
  user: {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
  },
  tenant: {
    tenantId: 'tenant-123',
    tenantSlug: 'test-tenant',
  },
};

describe('Approve Expense API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRequestContext.mockResolvedValue(mockApproverContext);
  });

  describe('POST /api/expenses/:expenseId/approve', () => {
    it('should approve expense successfully', async () => {
      mockApproveExpense.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({ comments: 'Looks good' }),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.expenseId).toBe('expense-123');
      expect(mockApproveExpense).toHaveBeenCalledWith(
        'expense-123',
        mockApproverContext.tenant.tenantId,
        mockApproverContext.user.id,
        'Looks good'
      );
    });

    it('should approve expense without comments', async () => {
      mockApproveExpense.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockApproveExpense).toHaveBeenCalledWith(
        'expense-123',
        mockApproverContext.tenant.tenantId,
        mockApproverContext.user.id,
        undefined
      );
    });

    it('should return 403 when user is not an approver', async () => {
      mockRequireRequestContext.mockResolvedValue(mockAdminContext);

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.FORBIDDEN);
      expect(data.error.message).toBe('Only approvers can approve expenses');
      expect(mockApproveExpense).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', async () => {
      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({ comments: 'a'.repeat(5001) }), // Exceeds max length
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
      expect(mockApproveExpense).not.toHaveBeenCalled();
    });

    it('should return 404 when expense not found', async () => {
      mockApproveExpense.mockRejectedValue(new Error('Expense not found'));

      const request = new NextRequest('http://localhost:3000/api/expenses/non-existent/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'non-existent' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
    });

    it('should return 400 when expense is not in submitted status', async () => {
      mockApproveExpense.mockRejectedValue(new Error('Only submitted expenses can be approved'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 400 when no pending approval found', async () => {
      mockApproveExpense.mockRejectedValue(new Error('No pending approval found for this expense'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 400 when expense has no current workflow step', async () => {
      mockApproveExpense.mockRejectedValue(new Error('Expense has no current workflow step'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireRequestContext.mockRejectedValue(new Error('Unauthorized: No request context'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it('should return 500 for internal errors', async () => {
      mockApproveExpense.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/approve', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.INTERNAL_ERROR);
    });
  });
});
