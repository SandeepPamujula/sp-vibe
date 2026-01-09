/**
 * ExpenseListFilters Component Tests
 */

/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExpenseListFilters } from '../ExpenseListFilters';

// Mock next/navigation
const mockPush = jest.fn();
let mockSearchParamsValue = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParamsValue,
}));

describe('ExpenseListFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockSearchParamsValue = new URLSearchParams();
  });

  describe('Rendering', () => {
    it('should render all filter controls', () => {
      render(<ExpenseListFilters />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/workflow type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    it('should not show Clear All button when no filters are active', () => {
      render(<ExpenseListFilters />);
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should show Clear All button when filters are active', () => {
      mockSearchParamsValue.set('status', 'draft');
      render(<ExpenseListFilters />);
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('Filter Interactions', () => {
    it('should update search filter on input change', async () => {
      const user = userEvent.setup();
      render(<ExpenseListFilters />);

      const searchInput = screen.getByLabelText(/search/i);
      await user.type(searchInput, 'test vendor');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
      expect(lastCall).toContain('search=test+vendor');
      expect(lastCall).toContain('page=1');
    });

    it('should update status filter on select change', async () => {
      const user = userEvent.setup();
      render(<ExpenseListFilters />);

      const statusSelect = screen.getByLabelText(/status/i);
      await user.selectOptions(statusSelect, 'submitted');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
      expect(lastCall).toContain('status=submitted');
      expect(lastCall).toContain('page=1');
    });

    it('should update workflow type filter on select change', async () => {
      const user = userEvent.setup();
      render(<ExpenseListFilters />);

      const workflowSelect = screen.getByLabelText(/workflow type/i);
      await user.selectOptions(workflowSelect, 'petty');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
      expect(lastCall).toContain('workflowType=petty');
      expect(lastCall).toContain('page=1');
    });

    it('should update start date filter on date input change', async () => {
      const user = userEvent.setup();
      render(<ExpenseListFilters />);

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-01');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
      expect(lastCall).toContain('startDate=2024-01-01');
      expect(lastCall).toContain('page=1');
    });

    it('should update end date filter on date input change', async () => {
      const user = userEvent.setup();
      render(<ExpenseListFilters />);

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2024-12-31');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
      expect(lastCall).toContain('endDate=2024-12-31');
      expect(lastCall).toContain('page=1');
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters when Clear All is clicked', async () => {
      const user = userEvent.setup();
      mockSearchParamsValue.set('status', 'draft');
      mockSearchParamsValue.set('workflowType', 'petty');
      mockSearchParamsValue.set('search', 'test');

      render(<ExpenseListFilters />);

      const clearButton = screen.getByText('Clear All');
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/expenses?page=1');
      });
    });

    it('should call onFiltersChange callback when filters change', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();

      render(<ExpenseListFilters onFiltersChange={onFiltersChange} />);

      const searchInput = screen.getByLabelText(/search/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalled();
      });

      const lastCall = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
      expect(lastCall.search).toBe('test');
    });
  });

  describe('Initial State from URL', () => {
    it('should initialize filters from URL search params', () => {
      mockSearchParamsValue.set('status', 'approved');
      mockSearchParamsValue.set('workflowType', 'petty');
      mockSearchParamsValue.set('search', 'vendor');
      mockSearchParamsValue.set('startDate', '2024-01-01');
      mockSearchParamsValue.set('endDate', '2024-12-31');

      render(<ExpenseListFilters />);

      expect(screen.getByLabelText(/status/i)).toHaveValue('approved');
      expect(screen.getByLabelText(/workflow type/i)).toHaveValue('petty');
      expect(screen.getByLabelText(/search/i)).toHaveValue('vendor');
      expect(screen.getByLabelText(/start date/i)).toHaveValue('2024-01-01');
      expect(screen.getByLabelText(/end date/i)).toHaveValue('2024-12-31');
    });
  });
});
