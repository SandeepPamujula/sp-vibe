/**
 * ExpenseDetail Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExpenseDetail } from './ExpenseDetail';

// Mock fetch globally
const mockFetch = (url: string) => {
  const expenseId = url.split('/').pop() || '';

  // Mock expense data
  const mockExpense = {
    success: true,
    data: {
      id: expenseId,
      tenantId: 'tenant-123',
      submittedBy: 'user-1',
      approvedBy: 'user-2',
      workflowId: 'workflow-1',
      currentStepId: 'step-1',
      workflowType: 'petty' as const,
      expenseDate: '2024-01-15',
      invoiceNumber: 'INV-001',
      vendorName: 'Office Supplies Co',
      amount: '1500.00',
      natureOfExpense: 'Office Supplies',
      glCodeId: 'gl-1',
      purpose: 'Purchase office supplies for Q1 2024',
      status: 'submitted' as const,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
      submitter: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      approver: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
      glCode: {
        id: 'gl-1',
        code: 'GL-100',
        description: 'Office Supplies',
      },
      workflow: {
        id: 'workflow-1',
        name: 'Petty Expense Workflow',
        code: 'petty' as const,
      },
      currentStep: {
        id: 'step-1',
        stepOrder: 1,
        name: 'Approver Review',
        approverRole: 'approver',
        isFinal: true,
      },
      approvals: [
        {
          id: 'approval-1',
          status: 'pending' as const,
          stepName: 'Approver Review',
          stepOrder: 1,
          approverName: null,
          comments: null,
          actedAt: null,
        },
      ],
      attachments: [
        {
          id: 'attachment-1',
          fileName: 'receipt.pdf',
          contentType: 'application/pdf',
          fileSize: 102400,
          uploadedAt: new Date('2024-01-15T10:15:00Z'),
        },
        {
          id: 'attachment-2',
          fileName: 'invoice.jpg',
          contentType: 'image/jpeg',
          fileSize: 204800,
          uploadedAt: new Date('2024-01-15T10:20:00Z'),
        },
      ],
      historyCount: 2,
    },
  };

  // Mock attachment download URL
  if (url.includes('/api/attachments/')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          downloadUrl: '/api/attachments/download-local?key=test-key',
        },
      }),
    });
  }

  return Promise.resolve({
    ok: true,
    json: async () => mockExpense,
  });
};

// Set up global fetch mock
if (typeof window !== 'undefined') {
  (window as any).fetch = mockFetch;
}

const meta: Meta<typeof ExpenseDetail> = {
  title: 'Organisms/ExpenseDetail',
  component: ExpenseDetail,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExpenseDetail>;

export const Default: Story = {
  args: {
    expenseId: 'expense-123',
  },
};

export const DraftStatus: Story = {
  args: {
    expenseId: 'expense-draft',
  },
};

export const ApprovedStatus: Story = {
  args: {
    expenseId: 'expense-approved',
  },
};

export const WithMultipleAttachments: Story = {
  args: {
    expenseId: 'expense-many-attachments',
  },
};

export const WithoutAttachments: Story = {
  args: {
    expenseId: 'expense-no-attachments',
  },
};
