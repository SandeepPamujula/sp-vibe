/**
 * DateInput Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { DateInput } from '../DateInput';

describe('DateInput', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(<DateInput label="Expense Date" />);
      expect(screen.getByLabelText('Expense Date')).toBeInTheDocument();
    });

    it('renders as date type input', () => {
      render(<DateInput label="Expense Date" />);
      expect(screen.getByLabelText('Expense Date')).toHaveAttribute('type', 'date');
    });

    it('renders with required indicator', () => {
      render(<DateInput label="Expense Date" isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<DateInput label="Expense Date" helperText="Select the date of expense" />);
      expect(screen.getByText('Select the date of expense')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<DateInput label="Expense Date" error="Date is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Date is required');
    });

    it('shows error instead of helper when both provided', () => {
      render(<DateInput label="Expense Date" helperText="Help" error="Error" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Error');
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-invalid when error present', () => {
      render(<DateInput label="Expense Date" error="Error" />);
      expect(screen.getByLabelText('Expense Date')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-invalid false when no error', () => {
      render(<DateInput label="Expense Date" />);
      expect(screen.getByLabelText('Expense Date')).toHaveAttribute('aria-invalid', 'false');
    });

    it('has aria-describedby linking to error', () => {
      render(<DateInput label="Expense Date" id="expense-date" error="Error" />);
      const input = screen.getByLabelText('Expense Date');
      expect(input).toHaveAttribute('aria-describedby', 'expense-date-error');
    });
  });

  describe('interaction', () => {
    it('calls onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<DateInput label="Expense Date" onChange={handleChange} />);

      fireEvent.change(screen.getByLabelText('Expense Date'), {
        target: { value: '2024-01-15' },
      });

      expect(handleChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<DateInput label="Expense Date" disabled />);
      expect(screen.getByLabelText('Expense Date')).toBeDisabled();
    });

    it('accepts min date constraint', () => {
      render(<DateInput label="Expense Date" min="2024-01-01" />);
      expect(screen.getByLabelText('Expense Date')).toHaveAttribute('min', '2024-01-01');
    });

    it('accepts max date constraint', () => {
      render(<DateInput label="Expense Date" max="2024-12-31" />);
      expect(screen.getByLabelText('Expense Date')).toHaveAttribute('max', '2024-12-31');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<DateInput label="Expense Date" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
