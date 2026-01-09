/**
 * ExpenseAuditTrail Component Tests
 */

/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';

import { ExpenseAuditTrail } from '../ExpenseAuditTrail';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ExpenseAuditTrail', () => {
  const mockExpenseId = 'expense-123';

  const mockHistoryResponse = {
    success: true,
    data: [
      {
        id: 'history-1',
        expenseId: mockExpenseId,
        userId: 'user-1',
        action: 'created',
        comments: 'Expense created',
        changes: { initial: true },
        createdAt: new Date('2024-01-15T10:00:00Z'),
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
      {
        id: 'history-2',
        expenseId: mockExpenseId,
        userId: 'user-1',
        action: 'updated',
        comments: 'Expense updated',
        changes: { vendorName: { from: 'Old Vendor', to: 'New Vendor' } },
        createdAt: new Date('2024-01-15T10:30:00Z'),
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
      {
        id: 'history-3',
        expenseId: mockExpenseId,
        userId: 'user-1',
        action: 'submitted',
        comments: 'Submitted for approval',
        changes: { status: { from: 'draft', to: 'submitted' } },
        createdAt: new Date('2024-01-15T11:00:00Z'),
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves to keep loading state
          })
      );

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      // Check for spinner SVG element
      const spinner = document.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(mockFetch).toHaveBeenCalledWith(`/api/expenses/${mockExpenseId}/history`);
    });
  });

  describe('Error State', () => {
    it('should display error message when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(
        () => {
          expect(screen.getByText(/Error:/i)).toBeInTheDocument();
          expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should display error message when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Expense not found',
          },
        }),
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Expense not found/i)).toBeInTheDocument();
      });
    });

    it('should display generic error when error message is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
          },
        }),
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no history entries exist', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText(/No audit trail entries found/i)).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith(`/api/expenses/${mockExpenseId}/history`);
    });
  });

  describe('History Display', () => {
    it('should display all history entries', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockHistoryResponse,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Updated')).toBeInTheDocument();
        expect(screen.getByText('Submitted')).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should display user information for each entry', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockHistoryResponse,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        const userNames = screen.getAllByText('John Doe');
        expect(userNames.length).toBe(3); // All 3 entries have same user

        const userEmails = screen.getAllByText('john.doe@example.com');
        expect(userEmails.length).toBe(3);
      });
    });

    it('should display comments for each entry', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockHistoryResponse,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Expense created')).toBeInTheDocument();
        expect(screen.getByText('Expense updated')).toBeInTheDocument();
        expect(screen.getByText('Submitted for approval')).toBeInTheDocument();
      });
    });

    it('should display formatted changes for entries with changes', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockHistoryResponse,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        // Check for formatted changes
        expect(screen.getByText(/vendorName: Old Vendor → New Vendor/i)).toBeInTheDocument();
        expect(screen.getByText(/status: draft → submitted/i)).toBeInTheDocument();
      });
    });

    it('should display timestamps for each entry', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockHistoryResponse,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        // Check for date formatting (should contain month abbreviations)
        const timestamps = screen.getAllByText(/Jan/i);
        expect(timestamps.length).toBe(3); // All 3 entries have January dates
      });
    });

    it('should handle entries without comments', async () => {
      const responseWithoutComments = {
        success: true,
        data: [
          {
            id: 'history-1',
            expenseId: mockExpenseId,
            userId: 'user-1',
            action: 'created',
            comments: null,
            changes: null,
            createdAt: new Date('2024-01-15T10:00:00Z'),
            user: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => responseWithoutComments,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Should not display comments section when null
      expect(screen.queryByText('Expense created')).not.toBeInTheDocument();
    });
  });

  describe('Action Badges', () => {
    it('should display correct badge variants for different actions', async () => {
      const responseWithAllActions = {
        success: true,
        data: [
          {
            id: 'history-1',
            expenseId: mockExpenseId,
            userId: 'user-1',
            action: 'created',
            comments: null,
            changes: null,
            createdAt: new Date('2024-01-15T10:00:00Z'),
            user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
          },
          {
            id: 'history-2',
            expenseId: mockExpenseId,
            userId: 'user-1',
            action: 'submitted',
            comments: null,
            changes: null,
            createdAt: new Date('2024-01-15T11:00:00Z'),
            user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
          },
          {
            id: 'history-3',
            expenseId: mockExpenseId,
            userId: 'user-2',
            action: 'approved',
            comments: null,
            changes: null,
            createdAt: new Date('2024-01-15T12:00:00Z'),
            user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
          },
          {
            id: 'history-4',
            expenseId: mockExpenseId,
            userId: 'user-2',
            action: 'rejected',
            comments: null,
            changes: null,
            createdAt: new Date('2024-01-15T13:00:00Z'),
            user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
          },
          {
            id: 'history-5',
            expenseId: mockExpenseId,
            userId: 'user-1',
            action: 'updated',
            comments: null,
            changes: null,
            createdAt: new Date('2024-01-15T14:00:00Z'),
            user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => responseWithAllActions,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Submitted')).toBeInTheDocument();
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();
        expect(screen.getByText('Updated')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch history from correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockHistoryResponse,
      });

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`/api/expenses/${mockExpenseId}/history`);
      });
    });

    it('should refetch when expenseId changes', async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      const { rerender } = render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(`/api/expenses/${mockExpenseId}/history`);
      });

      rerender(<ExpenseAuditTrail expenseId="expense-456" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith('/api/expenses/expense-456/history');
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

      render(<ExpenseAuditTrail expenseId={mockExpenseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
