/**
 * CurrencyInput Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { CurrencyInput } from '../CurrencyInput';

describe('CurrencyInput', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(<CurrencyInput label="Amount" />);
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });

    it('renders with currency symbol', () => {
      render(<CurrencyInput label="Amount" currency="₹" />);
      expect(screen.getByText('₹')).toBeInTheDocument();
    });

    it('renders with custom currency symbol', () => {
      render(<CurrencyInput label="Amount" currency="$" />);
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
      render(<CurrencyInput label="Amount" isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<CurrencyInput label="Amount" helperText="Enter expense amount" />);
      expect(screen.getByText('Enter expense amount')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<CurrencyInput label="Amount" error="Amount is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Amount is required');
    });

    it('shows placeholder', () => {
      render(<CurrencyInput label="Amount" />);
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });
  });

  describe('formatting', () => {
    it('formats number with thousand separators', () => {
      render(<CurrencyInput label="Amount" value="1234567" />);
      expect(screen.getByLabelText('Amount')).toHaveValue('1,234,567');
    });

    it('formats decimal numbers correctly', () => {
      render(<CurrencyInput label="Amount" value="1234.56" />);
      expect(screen.getByLabelText('Amount')).toHaveValue('1,234.56');
    });

    it('limits decimal places to 2', () => {
      const handleChange = jest.fn();
      render(<CurrencyInput label="Amount" onChange={handleChange} />);

      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: '100.999' },
      });

      // Should truncate to 2 decimal places
      expect(screen.getByLabelText('Amount')).toHaveValue('100.99');
    });
  });

  describe('interaction', () => {
    it('calls onChange with cleaned value (no commas)', () => {
      const handleChange = jest.fn();
      render(<CurrencyInput label="Amount" onChange={handleChange} />);

      fireEvent.change(screen.getByLabelText('Amount'), {
        target: { value: '1,234.56' },
      });

      expect(handleChange).toHaveBeenCalled();
      // The onChange should receive the cleaned value without commas
      const eventArg = handleChange.mock.calls[0][0];
      expect(eventArg.target.value).toBe('1234.56');
    });

    it('rejects non-numeric input', () => {
      render(<CurrencyInput label="Amount" />);
      const input = screen.getByLabelText('Amount');

      fireEvent.change(input, { target: { value: 'abc' } });

      // Should not update with non-numeric value
      expect(input).toHaveValue('');
    });

    it('allows empty value', () => {
      render(<CurrencyInput label="Amount" />);
      const input = screen.getByLabelText('Amount');

      fireEvent.change(input, { target: { value: '123' } });
      fireEvent.change(input, { target: { value: '' } });

      expect(input).toHaveValue('');
    });

    it('can be disabled', () => {
      render(<CurrencyInput label="Amount" disabled />);
      expect(screen.getByLabelText('Amount')).toBeDisabled();
    });

    it('uses decimal input mode for mobile', () => {
      render(<CurrencyInput label="Amount" />);
      expect(screen.getByLabelText('Amount')).toHaveAttribute('inputMode', 'decimal');
    });
  });

  describe('accessibility', () => {
    it('has correct aria-invalid when error present', () => {
      render(<CurrencyInput label="Amount" error="Error" />);
      expect(screen.getByLabelText('Amount')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-invalid false when no error', () => {
      render(<CurrencyInput label="Amount" />);
      expect(screen.getByLabelText('Amount')).toHaveAttribute('aria-invalid', 'false');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<CurrencyInput label="Amount" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
