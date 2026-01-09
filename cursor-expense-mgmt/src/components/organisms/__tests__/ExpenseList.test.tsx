/**
 * ExpenseList Component Tests
 */

/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExpenseList } from '../ExpenseList';

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

// Mock fetch
global.fetch = jest.fn();

describe('ExpenseList', () => {
  const mockExpensesResponse = {
    success: true,
    data: [
      {
        id: 'exp-1',
        expenseDate: '2024-01-15',
        vendorName: 'Office Supplies Co',
        amount: '1500.00',
        natureOfExpense: 'Office Supplies',
        status: 'submitted',
        workflowType: 'petty',
        submitterName: 'John Doe',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'exp-2',
        expenseDate: '2024-01-20',
        vendorName: 'Travel Agency',
        amount: '5000.00',
        natureOfExpense: 'Travel & Transportation',
        status: 'approved',
        workflowType: 'petty',
        submitterName: 'Jane Smith',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-21'),
      },
      {
        id: 'exp-3',
        expenseDate: '2024-01-25',
        vendorName: 'Vendor Inc',
        amount: '2500.00',
        natureOfExpense: null,
        status: 'draft',
        workflowType: 'petty',
        submitterName: 'Bob Johnson',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
      },
    ],
    meta: {
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockExpensesResponse,
    });
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(<ExpenseList />);
      // Check for spinner by its className or SVG element
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render expense list after loading', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      expect(screen.getByText('Travel Agency')).toBeInTheDocument();
      expect(screen.getByText('Vendor Inc')).toBeInTheDocument();
    });

    it('should render results summary', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText(/showing 3 of 3 expense/i)).toBeInTheDocument();
      });
    });

    it('should render table headers', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      // Check table headers using more specific queries
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Vendor' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Nature of Expense' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Submitted By' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
    });
  });

  describe('Expense Data Display', () => {
    it('should format currency correctly', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('₹1,500.00')).toBeInTheDocument();
      });

      expect(screen.getByText('₹5,000.00')).toBeInTheDocument();
      expect(screen.getByText('₹2,500.00')).toBeInTheDocument();
    });

    it('should format dates correctly', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
      });

      expect(screen.getByText('20 Jan 2024')).toBeInTheDocument();
      expect(screen.getByText('25 Jan 2024')).toBeInTheDocument();
    });

    it('should display status badges', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      // Status badges are rendered in table rows, check within table context
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check for status badges within the table
      const submittedBadge = screen.getAllByText('Submitted').find((el) => table.contains(el));
      expect(submittedBadge).toBeInTheDocument();

      const approvedBadge = screen.getAllByText('Approved').find((el) => table.contains(el));
      expect(approvedBadge).toBeInTheDocument();

      const draftBadge = screen.getAllByText('Draft').find((el) => table.contains(el));
      expect(draftBadge).toBeInTheDocument();
    });

    it('should display "Not specified" for null nature of expense', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText(/not specified/i)).toBeInTheDocument();
      });
    });

    it('should display submitter names', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  describe('View Links', () => {
    it('should render view links for each expense', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        const viewLinks = screen.getAllByText('View');
        expect(viewLinks).toHaveLength(3);
      });

      const viewLinks = screen.getAllByText('View');
      expect(viewLinks[0]?.closest('a')).toHaveAttribute('href', '/expenses/exp-1');
      expect(viewLinks[1]?.closest('a')).toHaveAttribute('href', '/expenses/exp-2');
      expect(viewLinks[2]?.closest('a')).toHaveAttribute('href', '/expenses/exp-3');
    });
  });

  describe('Pagination', () => {
    it('should not show pagination when totalPages is 1', async () => {
      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
      });

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('should show pagination when totalPages > 1', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockExpensesResponse,
          meta: {
            page: 1,
            limit: 10,
            total: 50,
            totalPages: 5,
          },
        }),
      });

      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should disable Previous button on first page', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockExpensesResponse,
          meta: {
            page: 1,
            limit: 10,
            total: 50,
            totalPages: 5,
          },
        }),
      });

      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', async () => {
      const user = userEvent.setup();
      const mockFetch = global.fetch as jest.Mock;

      // Mock responses for navigating to last page
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockExpensesResponse,
            meta: { page: 1, limit: 10, total: 50, totalPages: 5 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockExpensesResponse,
            meta: { page: 2, limit: 10, total: 50, totalPages: 5 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockExpensesResponse,
            meta: { page: 3, limit: 10, total: 50, totalPages: 5 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockExpensesResponse,
            meta: { page: 4, limit: 10, total: 50, totalPages: 5 },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockExpensesResponse,
            meta: { page: 5, limit: 10, total: 50, totalPages: 5 },
          }),
        });

      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      // Navigate through pages to reach last page
      let nextButton = screen.getByText('Next');

      // Click Next 4 times to reach page 5 (last page)
      for (let i = 1; i <= 4; i++) {
        await user.click(nextButton);
        await waitFor(() => {
          expect(screen.getByText(`Page ${i + 1} of 5`)).toBeInTheDocument();
        });
        if (i < 4) {
          nextButton = screen.getByText('Next');
        }
      }

      // Next button should be disabled on last page
      const nextButton3 = screen.getByText('Next');
      expect(nextButton3).toBeDisabled();
    });

    it('should change page when Next is clicked', async () => {
      const user = userEvent.setup();
      const mockFetch = global.fetch as jest.Mock;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockExpensesResponse,
          meta: {
            page: 1,
            limit: 10,
            total: 50,
            totalPages: 3,
          },
        }),
      });

      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      // Mock the second fetch call for page 2
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockExpensesResponse,
          meta: {
            page: 2,
            limit: 10,
            total: 50,
            totalPages: 3,
          },
        }),
      });

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        const fetchCalls = mockFetch.mock.calls;
        const page2Call = fetchCalls.find((call) => call[0].includes('page=2'));
        expect(page2Call).toBeDefined();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no expenses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        }),
      });

      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText('No expenses found.')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/try adjusting your filters or submit a new expense/i)
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch expenses',
          },
        }),
      });

      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/failed to fetch expenses/i)).toBeInTheDocument();
    });

    it('should display error message on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ExpenseList />);

      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filter Integration', () => {
    it('should fetch expenses with initial filters', async () => {
      render(
        <ExpenseList
          initialFilters={{
            status: 'submitted',
            workflowType: 'petty',
            search: 'test',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          }}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('status=submitted');
      expect(fetchCall).toContain('workflowType=petty');
      expect(fetchCall).toContain('search=test');
      expect(fetchCall).toContain('startDate=2024-01-01');
      expect(fetchCall).toContain('endDate=2024-12-31');
    });
  });
});
