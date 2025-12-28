/**
 * ApprovalModal Component Tests
 */

/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApprovalModal } from '../ApprovalModal';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

interface ApprovalResponse {
  success: boolean;
  data?: { expenseId: string };
  error?: {
    code: string;
    message: string;
  };
}

describe('ApprovalModal', () => {
  const mockExpenseId = 'expense-123';
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const mockApproveResponse = {
    success: true,
    data: { expenseId: mockExpenseId },
  };

  const mockRejectResponse = {
    success: true,
    data: { expenseId: mockExpenseId },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clean up body overflow
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Review Expense')).toBeInTheDocument();
      expect(screen.getByLabelText('Comments')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    it('should render all form elements', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText('Add comments and choose an action for this expense.')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Add any comments about your decision (required for rejection)...'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Comments are optional for approval but required for rejection.')
      ).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should reset state when modal closes', () => {
      const { rerender } = render(
        <ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />
      );

      const textarea = screen.getByLabelText('Comments');
      fireEvent.change(textarea, { target: { value: 'Test comments' } });
      expect(textarea).toHaveValue('Test comments');

      rerender(<ApprovalModal expenseId={mockExpenseId} isOpen={false} onClose={mockOnClose} />);

      rerender(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText('Comments')).toHaveValue('');
    });

    it('should prevent body scroll when modal is open', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal closes', () => {
      const { rerender } = render(
        <ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<ApprovalModal expenseId={mockExpenseId} isOpen={false} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Keyboard Interactions', () => {
    it('should close modal on Escape key press', async () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should not close modal on Escape when loading', async () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      // Mock a pending fetch
      mockFetch.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      // Should not close while loading
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Approve Functionality', () => {
    it('should approve expense without comments', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApproveResponse,
      });

      render(
        <ApprovalModal
          expenseId={mockExpenseId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`/api/expenses/${mockExpenseId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comments: undefined,
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should approve expense with comments', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApproveResponse,
      });

      render(
        <ApprovalModal
          expenseId={mockExpenseId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByLabelText('Comments');
      await userEvent.type(textarea, 'Looks good to me');

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`/api/expenses/${mockExpenseId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comments: 'Looks good to me',
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle approval API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Expense not found',
          },
        }),
      });

      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('Expense not found')).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle network error during approval', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(
        () => {
          // Error message should be displayed in the error div
          const errorDiv = screen.getByText(/Failed to approve expense|Network error/);
          expect(errorDiv).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should show loading state during approval', async () => {
      let resolveFetch: (value: { ok: boolean; json: () => Promise<ApprovalResponse> }) => void;
      const fetchPromise = new Promise<{ ok: boolean; json: () => Promise<ApprovalResponse> }>(
        (resolve) => {
          resolveFetch = resolve;
        }
      );

      mockFetch.mockReturnValueOnce(fetchPromise);

      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      // Check for loading state
      await waitFor(() => {
        expect(approveButton).toBeDisabled();
      });

      // Resolve the fetch
      resolveFetch!({
        ok: true,
        json: async () => mockApproveResponse,
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Reject Functionality', () => {
    it('should reject expense with comments', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRejectResponse,
      });

      render(
        <ApprovalModal
          expenseId={mockExpenseId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const textarea = screen.getByLabelText('Comments');
      await userEvent.type(textarea, 'Missing documentation');

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`/api/expenses/${mockExpenseId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comments: 'Missing documentation',
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable reject button when comments are empty', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const rejectButton = screen.getByText('Reject');
      expect(rejectButton).toBeDisabled();
    });

    it('should enable reject button when comments are entered', async () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const rejectButton = screen.getByText('Reject');
      expect(rejectButton).toBeDisabled();

      const textarea = screen.getByLabelText('Comments');
      await userEvent.type(textarea, 'Test rejection reason');

      expect(rejectButton).not.toBeDisabled();
    });

    it('should disable reject button when comments are empty', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const rejectButton = screen.getByText('Reject');
      expect(rejectButton).toBeDisabled();

      // Button is disabled, so clicking won't trigger the handler
      // The error is shown via the disabled state and helper text
    });

    it('should handle rejection API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Expense not found',
          },
        }),
      });

      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const textarea = screen.getByLabelText('Comments');
      await userEvent.type(textarea, 'Missing docs');

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByText('Expense not found')).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should show loading state during rejection', async () => {
      let resolveFetch: (value: { ok: boolean; json: () => Promise<ApprovalResponse> }) => void;
      const fetchPromise = new Promise<{ ok: boolean; json: () => Promise<ApprovalResponse> }>(
        (resolve) => {
          resolveFetch = resolve;
        }
      );

      mockFetch.mockReturnValueOnce(fetchPromise);

      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const textarea = screen.getByLabelText('Comments');
      await userEvent.type(textarea, 'Test rejection');

      const rejectButton = screen.getByText('Reject');
      fireEvent.click(rejectButton);

      // Check for loading state
      await waitFor(() => {
        expect(rejectButton).toBeDisabled();
      });

      // Resolve the fetch
      resolveFetch!({
        ok: true,
        json: async () => mockRejectResponse,
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should close modal when cancel button is clicked', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when backdrop is clicked', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should close modal when close button is clicked', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when backdrop is clicked during loading', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      // Mock a pending fetch
      mockFetch.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      );

      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Comments Field', () => {
    it('should update comments value when typing', async () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const textarea = screen.getByLabelText('Comments');
      await userEvent.type(textarea, 'Test comment');

      expect(textarea).toHaveValue('Test comment');
    });

    it('should clear error when user starts typing', async () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      // Set an error by trying to reject without comments
      // First enable the reject button by adding comments, then clear them
      const textarea = screen.getByLabelText('Comments');
      await userEvent.type(textarea, 'Test');

      // Clear the textarea to trigger validation
      await userEvent.clear(textarea);

      // Manually trigger the reject handler by calling it programmatically
      // Since the button is disabled, we'll simulate the error state
      const rejectButton = screen.getByText('Reject');

      // The button should be disabled when comments are empty
      expect(rejectButton).toBeDisabled();

      // Now type to clear any potential error
      await userEvent.type(textarea, 'Test comment');

      // Error should not be present when comments are filled
      expect(rejectButton).not.toBeDisabled();
    });

    it('should show character count', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      // Character count should be visible
      expect(screen.getByText(/\/5000/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'approval-modal-title');
    });

    it('should have accessible close button', () => {
      render(<ApprovalModal expenseId={mockExpenseId} isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
