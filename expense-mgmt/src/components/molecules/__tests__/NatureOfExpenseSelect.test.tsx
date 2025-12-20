/**
 * NatureOfExpenseSelect Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { NatureOfExpenseOption } from '@/types/dto/nature-of-expense.dto';

import { NatureOfExpenseSelect } from '../NatureOfExpenseSelect';

const mockOptions: NatureOfExpenseOption[] = [
  { value: 'gl-1', label: 'Office Supplies', code: '5100', description: 'Office Supplies' },
  {
    value: 'gl-2',
    label: 'Travel & Transportation',
    code: '5200',
    description: 'Travel & Transportation',
  },
  { value: 'gl-3', label: 'Utilities', code: '5300', description: 'Utilities' },
];

describe('NatureOfExpenseSelect', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} />);
      expect(screen.getByLabelText('Nature of Expense')).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} />);

      expect(screen.getByRole('option', { name: /5100 - Office Supplies/ })).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /5200 - Travel & Transportation/ })
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /5300 - Utilities/ })).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <NatureOfExpenseSelect
          label="Nature of Expense"
          options={mockOptions}
          placeholder="Choose expense type"
        />
      );
      expect(screen.getByRole('option', { name: 'Choose expense type' })).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} />);
      expect(screen.getByRole('option', { name: 'Select nature of expense' })).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(
        <NatureOfExpenseSelect
          label="Nature of Expense"
          options={mockOptions}
          helperText="Select the category for this expense"
        />
      );
      expect(screen.getByText('Select the category for this expense')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(
        <NatureOfExpenseSelect
          label="Nature of Expense"
          options={mockOptions}
          error="Nature of expense is required"
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Nature of expense is required');
    });

    it('shows option count hint for many options', () => {
      const manyOptions: NatureOfExpenseOption[] = Array.from({ length: 15 }, (_, i) => ({
        value: `gl-${i}`,
        label: `Category ${i}`,
        code: String(5000 + i),
        description: `Category ${i}`,
      }));

      render(<NatureOfExpenseSelect label="Nature of Expense" options={manyOptions} />);
      expect(screen.getByText('15 options available')).toBeInTheDocument();
    });

    it('does not show option count hint for few options', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} />);
      expect(screen.queryByText(/options available/)).not.toBeInTheDocument();
    });
  });

  describe('formatting', () => {
    it('shows code with description by default', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} />);
      expect(screen.getByRole('option', { name: '5100 - Office Supplies' })).toBeInTheDocument();
    });

    it('shows only description when showCode is false', () => {
      render(
        <NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} showCode={false} />
      );
      expect(screen.getByRole('option', { name: 'Office Supplies' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /5100/ })).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading text in placeholder when loading', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={[]} isLoading />);
      expect(screen.getByRole('option', { name: 'Loading...' })).toBeInTheDocument();
    });

    it('disables select when loading', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} isLoading />);
      expect(screen.getByLabelText('Nature of Expense')).toBeDisabled();
    });
  });

  describe('interaction', () => {
    it('can select an option', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <NatureOfExpenseSelect
          label="Nature of Expense"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      await user.selectOptions(screen.getByLabelText('Nature of Expense'), 'gl-2');

      expect(handleChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} disabled />);
      expect(screen.getByLabelText('Nature of Expense')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-invalid when error present', () => {
      render(
        <NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} error="Error" />
      );
      expect(screen.getByLabelText('Nature of Expense')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-invalid false when no error', () => {
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} />);
      expect(screen.getByLabelText('Nature of Expense')).toHaveAttribute('aria-invalid', 'false');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<NatureOfExpenseSelect label="Nature of Expense" options={mockOptions} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });
  });
});
