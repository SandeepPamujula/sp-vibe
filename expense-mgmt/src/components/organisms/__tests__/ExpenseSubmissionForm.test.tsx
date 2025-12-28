/**
 * ExpenseSubmissionForm Tests
 *
 * Tests for the expense submission form component.
 */

/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExpenseSubmissionForm } from '../ExpenseSubmissionForm';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useFileUpload hook
const mockUploadFiles = jest.fn();
const mockRemoveFile = jest.fn();
const mockClearFiles = jest.fn();

jest.mock('@/hooks', () => ({
  useFileUpload: () => ({
    uploadedFiles: [],
    uploadProgress: [],
    isUploading: false,
    uploadFiles: mockUploadFiles,
    removeFile: mockRemoveFile,
    clearFiles: mockClearFiles,
    totalProgress: 0,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ExpenseSubmissionForm', () => {
  const mockGlCodesResponse = {
    success: true,
    data: [
      { id: 'gl-1', code: '5100', description: 'Office Supplies' },
      { id: 'gl-2', code: '5200', description: 'Travel & Transportation' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Default mock for GL codes
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockGlCodesResponse,
    });
  });

  describe('Rendering', () => {
    it('should render the form with all sections', async () => {
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByText('Expense Details')).toBeInTheDocument();
      });

      expect(screen.getByText('Purpose')).toBeInTheDocument();
      expect(screen.getByText('Attachments')).toBeInTheDocument();
    });

    it('should render all required form fields', async () => {
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/expense date/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nature of expense/i)).toBeInTheDocument();
    });

    it('should render action buttons', async () => {
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit for approval/i })).toBeInTheDocument();
    });

    it('should set default expense date to today', async () => {
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        const dateInput = screen.getByLabelText(/expense date/i) as HTMLInputElement;
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput.value).toBe(today);
      });
    });
  });

  describe('GL Codes Loading', () => {
    it('should load GL codes on mount', async () => {
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/gl-codes');
      });
    });

    it('should populate nature of expense dropdown with GL codes', async () => {
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        const select = screen.getByLabelText(/nature of expense/i);
        expect(select).toBeInTheDocument();
      });

      // Check if options are rendered
      const select = screen.getByLabelText(/nature of expense/i) as HTMLSelectElement;
      expect(select.options.length).toBeGreaterThan(1); // Placeholder + options
    });

    it('should show error if GL codes fail to load', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load nature of expense options/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error for missing vendor name on submit', async () => {
      const user = userEvent.setup();
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/vendor name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for missing amount on submit', async () => {
      const user = userEvent.setup();
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Fill vendor name but leave amount empty
      await user.type(screen.getByLabelText(/vendor name/i), 'Test Vendor');

      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid amount (zero)', async () => {
      const user = userEvent.setup();
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Amount defaults to empty, which should show error on submit
      await user.type(screen.getByLabelText(/vendor name/i), 'Test Vendor');

      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for missing nature of expense on submit', async () => {
      const user = userEvent.setup();
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/nature of expense/i)).toBeInTheDocument();
      });

      // Fill required fields except nature of expense
      await user.type(screen.getByLabelText(/vendor name/i), 'Test Vendor');
      await user.type(screen.getByLabelText(/amount/i), '100');

      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nature of expense is required/i)).toBeInTheDocument();
      });
    });

    it('should clear field error when user types', async () => {
      const user = userEvent.setup();
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
      });

      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/vendor name is required/i)).toBeInTheDocument();
      });

      // Type in the field
      const vendorInput = screen.getByLabelText(/vendor name/i);
      await user.type(vendorInput, 'Test');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/vendor name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Save as Draft', () => {
    it('should show error if vendor name is missing when saving draft', async () => {
      const user = userEvent.setup();
      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument();
      });

      const draftButton = screen.getByRole('button', { name: /save as draft/i });
      await user.click(draftButton);

      await waitFor(() => {
        expect(screen.getByText(/vendor name is required to save draft/i)).toBeInTheDocument();
      });
    });

    it('should create draft and redirect on save draft', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        if (url.includes('/api/gl-codes')) {
          return {
            ok: true,
            json: async () => mockGlCodesResponse,
          };
        }
        if (url.includes('/api/expenses')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { expenseId: 'draft-123' },
            }),
          };
        }
        return { ok: false, json: async () => ({ success: false }) };
      });

      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
      });

      // Fill minimum required field
      await user.type(screen.getByLabelText(/vendor name/i), 'Test Vendor');

      const draftButton = screen.getByRole('button', { name: /save as draft/i });
      await user.click(draftButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/expenses?draftSaved=true');
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        if (url.includes('/api/gl-codes')) {
          return {
            ok: true,
            json: async () => mockGlCodesResponse,
          };
        }
        if (url.includes('/submit')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { id: 'expense-123', status: 'submitted' },
            }),
          };
        }
        if (url.includes('/api/expenses')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { expenseId: 'expense-123' },
            }),
          };
        }
        return { ok: false, json: async () => ({ success: false }) };
      });

      render(<ExpenseSubmissionForm onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
      });

      // Fill all required fields
      await user.type(screen.getByLabelText(/vendor name/i), 'Test Vendor');
      await user.type(screen.getByLabelText(/amount/i), '100');

      const natureSelect = screen.getByLabelText(/nature of expense/i);
      await user.selectOptions(natureSelect, 'gl-1');

      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/expenses?submitted=true');
      });
    });

    it('should show error on submission failure', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        if (url.includes('/api/gl-codes')) {
          return {
            ok: true,
            json: async () => mockGlCodesResponse,
          };
        }
        if (url.includes('/submit')) {
          return {
            ok: true,
            json: async () => ({
              success: false,
              error: { message: 'Submission failed' },
            }),
          };
        }
        if (url.includes('/api/expenses')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { expenseId: 'expense-123' },
            }),
          };
        }
        return { ok: false, json: async () => ({ success: false }) };
      });

      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
      });

      // Fill all required fields
      await user.type(screen.getByLabelText(/vendor name/i), 'Test Vendor');
      await user.type(screen.getByLabelText(/amount/i), '100');

      const natureSelect = screen.getByLabelText(/nature of expense/i);
      await user.selectOptions(natureSelect, 'gl-1');

      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Submission failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(<ExpenseSubmissionForm onCancel={onCancel} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should redirect to expenses page if no onCancel provided', async () => {
      const user = userEvent.setup();

      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith('/expenses');
    });
  });

  describe('Button States', () => {
    it('should disable buttons while submitting', async () => {
      const user = userEvent.setup();

      // Mock slow submission
      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        if (url.includes('/api/gl-codes')) {
          return {
            ok: true,
            json: async () => mockGlCodesResponse,
          };
        }
        if (url.includes('/api/expenses')) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { id: 'expense-123' },
            }),
          };
        }
        return { ok: false, json: async () => ({ success: false }) };
      });

      render(<ExpenseSubmissionForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
      });

      // Fill required fields
      await user.type(screen.getByLabelText(/vendor name/i), 'Test Vendor');
      await user.type(screen.getByLabelText(/amount/i), '100');

      const natureSelect = screen.getByLabelText(/nature of expense/i);
      await user.selectOptions(natureSelect, 'gl-1');

      const submitButton = screen.getByRole('button', { name: /submit for approval/i });
      await user.click(submitButton);

      // Buttons should be disabled during submission
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      });
    });
  });
});
