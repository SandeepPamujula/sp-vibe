/**
 * DateInput Component
 *
 * Date input with label, validation, and native date picker.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Required field indicator */
  isRequired?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, helperText, isRequired = false, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseStyles = `
      w-full h-10 px-3
      bg-white dark:bg-zinc-800 
      border rounded-lg
      text-zinc-900 dark:text-zinc-100
      transition-colors cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:disabled:bg-zinc-900
      [&::-webkit-calendar-picker-indicator]:cursor-pointer
      [&::-webkit-calendar-picker-indicator]:dark:invert
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
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={`${baseStyles} ${borderStyles} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
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

DateInput.displayName = 'DateInput';
