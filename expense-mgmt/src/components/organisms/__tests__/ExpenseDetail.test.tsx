/**
 * ExpenseDetail Component Tests
 */

/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExpenseDetail } from '../ExpenseDetail';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return {
    __esModule: true,
    default: MockLink,
  };
});

// Mock window.open
const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;

// Mock alert
global.alert = jest.fn();

// Mock fetch
global.fetch = jest.fn();

describe('ExpenseDetail', () => {
  const mockExpenseId = 'expense-123';

  const mockExpenseResponse = {
    success: true,
    data: {
      id: mockExpenseId,
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
      purpose: 'Purchase office supplies for Q1',
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    (global.alert as jest.Mock).mockClear();

    // Mock history API call for ExpenseAuditTrail component
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [],
          }),
        });
      }
      // For other URLs, return undefined to let individual tests override
      return undefined;
    });
  });

  describe('Loading State', () => {
    it('should render loading spinner initially', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message when API returns error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Expense not found',
          },
        }),
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Expense not found/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Back to Expenses')).toBeInTheDocument();
    });

    it('should render error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Expense Display', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: [],
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockExpenseResponse,
        });
      });
    });

    it('should render expense details after loading', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Expense Details')).toBeInTheDocument();
      });

      expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      expect(screen.getByText('₹1,500.00')).toBeInTheDocument();
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    it('should display formatted expense date', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
      });
    });

    it('should display status badge', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Submitted')).toBeInTheDocument();
      });
    });

    it('should display GL code information', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('GL-100 - Office Supplies')).toBeInTheDocument();
      });
    });

    it('should display workflow information', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Petty Expense Workflow')).toBeInTheDocument();
      });
    });

    it('should display purpose when available', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Purchase office supplies for Q1')).toBeInTheDocument();
      });
    });

    it('should not display invoice number when null', async () => {
      const responseWithoutInvoice = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          invoiceNumber: null,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseWithoutInvoice,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      expect(screen.queryByText('Invoice Number')).not.toBeInTheDocument();
    });
  });

  describe('People Section', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockExpenseResponse,
      });
    });

    it('should display submitter information', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should display approver information when available', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    it('should not display approver section when approver is null', async () => {
      const responseWithoutApprover = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          approver: null,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseWithoutApprover,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.queryByText('Approved By')).not.toBeInTheDocument();
    });
  });

  describe('Approvals Section', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockExpenseResponse,
      });
    });

    it('should display approval history when available', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Approval History')).toBeInTheDocument();
      });

      expect(screen.getByText('Approver Review')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should not display approvals section when empty', async () => {
      const responseWithoutApprovals = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          approvals: [],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseWithoutApprovals,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      expect(screen.queryByText('Approval History')).not.toBeInTheDocument();
    });

    it('should display approval comments when available', async () => {
      const responseWithComments = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          approvals: [
            {
              id: 'approval-1',
              status: 'approved' as const,
              stepName: 'Approver Review',
              stepOrder: 1,
              approverName: 'Jane Smith',
              comments: 'Approved for payment',
              actedAt: new Date('2024-01-15T11:00:00Z'),
            },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseWithComments,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Approved for payment')).toBeInTheDocument();
      });

      expect(screen.getByText('Approver: Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Attachments Section', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockExpenseResponse,
      });
    });

    it('should display attachments when available', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Attachments')).toBeInTheDocument();
      });

      expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
      expect(screen.getByText('invoice.jpg')).toBeInTheDocument();
    });

    it('should display file sizes', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('100 KB')).toBeInTheDocument();
      });

      expect(screen.getByText('200 KB')).toBeInTheDocument();
    });

    it('should not display attachments section when empty', async () => {
      const responseWithoutAttachments = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          attachments: [],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseWithoutAttachments,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      expect(screen.queryByText('Attachments')).not.toBeInTheDocument();
    });

    it('should handle attachment download', async () => {
      const user = userEvent.setup();

      // Mock all API calls: expense detail, history, and attachment download URL
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: [],
            }),
          });
        }
        if (url.includes('/attachments/')) {
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
        // Expense detail API
        return Promise.resolve({
          ok: true,
          json: async () => mockExpenseResponse,
        });
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
      });

      const downloadButtons = screen.getAllByText('Download');
      expect(downloadButtons.length).toBeGreaterThan(0);
      await user.click(downloadButtons[0]!);

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          '/api/attachments/download-local?key=test-key',
          '_blank'
        );
      });
    });

    it('should show loading state when downloading attachment', async () => {
      const user = userEvent.setup();

      type AttachmentResponse = {
        success: boolean;
        data: { downloadUrl: string };
      };

      const attachmentResponse: AttachmentResponse = {
        success: true,
        data: {
          downloadUrl: '/api/attachments/download-local?key=test-key',
        },
      };

      let resolveAttachment: ((value: AttachmentResponse) => void) | undefined;
      const attachmentFetchPromise = new Promise<AttachmentResponse>((resolve) => {
        resolveAttachment = resolve;
      });

      // Mock all API calls: expense detail, history, and slow attachment download URL
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: [],
            }),
          });
        }
        if (url.includes('/attachments/')) {
          return attachmentFetchPromise.then((value) => ({
            ok: true,
            json: async () => value,
          }));
        }
        // Expense detail API
        return Promise.resolve({
          ok: true,
          json: async () => mockExpenseResponse,
        });
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
      });

      const downloadButtons = screen.getAllByText('Download');
      expect(downloadButtons.length).toBeGreaterThan(0);
      const firstButton = downloadButtons[0]!;

      // Click the button to start download
      await user.click(firstButton);

      // Button should be disabled during download (before the promise resolves)
      await waitFor(() => {
        expect(firstButton).toBeDisabled();
      });

      // Resolve the attachment fetch promise
      if (resolveAttachment) {
        resolveAttachment(attachmentResponse);
      }

      // Wait for download to complete
      await waitFor(() => {
        expect(firstButton).not.toBeDisabled();
      });
    });
  });

  describe('Metadata', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockExpenseResponse,
      });
    });

    it('should display created and updated timestamps', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Created:/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Last Updated:/i)).toBeInTheDocument();
    });

    it('should display history count when greater than 0', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('History Entries: 2')).toBeInTheDocument();
      });
    });

    it('should not display history count when 0', async () => {
      const responseWithoutHistory = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          historyCount: 0,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseWithoutHistory,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      expect(screen.queryByText(/History Entries:/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockExpenseResponse,
      });
    });

    it('should have back button linking to expenses list', async () => {
      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });

      const backLink = screen.getByText('Back').closest('a');
      expect(backLink).toHaveAttribute('href', '/expenses');
    });
  });

  describe('Status Badges', () => {
    it('should display correct badge variant for draft status', async () => {
      const draftResponse = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          status: 'draft' as const,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => draftResponse,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Draft')).toBeInTheDocument();
      });
    });

    it('should display correct badge variant for approved status', async () => {
      const approvedResponse = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          status: 'approved' as const,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => approvedResponse,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Approved')).toBeInTheDocument();
      });
    });

    it('should display correct badge variant for rejected status', async () => {
      const rejectedResponse = {
        ...mockExpenseResponse,
        data: {
          ...mockExpenseResponse.data,
          status: 'rejected' as const,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => rejectedResponse,
      });

      render(<ExpenseDetail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Rejected')).toBeInTheDocument();
      });
    });
  });
});
