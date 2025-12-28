/**
 * @jest-environment node
 */

// Mock the schema before importing anything that uses it
jest.mock('../../../drizzle/schema', () => ({
  expenses: {
    id: 'id',
    tenantId: 'tenant_id',
    submittedBy: 'submitted_by',
    approvedBy: 'approved_by',
    workflowId: 'workflow_id',
    currentStepId: 'current_step_id',
    workflowType: 'workflow_type',
    expenseDate: 'expense_date',
    invoiceNumber: 'invoice_number',
    vendorName: 'vendor_name',
    amount: 'amount',
    natureOfExpense: 'nature_of_expense',
    glCodeId: 'gl_code_id',
    purpose: 'purpose',
    status: 'status',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  expenseApprovals: {
    id: 'id',
    expenseId: 'expense_id',
    workflowStepId: 'workflow_step_id',
    approverId: 'approver_id',
    status: 'status',
    comments: 'comments',
    actedAt: 'acted_at',
    createdAt: 'created_at',
  },
  expenseHistory: {
    id: 'id',
    expenseId: 'expense_id',
    userId: 'user_id',
    action: 'action',
    comments: 'comments',
    changes: 'changes',
    createdAt: 'created_at',
  },
  expenseWorkflows: {
    id: 'id',
    tenantId: 'tenant_id',
    name: 'name',
    code: 'code',
    description: 'description',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  workflowSteps: {
    id: 'id',
    workflowId: 'workflow_id',
    stepOrder: 'step_order',
    name: 'name',
    description: 'description',
    approverRole: 'approver_role',
    amountThreshold: 'amount_threshold',
    isFinal: 'is_final',
    isActive: 'is_active',
    createdAt: 'created_at',
  },
  users: {
    id: 'id',
    tenantId: 'tenant_id',
    email: 'email',
    name: 'name',
    role: 'role',
    isActive: 'is_active',
    lastLogin: 'last_login',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  glCodes: {
    id: 'id',
    tenantId: 'tenant_id',
    code: 'code',
    description: 'description',
    isActive: 'is_active',
    createdAt: 'created_at',
  },
  expenseAttachments: {
    id: 'id',
    expenseId: 'expense_id',
    fileName: 'file_name',
    s3Key: 's3_key',
    contentType: 'content_type',
    fileSize: 'file_size',
    uploadedAt: 'uploaded_at',
  },
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value, type: 'eq' })),
  and: jest.fn((...conditions) => ({ conditions, type: 'and' })),
  desc: jest.fn((field) => ({ field, type: 'desc' })),
  asc: jest.fn((field) => ({ field, type: 'asc' })),
}));

// Test data
const mockGlCode = {
  id: 'gl-123',
  code: '5100',
  description: 'Office Supplies',
};

const mockWorkflow = {
  id: 'workflow-petty-123',
  name: 'Petty Cash',
  code: 'petty' as const,
};

const mockWorkflowStep = {
  id: 'step-123',
  stepOrder: 1,
  name: 'Approver Review',
  approverRole: 'approver',
  isFinal: true,
};

const mockExpense = {
  id: 'expense-123',
  tenantId: 'tenant-123',
  submittedBy: 'user-123',
  approvedBy: null,
  workflowId: null,
  currentStepId: null,
  workflowType: 'petty' as const,
  expenseDate: '2024-01-15',
  invoiceNumber: 'INV-001',
  vendorName: 'Office Supplies Inc',
  amount: '150.00',
  natureOfExpense: 'Office Supplies', // Now derived from GL code description
  glCodeId: 'gl-123',
  purpose: 'Monthly supplies',
  status: 'draft' as const,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
};

// Track insert calls
const insertCalls: { table: string; values: unknown }[] = [];
const updateCalls: { values: unknown }[] = [];

// Mock the database with chained methods
jest.mock('@/lib/db', () => {
  const createSelectChain = (result: unknown[] = []) => ({
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(() => result),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn(() => result),
    offset: jest.fn(() => result),
  });

  const createSelectDistinctChain = (result: unknown[] = []) => ({
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn(() => result),
  });

  return {
    db: {
      select: jest.fn(() => createSelectChain([])),
      selectDistinct: jest.fn(() => createSelectDistinctChain([])),
      insert: jest.fn((table) => ({
        values: jest.fn((values) => {
          insertCalls.push({ table, values });
          return {
            returning: jest.fn(() => [{ id: 'new-id-123' }]),
          };
        }),
      })),
      update: jest.fn(() => ({
        set: jest.fn((values) => {
          updateCalls.push({ values });
          return {
            where: jest.fn(() => Promise.resolve()),
          };
        }),
      })),
      delete: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve()),
      })),
    },
  };
});

// Import after all mocks are set up
import { db } from '@/lib/db';

import {
  createExpense,
  updateExpense,
  deleteExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  getExpenseById,
  getExpenses,
  getPendingExpensesForApproval,
  getGlCodes,
  getExpenseHistory,
} from '../expense.service';

describe('Expense Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    insertCalls.length = 0;
    updateCalls.length = 0;
  });

  describe('createExpense', () => {
    it('should throw error when GL code not found', async () => {
      // Mock GL code not found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(
        createExpense({
          tenantId: 'tenant-123',
          userId: 'user-123',
          workflowType: 'petty',
          expenseDate: '2024-01-15',
          vendorName: 'Test Vendor',
          amount: 100,
          natureOfExpense: 'invalid-gl-code-id', // GL code ID that doesn't exist
        })
      ).rejects.toThrow('Invalid nature of expense selection');
    });

    it('should throw error when no workflow found for type', async () => {
      // First: GL code found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockGlCode]),
      }));

      // Second: workflow not found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(
        createExpense({
          tenantId: 'tenant-123',
          userId: 'user-123',
          workflowType: 'petty',
          expenseDate: '2024-01-15',
          vendorName: 'Test Vendor',
          amount: 100,
          natureOfExpense: 'gl-123', // Valid GL code ID
        })
      ).rejects.toThrow('No active workflow found for type: petty');
    });

    it('should create expense with GL code mapping', async () => {
      // First: GL code found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockGlCode]),
      }));

      // Second: workflow found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockWorkflow]),
      }));

      const expenseId = await createExpense({
        tenantId: 'tenant-123',
        userId: 'user-123',
        workflowType: 'petty',
        expenseDate: '2024-01-15',
        vendorName: 'Test Vendor',
        amount: 150.5,
        natureOfExpense: 'gl-123', // GL code ID
        invoiceNumber: 'INV-001',
        purpose: 'Business purpose',
      });

      expect(expenseId).toBe('new-id-123');
      expect(db.insert).toHaveBeenCalledTimes(2); // expense + history
      expect(insertCalls).toHaveLength(2);

      // Verify expense was created with mapped GL code values
      const expenseInsert = insertCalls[0];
      expect(expenseInsert?.values).toMatchObject({
        tenantId: 'tenant-123',
        submittedBy: 'user-123',
        workflowType: 'petty',
        expenseDate: '2024-01-15',
        vendorName: 'Test Vendor',
        amount: '150.50',
        natureOfExpense: 'Office Supplies', // Derived from GL code description
        invoiceNumber: 'INV-001',
        glCodeId: 'gl-123', // Mapped from input
        purpose: 'Business purpose',
        status: 'draft',
      });

      // Verify history entry was created
      const historyInsert = insertCalls[1];
      expect(historyInsert?.values).toMatchObject({
        expenseId: 'new-id-123',
        userId: 'user-123',
        action: 'created',
        comments: 'Expense created',
        changes: { initial: true },
      });
    });

    it('should create expense with default workflow type', async () => {
      // First: GL code found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockGlCode]),
      }));

      // Second: workflow found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockWorkflow]),
      }));

      await createExpense({
        tenantId: 'tenant-123',
        userId: 'user-123',
        expenseDate: '2024-01-15',
        vendorName: 'Test Vendor',
        amount: 100,
        natureOfExpense: 'gl-123',
      });

      const expenseInsert = insertCalls[0];
      expect(expenseInsert?.values).toMatchObject({
        workflowType: 'petty',
        glCodeId: 'gl-123',
        natureOfExpense: 'Office Supplies',
      });
    });
  });

  describe('updateExpense', () => {
    it('should throw error when expense not found', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(
        updateExpense('expense-123', 'tenant-123', 'user-123', { vendorName: 'New Vendor' })
      ).rejects.toThrow('Expense not found');
    });

    it('should throw error when expense is not in draft status', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ ...mockExpense, status: 'submitted' }]),
      }));

      await expect(
        updateExpense('expense-123', 'tenant-123', 'user-123', { vendorName: 'New Vendor' })
      ).rejects.toThrow('Only draft expenses can be updated');
    });

    it('should update expense and log history', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]),
      }));

      await updateExpense('expense-123', 'tenant-123', 'user-123', {
        vendorName: 'Updated Vendor',
        amount: 200,
      });

      expect(db.update).toHaveBeenCalled();
      expect(updateCalls).toHaveLength(1);
      expect(updateCalls[0]?.values).toMatchObject({
        vendorName: 'Updated Vendor',
        amount: '200.00',
      });

      expect(db.insert).toHaveBeenCalled();
      expect(insertCalls[0]?.values).toMatchObject({
        expenseId: 'expense-123',
        userId: 'user-123',
        action: 'updated',
        comments: 'Expense updated',
      });
    });

    it('should throw error when updating with invalid GL code', async () => {
      // First: expense found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]),
      }));

      // Second: GL code not found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(
        updateExpense('expense-123', 'tenant-123', 'user-123', {
          natureOfExpense: 'invalid-gl-code',
        })
      ).rejects.toThrow('Invalid nature of expense selection');
    });

    it('should update natureOfExpense with GL code mapping', async () => {
      const newGlCode = { id: 'gl-456', code: '5200', description: 'Travel & Transportation' };

      // First: expense found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]),
      }));

      // Second: GL code found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [newGlCode]),
      }));

      await updateExpense('expense-123', 'tenant-123', 'user-123', {
        natureOfExpense: 'gl-456', // New GL code ID
      });

      expect(db.update).toHaveBeenCalled();
      expect(updateCalls).toHaveLength(1);
      expect(updateCalls[0]?.values).toMatchObject({
        natureOfExpense: 'Travel & Transportation', // Mapped from GL code description
        glCodeId: 'gl-456', // Mapped from input
      });
    });

    it('should not log history when no changes made', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]),
      }));

      await updateExpense('expense-123', 'tenant-123', 'user-123', {});

      expect(db.update).toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  describe('deleteExpense', () => {
    it('should return false when expense not found', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      const result = await deleteExpense('expense-123', 'tenant-123');

      expect(result).toBe(false);
    });

    it('should throw error when expense is not in draft status', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ id: 'expense-123', status: 'submitted' }]),
      }));

      await expect(deleteExpense('expense-123', 'tenant-123')).rejects.toThrow(
        'Only draft expenses can be deleted'
      );
    });

    it('should delete expense when in draft status', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ id: 'expense-123', status: 'draft' }]),
      }));

      const result = await deleteExpense('expense-123', 'tenant-123');

      expect(result).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('submitExpense', () => {
    it('should throw error when expense not found', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(submitExpense('expense-123', 'tenant-123', 'user-123')).rejects.toThrow(
        'Expense not found'
      );
    });

    it('should throw error when expense is not in draft status', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ ...mockExpense, status: 'submitted' }]),
      }));

      await expect(submitExpense('expense-123', 'tenant-123', 'user-123')).rejects.toThrow(
        'Only draft expenses can be submitted'
      );
    });

    it('should throw error when user is not the expense owner', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ ...mockExpense, submittedBy: 'other-user' }]),
      }));

      await expect(submitExpense('expense-123', 'tenant-123', 'user-123')).rejects.toThrow(
        'Only the expense owner can submit'
      );
    });

    it('should throw error when no workflow found', async () => {
      // First call: get expense
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]),
      }));

      // Second call: get workflow - not found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(submitExpense('expense-123', 'tenant-123', 'user-123')).rejects.toThrow(
        'No active workflow found for type: petty'
      );
    });

    it('should throw error when no workflow steps found', async () => {
      // First call: get expense
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]),
      }));

      // Second call: get workflow
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockWorkflow]),
      }));

      // Third call: get workflow step - not found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(submitExpense('expense-123', 'tenant-123', 'user-123')).rejects.toThrow(
        'No active workflow steps found'
      );
    });

    it('should submit expense and create approval record', async () => {
      // First call: get expense
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]),
      }));

      // Second call: get workflow
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockWorkflow]),
      }));

      // Third call: get workflow step
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockWorkflowStep]),
      }));

      const result = await submitExpense('expense-123', 'tenant-123', 'user-123');

      expect(result).toMatchObject({
        expenseId: 'expense-123',
        workflowId: 'workflow-petty-123',
        currentStepId: 'step-123',
        approvalId: 'new-id-123',
      });

      // Verify approval record was created
      expect(db.insert).toHaveBeenCalledTimes(2); // approval + history
      expect(insertCalls[0]?.values).toMatchObject({
        expenseId: 'expense-123',
        workflowStepId: 'step-123',
        status: 'pending',
      });

      // Verify expense was updated
      expect(db.update).toHaveBeenCalled();
      expect(updateCalls[0]?.values).toMatchObject({
        workflowId: 'workflow-petty-123',
        currentStepId: 'step-123',
        status: 'submitted',
      });

      // Verify history entry was created
      expect(insertCalls[1]?.values).toMatchObject({
        expenseId: 'expense-123',
        userId: 'user-123',
        action: 'submitted',
        comments: 'Submitted for approval',
        changes: { status: { from: 'draft', to: 'submitted' } },
      });
    });
  });

  describe('approveExpense', () => {
    const mockSubmittedExpense = {
      ...mockExpense,
      status: 'submitted' as const,
      workflowId: 'workflow-petty-123',
      currentStepId: 'step-123',
    };

    const mockPendingApproval = {
      id: 'approval-123',
      expenseId: 'expense-123',
      workflowStepId: 'step-123',
      approverId: null,
      status: 'pending' as const,
      comments: null,
      actedAt: null,
      createdAt: new Date('2024-01-15'),
    };

    beforeEach(() => {
      insertCalls.length = 0;
      updateCalls.length = 0;
    });

    it('should approve expense successfully', async () => {
      // First call: get expense
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockSubmittedExpense]),
      }));

      // Second call: get workflow step
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockWorkflowStep]),
      }));

      // Third call: get pending approval
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockPendingApproval]),
      }));

      await approveExpense('expense-123', 'tenant-123', 'approver-123', 'Looks good');

      // Verify approval record was updated
      expect(db.update).toHaveBeenCalledTimes(2); // approval + expense
      expect(updateCalls[0]?.values).toMatchObject({
        status: 'approved',
        approverId: 'approver-123',
        comments: 'Looks good',
      });

      // Verify expense was updated (final step)
      expect(updateCalls[1]?.values).toMatchObject({
        status: 'approved',
        approvedBy: 'approver-123',
      });

      // Verify history entry was created
      expect(db.insert).toHaveBeenCalled();
      expect(insertCalls[0]?.values).toMatchObject({
        expenseId: 'expense-123',
        userId: 'approver-123',
        action: 'approved',
        comments: 'Looks good',
      });
    });

    it('should approve expense without comments', async () => {
      let callCount = 0;
      (db.select as jest.Mock).mockImplementation(() => {
        callCount++;
        return {
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn(() => {
            if (callCount === 1) return [mockSubmittedExpense];
            if (callCount === 2) return [mockWorkflowStep];
            if (callCount === 3) return [mockPendingApproval];
            return [];
          }),
        };
      });

      await approveExpense('expense-123', 'tenant-123', 'approver-123');

      expect(updateCalls[0]?.values).toMatchObject({
        comments: null,
      });
      expect(insertCalls[0]?.values).toMatchObject({
        comments: 'Approved',
      });
    });

    it('should throw error when expense not found', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(approveExpense('non-existent', 'tenant-123', 'approver-123')).rejects.toThrow(
        'Expense not found'
      );
    });

    it('should throw error when expense is not submitted', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]), // draft status
      }));

      await expect(approveExpense('expense-123', 'tenant-123', 'approver-123')).rejects.toThrow(
        'Only submitted expenses can be approved'
      );
    });

    it('should throw error when expense has no current step', async () => {
      const expenseWithoutStep = {
        ...mockSubmittedExpense,
        currentStepId: null,
      };

      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [expenseWithoutStep]),
      }));

      await expect(approveExpense('expense-123', 'tenant-123', 'approver-123')).rejects.toThrow(
        'Expense has no current workflow step'
      );
    });

    it('should throw error when no pending approval found', async () => {
      (db.select as jest.Mock)
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn(() => [mockSubmittedExpense]),
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn(() => [mockWorkflowStep]),
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn(() => []), // No pending approval
        }));

      await expect(approveExpense('expense-123', 'tenant-123', 'approver-123')).rejects.toThrow(
        'No pending approval found for this expense'
      );
    });
  });

  describe('rejectExpense', () => {
    const mockSubmittedExpense = {
      ...mockExpense,
      status: 'submitted' as const,
      workflowId: 'workflow-petty-123',
      currentStepId: 'step-123',
    };

    const mockPendingApproval = {
      id: 'approval-123',
      expenseId: 'expense-123',
      workflowStepId: 'step-123',
      approverId: null,
      status: 'pending' as const,
      comments: null,
      actedAt: null,
      createdAt: new Date('2024-01-15'),
    };

    beforeEach(() => {
      insertCalls.length = 0;
      updateCalls.length = 0;
    });

    it('should reject expense successfully', async () => {
      // First call: get expense
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockSubmittedExpense]),
      }));

      // Second call: get pending approval
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockPendingApproval]),
      }));

      await rejectExpense('expense-123', 'tenant-123', 'approver-123', 'Missing documentation');

      // Verify approval record was updated
      expect(db.update).toHaveBeenCalledTimes(2); // approval + expense
      expect(updateCalls[0]?.values).toMatchObject({
        status: 'rejected',
        approverId: 'approver-123',
        comments: 'Missing documentation',
      });

      // Verify expense was updated (rejection is always final)
      expect(updateCalls[1]?.values).toMatchObject({
        status: 'rejected',
      });

      // Verify history entry was created
      expect(db.insert).toHaveBeenCalled();
      expect(insertCalls[0]?.values).toMatchObject({
        expenseId: 'expense-123',
        userId: 'approver-123',
        action: 'rejected',
        comments: 'Missing documentation',
      });
    });

    it('should throw error when comments are missing', async () => {
      await expect(rejectExpense('expense-123', 'tenant-123', 'approver-123', '')).rejects.toThrow(
        'Rejection reason is required'
      );
    });

    it('should throw error when expense not found', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(
        rejectExpense('non-existent', 'tenant-123', 'approver-123', 'Missing docs')
      ).rejects.toThrow('Expense not found');
    });

    it('should throw error when expense is not submitted', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [mockExpense]), // draft status
      }));

      await expect(
        rejectExpense('expense-123', 'tenant-123', 'approver-123', 'Missing docs')
      ).rejects.toThrow('Only submitted expenses can be rejected');
    });

    it('should throw error when expense has no current step', async () => {
      const expenseWithoutStep = {
        ...mockSubmittedExpense,
        currentStepId: null,
      };

      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [expenseWithoutStep]),
      }));

      await expect(
        rejectExpense('expense-123', 'tenant-123', 'approver-123', 'Missing docs')
      ).rejects.toThrow('Expense has no current workflow step');
    });

    it('should throw error when no pending approval found', async () => {
      (db.select as jest.Mock)
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn(() => [mockSubmittedExpense]),
        }))
        .mockImplementationOnce(() => ({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn(() => []), // No pending approval
        }));

      await expect(
        rejectExpense('expense-123', 'tenant-123', 'approver-123', 'Missing docs')
      ).rejects.toThrow('No pending approval found for this expense');
    });
  });

  describe('getExpenseById', () => {
    it('should return null when expense not found', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      const result = await getExpenseById('expense-123', 'tenant-123');

      expect(result).toBeNull();
    });

    it('should return expense with relations', async () => {
      // First call: get expense with submitter
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ expense: mockExpense, submitter: mockUser }]),
      }));

      // Subsequent calls for related data (approver, glCode, workflow, etc.)
      // Each returns empty/null as there are no relations in mock data
      (db.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => []),
        limit: jest.fn(() => []),
      }));

      // Mock selectDistinct for attachments query
      (db.selectDistinct as jest.Mock).mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => []),
      }));

      const result = await getExpenseById('expense-123', 'tenant-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('expense-123');
      expect(result?.submitter).toEqual(mockUser);
      expect(result?.approvals).toEqual([]);
      expect(result?.attachments).toEqual([]);
    });
  });

  describe('getExpenses', () => {
    it('should return empty list when no expenses', async () => {
      // First call: count
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => []),
      }));

      // Second call: get expenses
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn(() => []),
      }));

      const result = await getExpenses('tenant-123');

      expect(result.expenses).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return expenses with pagination', async () => {
      const mockExpenses = [
        { expense: mockExpense, submitterName: 'Test User' },
        { expense: { ...mockExpense, id: 'expense-456' }, submitterName: 'Another User' },
      ];

      // First call: count
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => mockExpenses),
      }));

      // Second call: get expenses
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn(() => mockExpenses),
      }));

      const result = await getExpenses('tenant-123', { limit: 10, offset: 0 });

      expect(result.expenses).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.expenses[0]?.id).toBe('expense-123');
    });

    it('should apply filters', async () => {
      // First call: count
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => []),
      }));

      // Second call: get expenses
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn(() => []),
      }));

      await getExpenses('tenant-123', {
        status: 'draft',
        workflowType: 'petty',
        submittedBy: 'user-123',
      });

      // Verify the select was called (filters are applied internally)
      expect(db.select).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPendingExpensesForApproval', () => {
    it('should return only submitted expenses', async () => {
      const mockSubmittedExpenses = [
        { expense: { ...mockExpense, status: 'submitted' }, submitterName: 'Test User' },
      ];

      // First call: count
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => mockSubmittedExpenses),
      }));

      // Second call: get expenses
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn(() => mockSubmittedExpenses),
      }));

      const result = await getPendingExpensesForApproval('tenant-123');

      expect(result.expenses).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getGlCodes', () => {
    it('should return active GL codes', async () => {
      const mockGlCodes = [
        { id: 'gl-1', code: '5100', description: 'Office Supplies' },
        { id: 'gl-2', code: '5200', description: 'Travel' },
      ];

      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => mockGlCodes),
      }));

      const result = await getGlCodes('tenant-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'gl-1', code: '5100', description: 'Office Supplies' });
    });

    it('should return empty array when no GL codes', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => []),
      }));

      const result = await getGlCodes('tenant-123');

      expect(result).toEqual([]);
    });
  });

  describe('getExpenseHistory', () => {
    const mockExpenseId = 'expense-123';
    const mockTenantId = 'tenant-123';

    const mockHistoryEntry1 = {
      id: 'history-1',
      expenseId: mockExpenseId,
      userId: 'user-1',
      action: 'created' as const,
      comments: 'Expense created',
      changes: { initial: true },
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const mockHistoryEntry2 = {
      id: 'history-2',
      expenseId: mockExpenseId,
      userId: 'user-1',
      action: 'updated' as const,
      comments: 'Expense updated',
      changes: { vendorName: { from: 'Old Vendor', to: 'New Vendor' } },
      createdAt: new Date('2024-01-15T10:30:00Z'),
    };

    const mockHistoryEntry3 = {
      id: 'history-3',
      expenseId: mockExpenseId,
      userId: 'user-1',
      action: 'submitted' as const,
      comments: 'Submitted for approval',
      changes: { status: { from: 'draft', to: 'submitted' } },
      createdAt: new Date('2024-01-15T11:00:00Z'),
    };

    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    it('should throw error when expense not found', async () => {
      // Mock expense not found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(getExpenseHistory(mockExpenseId, mockTenantId)).rejects.toThrow(
        'Expense not found'
      );
    });

    it('should return empty array when no history entries exist', async () => {
      // Mock expense found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ id: mockExpenseId }]),
      }));

      // Mock history query - no entries
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => []),
      }));

      const result = await getExpenseHistory(mockExpenseId, mockTenantId);

      expect(result).toEqual([]);
    });

    it('should return history entries with user information', async () => {
      // Mock expense found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ id: mockExpenseId }]),
      }));

      // Mock history query with entries
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => [
          {
            history: mockHistoryEntry1,
            user: mockUser,
          },
          {
            history: mockHistoryEntry2,
            user: mockUser,
          },
          {
            history: mockHistoryEntry3,
            user: mockUser,
          },
        ]),
      }));

      const result = await getExpenseHistory(mockExpenseId, mockTenantId);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        ...mockHistoryEntry1,
        user: mockUser,
      });
      expect(result[1]).toEqual({
        ...mockHistoryEntry2,
        user: mockUser,
      });
      expect(result[2]).toEqual({
        ...mockHistoryEntry3,
        user: mockUser,
      });
    });

    it('should return history entries ordered by creation date (oldest first)', async () => {
      // Mock expense found
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ id: mockExpenseId }]),
      }));

      // Mock history query - verify orderBy is called with asc
      const orderByMock = jest.fn(() => [
        {
          history: mockHistoryEntry1,
          user: mockUser,
        },
        {
          history: mockHistoryEntry2,
          user: mockUser,
        },
      ]);

      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: orderByMock,
      }));

      await getExpenseHistory(mockExpenseId, mockTenantId);

      // Verify orderBy was called (the actual orderBy implementation is mocked)
      expect(orderByMock).toHaveBeenCalled();
    });
  });
});

describe('Expense Service - Function Exports', () => {
  it('should export all required functions', () => {
    expect(typeof createExpense).toBe('function');
    expect(typeof updateExpense).toBe('function');
    expect(typeof deleteExpense).toBe('function');
    expect(typeof submitExpense).toBe('function');
    expect(typeof getExpenseById).toBe('function');
    expect(typeof getExpenses).toBe('function');
    expect(typeof getPendingExpensesForApproval).toBe('function');
    expect(typeof getGlCodes).toBe('function');
    expect(typeof getExpenseHistory).toBe('function');
  });
});
