/**
 * CurrencyInput Component
 *
 * Numeric input with currency symbol prefix and formatting.
 */

'use client';

import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ChangeEvent } from 'react';

export interface CurrencyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Currency symbol */
  currency?: string;
  /** Required field indicator */
  isRequired?: boolean;
  /** Change handler with string value */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Value as string */
  value?: string;
}

/**
 * Format number string with commas for thousands
 */
function formatCurrency(value: string): string {
  if (!value) return '';

  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');

  // Split on decimal point
  const parts = cleaned.split('.');

  // Format integer part with commas
  const integerPart = (parts[0] ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Limit decimal to 2 places
  const decimalPart = parts[1]?.slice(0, 2);

  return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
}

/**
 * Parse formatted value back to plain number string
 */
function parseValue(formatted: string): string {
  return formatted.replace(/,/g, '');
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      label,
      error,
      helperText,
      currency = '₹',
      isRequired = false,
      className = '',
      id,
      value,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [displayValue, setDisplayValue] = useState(formatCurrency(value ?? ''));

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const cleanedValue = parseValue(rawValue);

      // Validate numeric input (allow empty, digits, and single decimal)
      if (cleanedValue && !/^\d*\.?\d*$/.test(cleanedValue)) {
        return;
      }

      const formatted = formatCurrency(rawValue);
      setDisplayValue(formatted);

      // Create synthetic event with cleaned value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: cleanedValue,
        },
      };

      onChange?.(syntheticEvent as ChangeEvent<HTMLInputElement>);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format on blur for consistent display
      setDisplayValue(formatCurrency(parseValue(displayValue)));
      onBlur?.(e);
    };

    // Sync internal state when value prop changes
    if (value !== undefined && parseValue(displayValue) !== value) {
      setDisplayValue(formatCurrency(value));
    }

    const baseInputStyles = `
      w-full h-10 pl-8 pr-3
      bg-white dark:bg-zinc-800 
      border rounded-lg
      text-zinc-900 dark:text-zinc-100
      placeholder:text-zinc-400 dark:placeholder:text-zinc-500
      transition-colors
      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:disabled:bg-zinc-900
    `;

    const borderStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 font-medium pointer-events-none">
            {currency}
          </span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            className={`${baseInputStyles} ${borderStyles} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0.00"
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
