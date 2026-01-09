/**
 * Textarea Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { Textarea } from '../Textarea';

describe('Textarea', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Textarea placeholder="Enter description" />);
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
      render(<Textarea label="Description" isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Textarea label="Description" helperText="Maximum 500 characters" />);
      expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Textarea label="Description" error="Field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Field is required');
    });

    it('shows error instead of helper when both provided', () => {
      render(<Textarea label="Description" helperText="Help" error="Error" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Error');
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });
  });

  describe('character count', () => {
    it('shows character count when showCount is true and maxLength provided', () => {
      render(<Textarea label="Description" showCount maxLength={100} defaultValue="Hello" />);
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('does not show character count when showCount is false', () => {
      render(<Textarea label="Description" maxLength={100} defaultValue="Hello" />);
      expect(screen.queryByText('5/100')).not.toBeInTheDocument();
    });

    it('updates character count on input', () => {
      render(<Textarea label="Description" showCount maxLength={100} />);

      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Test message' },
      });

      expect(screen.getByText('12/100')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-invalid when error present', () => {
      render(<Textarea label="Description" error="Error" />);
      expect(screen.getByLabelText('Description')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-invalid false when no error', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText('Description')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('interaction', () => {
    it('calls onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<Textarea label="Description" onChange={handleChange} />);

      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'New content' },
      });

      expect(handleChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<Textarea label="Description" disabled />);
      expect(screen.getByLabelText('Description')).toBeDisabled();
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Textarea label="Description" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
