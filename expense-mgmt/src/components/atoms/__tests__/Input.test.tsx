/**
 * Input Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';

import { Input } from '../Input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
      render(<Input label="Email" isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Input label="Email" helperText="We'll never share your email" />);
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Input label="Email" error="Invalid email format" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
    });

    it('shows error instead of helper text when both provided', () => {
      render(<Input label="Email" helperText="Help" error="Error" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Error');
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });

    it('renders with left icon', () => {
      render(<Input label="Search" leftIcon={<span data-testid="left-icon">🔍</span>} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(<Input label="Password" rightIcon={<span data-testid="right-icon">👁</span>} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-invalid when error present', () => {
      render(<Input label="Email" error="Error" />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-invalid false when no error', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
    });

    it('has aria-describedby linking to error', () => {
      render(<Input label="Email" id="email" error="Error" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('has aria-describedby linking to helper text', () => {
      render(<Input label="Email" id="email" helperText="Help" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-helper');
    });
  });

  describe('interaction', () => {
    it('calls onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<Input label="Email" onChange={handleChange} />);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<Input label="Email" disabled />);
      expect(screen.getByLabelText('Email')).toBeDisabled();
    });

    it('supports different input types', () => {
      render(<Input label="Password" type="password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Input label="Email" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
