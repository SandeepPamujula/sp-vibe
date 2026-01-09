/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { submitExpense } from '@/services';

import { POST } from './route';

// Mock auth module
jest.mock('@/lib/auth', () => ({
  requireRequestContext: jest.fn(),
}));

// Mock expense service
jest.mock('@/services', () => ({
  submitExpense: jest.fn(),
}));

const mockRequireRequestContext = requireRequestContext as jest.MockedFunction<
  typeof requireRequestContext
>;
const mockSubmitExpense = submitExpense as jest.MockedFunction<typeof submitExpense>;

const mockContext = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin' as const,
  },
  tenant: {
    tenantId: 'tenant-123',
    tenantSlug: 'test-tenant',
  },
};

const mockSubmitResult = {
  expenseId: 'expense-123',
  workflowId: 'workflow-123',
  currentStepId: 'step-123',
  approvalId: 'approval-123',
};

describe('Submit Expense API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRequestContext.mockResolvedValue(mockContext);
  });

  describe('POST /api/expenses/:expenseId/submit', () => {
    it('should submit expense successfully', async () => {
      mockSubmitExpense.mockResolvedValue(mockSubmitResult);

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/submit', {
        method: 'POST',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.expenseId).toBe('expense-123');
      expect(data.data.workflowId).toBe('workflow-123');
      expect(data.data.currentStepId).toBe('step-123');
      expect(data.data.approvalId).toBe('approval-123');
      expect(mockSubmitExpense).toHaveBeenCalledWith(
        'expense-123',
        mockContext.tenant.tenantId,
        mockContext.user.id
      );
    });

    it('should return 404 when expense not found', async () => {
      mockSubmitExpense.mockRejectedValue(new Error('Expense not found'));

      const request = new NextRequest('http://localhost:3000/api/expenses/non-existent/submit', {
        method: 'POST',
      });
      const params = Promise.resolve({ expenseId: 'non-existent' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
      expect(data.error.message).toBe('Expense not found');
    });

    it('should return 400 when expense is not in draft status', async () => {
      mockSubmitExpense.mockRejectedValue(new Error('Only draft expenses can be submitted'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/submit', {
        method: 'POST',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 400 when user is not the expense owner', async () => {
      mockSubmitExpense.mockRejectedValue(
        new Error('Only the expense owner can submit the expense')
      );

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/submit', {
        method: 'POST',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 400 when no active workflow found', async () => {
      mockSubmitExpense.mockRejectedValue(new Error('No active workflow found for type: petty'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/submit', {
        method: 'POST',
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

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/submit', {
        method: 'POST',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it('should return 500 for internal errors', async () => {
      mockSubmitExpense.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123/submit', {
        method: 'POST',
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
