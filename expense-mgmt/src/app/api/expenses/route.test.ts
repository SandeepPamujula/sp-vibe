/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { API_ERROR_CODES, HTTP_STATUS } from '@/constants';
import { requireRequestContext } from '@/lib/auth';
import { createExpense, getExpenses } from '@/services';

import { POST, GET } from './route';

// Mock auth module
jest.mock('@/lib/auth', () => ({
  requireRequestContext: jest.fn(),
}));

// Mock expense service
jest.mock('@/services', () => ({
  createExpense: jest.fn(),
  getExpenses: jest.fn(),
}));

const mockRequireRequestContext = requireRequestContext as jest.MockedFunction<
  typeof requireRequestContext
>;
const mockCreateExpense = createExpense as jest.MockedFunction<typeof createExpense>;
const mockGetExpenses = getExpenses as jest.MockedFunction<typeof getExpenses>;

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

describe('Expenses API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRequestContext.mockResolvedValue(mockContext);
  });

  describe('POST /api/expenses', () => {
    it('should create expense successfully', async () => {
      const expenseId = 'expense-123';
      mockCreateExpense.mockResolvedValue(expenseId);

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowType: 'petty',
          expenseDate: '2024-01-15',
          vendorName: 'Test Vendor',
          amount: 1000.5,
          natureOfExpense: 'c1111111-1111-1111-1111-111111111111',
          purpose: 'Test purpose',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(data.success).toBe(true);
      expect(data.data.expenseId).toBe(expenseId);
      expect(mockCreateExpense).toHaveBeenCalledWith({
        tenantId: mockContext.tenant.tenantId,
        userId: mockContext.user.id,
        workflowType: 'petty',
        expenseDate: '2024-01-15',
        vendorName: 'Test Vendor',
        amount: 1000.5,
        natureOfExpense: 'c1111111-1111-1111-1111-111111111111',
        purpose: 'Test purpose',
      });
    });

    it('should create expense with minimal required fields', async () => {
      const expenseId = 'expense-456';
      mockCreateExpense.mockResolvedValue(expenseId);

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenseDate: '2024-01-15',
          vendorName: 'Test Vendor',
          amount: 500,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(data.success).toBe(true);
      expect(data.data.expenseId).toBe(expenseId);
      expect(mockCreateExpense).toHaveBeenCalledWith({
        tenantId: mockContext.tenant.tenantId,
        userId: mockContext.user.id,
        workflowType: 'petty', // default value
        expenseDate: '2024-01-15',
        vendorName: 'Test Vendor',
        amount: 500,
      });
    });

    it('should return 400 for invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenseDate: 'invalid-date',
          vendorName: '',
          amount: -100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
      expect(mockCreateExpense).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireRequestContext.mockRejectedValue(new Error('Unauthorized: No request context'));

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenseDate: '2024-01-15',
          vendorName: 'Test Vendor',
          amount: 1000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it('should return 400 when workflow is not active', async () => {
      mockCreateExpense.mockRejectedValue(new Error('No active workflow found for type: petty'));

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenseDate: '2024-01-15',
          vendorName: 'Test Vendor',
          amount: 1000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    it('should return 500 for internal errors', async () => {
      mockCreateExpense.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenseDate: '2024-01-15',
          vendorName: 'Test Vendor',
          amount: 1000,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.INTERNAL_ERROR);
    });
  });

  describe('GET /api/expenses', () => {
    it('should list expenses successfully', async () => {
      const mockExpenses = [
        {
          id: 'expense-1',
          expenseDate: '2024-01-15',
          vendorName: 'Vendor 1',
          amount: '1000.50',
          natureOfExpense: 'Office Supplies',
          status: 'draft' as const,
          workflowType: 'petty' as const,
          submitterName: 'Test User',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'expense-2',
          expenseDate: '2024-01-16',
          vendorName: 'Vendor 2',
          amount: '2000.00',
          natureOfExpense: 'Travel',
          status: 'submitted' as const,
          workflowType: 'petty' as const,
          submitterName: 'Test User',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16'),
        },
      ];
      mockGetExpenses.mockResolvedValue({
        expenses: mockExpenses,
        total: 2,
      });

      const request = new NextRequest('http://localhost:3000/api/expenses');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.meta.total).toBe(2);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
      expect(mockGetExpenses).toHaveBeenCalledWith(mockContext.tenant.tenantId, {
        limit: 10,
        offset: 0,
      });
    });

    it('should handle pagination parameters', async () => {
      mockGetExpenses.mockResolvedValue({
        expenses: [],
        total: 25,
      });

      const request = new NextRequest('http://localhost:3000/api/expenses?page=2&limit=5');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.meta.page).toBe(2);
      expect(data.meta.limit).toBe(5);
      expect(data.meta.totalPages).toBe(5);
      expect(mockGetExpenses).toHaveBeenCalledWith(mockContext.tenant.tenantId, {
        limit: 5,
        offset: 5,
      });
    });

    it('should handle filter parameters', async () => {
      mockGetExpenses.mockResolvedValue({
        expenses: [],
        total: 0,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/expenses?status=submitted&workflowType=petty&search=test&startDate=2024-01-01&endDate=2024-01-31&submittedBy=user-123'
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetExpenses).toHaveBeenCalledWith(mockContext.tenant.tenantId, {
        status: 'submitted',
        workflowType: 'petty',
        search: 'test',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        submittedBy: 'user-123',
        limit: 10,
        offset: 0,
      });
    });

    it('should enforce max limit of 100', async () => {
      mockGetExpenses.mockResolvedValue({
        expenses: [],
        total: 0,
      });

      const request = new NextRequest('http://localhost:3000/api/expenses?limit=200');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.limit).toBe(100);
      expect(mockGetExpenses).toHaveBeenCalledWith(mockContext.tenant.tenantId, {
        limit: 100,
        offset: 0,
      });
    });

    it('should enforce min page of 1', async () => {
      mockGetExpenses.mockResolvedValue({
        expenses: [],
        total: 0,
      });

      const request = new NextRequest('http://localhost:3000/api/expenses?page=0');

      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.meta.page).toBe(1);
      expect(mockGetExpenses).toHaveBeenCalledWith(mockContext.tenant.tenantId, {
        limit: 10,
        offset: 0,
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireRequestContext.mockRejectedValue(new Error('Unauthorized: No request context'));

      const request = new NextRequest('http://localhost:3000/api/expenses');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.UNAUTHORIZED);
      expect(data.data).toEqual([]);
      expect(data.meta.total).toBe(0);
    });

    it('should return 500 for internal errors', async () => {
      mockGetExpenses.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/expenses');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(API_ERROR_CODES.INTERNAL_ERROR);
      expect(data.data).toEqual([]);
      expect(data.meta.total).toBe(0);
    });
  });
});
