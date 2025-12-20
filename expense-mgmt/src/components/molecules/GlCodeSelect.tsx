/**
 * GlCodeSelect Component
 *
 * GL Code selector with search and formatted display.
 */

'use client';

import { forwardRef, useMemo, type SelectHTMLAttributes } from 'react';

import type { GlCodeSelectOption } from '@/types/dto/gl-code.dto';

export interface GlCodeSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  /** GL Code options */
  options: GlCodeSelectOption[];
  /** Select label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Required field indicator */
  isRequired?: boolean;
  /** Show code in option label */
  showCode?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

export const GlCodeSelect = forwardRef<HTMLSelectElement, GlCodeSelectProps>(
  (
    {
      options,
      label,
      placeholder = 'Select GL Code',
      error,
      helperText,
      isRequired = false,
      showCode = true,
      isLoading = false,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    // Filter options - prepared for future search functionality
    const filteredOptions = useMemo(() => {
      return options;
    }, [options]);

    // Format option label
    const formatLabel = (option: GlCodeSelectOption) => {
      if (showCode) {
        return `${option.code} - ${option.description}`;
      }
      return option.description;
    };

    const baseSelectStyles = `
      w-full h-10 px-3 pr-10 
      bg-white dark:bg-zinc-800 
      border rounded-lg
      text-zinc-900 dark:text-zinc-100
      appearance-none cursor-pointer
      transition-colors
      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const borderStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`${baseSelectStyles} ${borderStyles} ${className}`}
            disabled={disabled || isLoading}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            <option value="">{isLoading ? 'Loading...' : placeholder}</option>
            {filteredOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {formatLabel(option)}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {isLoading ? <LoadingSpinner /> : <ChevronDownIcon className="w-4 h-4 text-zinc-500" />}
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}

        {/* Option count hint */}
        {options.length > 10 && (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {options.length} GL codes available
          </p>
        )}
      </div>
    );
  }
);

GlCodeSelect.displayName = 'GlCodeSelect';

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-zinc-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
