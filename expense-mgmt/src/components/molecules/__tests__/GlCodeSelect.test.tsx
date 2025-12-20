/**
 * GlCodeSelect Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GlCodeSelectOption } from '@/types/dto/gl-code.dto';

import { GlCodeSelect } from '../GlCodeSelect';

const mockOptions: GlCodeSelectOption[] = [
  { value: '1', label: '5001 - Office Supplies', code: '5001', description: 'Office Supplies' },
  { value: '2', label: '5002 - Travel Expenses', code: '5002', description: 'Travel Expenses' },
  { value: '3', label: '5003 - Utilities', code: '5003', description: 'Utilities' },
];

describe('GlCodeSelect', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} />);
      expect(screen.getByLabelText('GL Code')).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} />);

      expect(screen.getByRole('option', { name: /5001 - Office Supplies/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /5002 - Travel Expenses/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /5003 - Utilities/ })).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} placeholder="Choose a GL code" />);
      expect(screen.getByRole('option', { name: 'Choose a GL code' })).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} />);
      expect(screen.getByRole('option', { name: 'Select GL Code' })).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(
        <GlCodeSelect
          label="GL Code"
          options={mockOptions}
          helperText="Select the appropriate GL code"
        />
      );
      expect(screen.getByText('Select the appropriate GL code')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} error="GL Code is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('GL Code is required');
    });

    it('shows option count hint for many options', () => {
      const manyOptions = Array.from({ length: 15 }, (_, i) => ({
        value: String(i),
        label: `${5000 + i} - Description ${i}`,
        code: String(5000 + i),
        description: `Description ${i}`,
      }));

      render(<GlCodeSelect label="GL Code" options={manyOptions} />);
      expect(screen.getByText('15 GL codes available')).toBeInTheDocument();
    });

    it('does not show option count hint for few options', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} />);
      expect(screen.queryByText(/GL codes available/)).not.toBeInTheDocument();
    });
  });

  describe('formatting', () => {
    it('shows code with description by default', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} />);
      expect(screen.getByRole('option', { name: '5001 - Office Supplies' })).toBeInTheDocument();
    });

    it('shows only description when showCode is false', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} showCode={false} />);
      expect(screen.getByRole('option', { name: 'Office Supplies' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /5001/ })).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading text in placeholder when loading', () => {
      render(<GlCodeSelect label="GL Code" options={[]} isLoading />);
      expect(screen.getByRole('option', { name: 'Loading...' })).toBeInTheDocument();
    });

    it('disables select when loading', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} isLoading />);
      expect(screen.getByLabelText('GL Code')).toBeDisabled();
    });
  });

  describe('interaction', () => {
    it('can select an option', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<GlCodeSelect label="GL Code" options={mockOptions} onChange={handleChange} />);

      await user.selectOptions(screen.getByLabelText('GL Code'), '2');

      expect(handleChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} disabled />);
      expect(screen.getByLabelText('GL Code')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-invalid when error present', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} error="Error" />);
      expect(screen.getByLabelText('GL Code')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-invalid false when no error', () => {
      render(<GlCodeSelect label="GL Code" options={mockOptions} />);
      expect(screen.getByLabelText('GL Code')).toHaveAttribute('aria-invalid', 'false');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<GlCodeSelect label="GL Code" options={mockOptions} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });
  });
});
