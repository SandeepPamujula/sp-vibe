/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { getExpenseById, updateExpense, deleteExpense } from '@/services';

import { GET, PUT, DELETE } from './route';

// Mock auth module
jest.mock('@/lib/auth', () => ({
  requireRequestContext: jest.fn(),
}));

// Mock expense service
jest.mock('@/services', () => ({
  getExpenseById: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
}));

const mockRequireRequestContext = requireRequestContext as jest.MockedFunction<
  typeof requireRequestContext
>;
const mockGetExpenseById = getExpenseById as jest.MockedFunction<typeof getExpenseById>;
const mockUpdateExpense = updateExpense as jest.MockedFunction<typeof updateExpense>;
const mockDeleteExpense = deleteExpense as jest.MockedFunction<typeof deleteExpense>;

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

const mockExpense = {
  id: 'expense-123',
  tenantId: 'tenant-123',
  submittedBy: 'user-123',
  approvedBy: null,
  workflowId: 'workflow-123',
  currentStepId: null,
  workflowType: 'petty' as const,
  expenseDate: '2024-01-15',
  invoiceNumber: 'INV-001',
  vendorName: 'Test Vendor',
  amount: '1000.50',
  natureOfExpense: 'Office Supplies',
  glCodeId: 'gl-code-123',
  purpose: 'Test purpose',
  status: 'draft' as const,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  submitter: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
  approver: null,
  glCode: {
    id: 'gl-code-123',
    code: 'GL001',
    description: 'Office Supplies',
  },
  workflow: null,
  currentStep: null,
  approvals: [],
  attachments: [],
  historyCount: 0,
};

describe('Expense Detail API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRequestContext.mockResolvedValue(mockContext);
  });

  describe('GET /api/expenses/:expenseId', () => {
    it('should get expense details successfully', async () => {
      mockGetExpenseById.mockResolvedValue(mockExpense);

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123');
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('expense-123');
      expect(mockGetExpenseById).toHaveBeenCalledWith('expense-123', mockContext.tenant.tenantId);
    });

    it('should return 404 when expense not found', async () => {
      mockGetExpenseById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/expenses/non-existent');
      const params = Promise.resolve({ expenseId: 'non-existent' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
      expect(data.error.message).toBe('Expense not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireRequestContext.mockRejectedValue(new Error('Unauthorized: No request context'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123');
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it('should return 500 for internal errors', async () => {
      mockGetExpenseById.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123');
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.INTERNAL_ERROR);
    });
  });

  describe('PUT /api/expenses/:expenseId', () => {
    it('should update expense successfully', async () => {
      mockUpdateExpense.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName: 'Updated Vendor',
          amount: 2000,
          purpose: 'Updated purpose',
        }),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUpdateExpense).toHaveBeenCalledWith(
        'expense-123',
        mockContext.tenant.tenantId,
        mockContext.user.id,
        {
          vendorName: 'Updated Vendor',
          amount: 2000,
          purpose: 'Updated purpose',
        }
      );
    });

    it('should return 400 for invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName: '',
          amount: -100,
        }),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
      expect(mockUpdateExpense).not.toHaveBeenCalled();
    });

    it('should return 404 when expense not found', async () => {
      mockUpdateExpense.mockRejectedValue(new Error('Expense not found'));

      const request = new NextRequest('http://localhost:3000/api/expenses/non-existent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName: 'Updated Vendor',
        }),
      });
      const params = Promise.resolve({ expenseId: 'non-existent' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
    });

    it('should return 400 when expense is not in draft status', async () => {
      mockUpdateExpense.mockRejectedValue(new Error('Only draft expenses can be updated'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName: 'Updated Vendor',
        }),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireRequestContext.mockRejectedValue(new Error('Unauthorized: No request context'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName: 'Updated Vendor',
        }),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it('should return 500 for internal errors', async () => {
      mockUpdateExpense.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName: 'Updated Vendor',
        }),
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.INTERNAL_ERROR);
    });
  });

  describe('DELETE /api/expenses/:expenseId', () => {
    it('should delete expense successfully', async () => {
      mockDeleteExpense.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.deleted).toBe(true);
      expect(mockDeleteExpense).toHaveBeenCalledWith('expense-123', mockContext.tenant.tenantId);
    });

    it('should return 404 when expense not found', async () => {
      mockDeleteExpense.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/expenses/non-existent', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ expenseId: 'non-existent' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
    });

    it('should return 400 when expense is not in draft status', async () => {
      mockDeleteExpense.mockRejectedValue(new Error('Only draft expenses can be deleted'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireRequestContext.mockRejectedValue(new Error('Unauthorized: No request context'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it('should return 500 for internal errors', async () => {
      mockDeleteExpense.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/expenses/expense-123', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ expenseId: 'expense-123' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.INTERNAL_ERROR);
    });
  });
});
