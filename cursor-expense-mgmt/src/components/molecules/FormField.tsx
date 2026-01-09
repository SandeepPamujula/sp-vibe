/**
 * FormField Component
 *
 * Generic wrapper for form field layout with consistent spacing.
 */

import type { ReactNode } from 'react';

export interface FormFieldProps {
  /** Field content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Column span for grid layouts */
  span?: 1 | 2 | 'full';
}

/**
 * FormField wrapper for consistent form layout
 */
export function FormField({ children, className = '', span = 1 }: FormFieldProps) {
  const spanClasses = {
    1: '',
    2: 'md:col-span-2',
    full: 'col-span-full',
  };

  return <div className={`${spanClasses[span]} ${className}`}>{children}</div>;
}

export interface FormRowProps {
  /** Row content (FormField components) */
  children: ReactNode;
  /** Number of columns */
  cols?: 1 | 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormRow for grouping fields in a row
 */
export function FormRow({ children, cols = 2, className = '' }: FormRowProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`grid ${gridClasses[cols]} gap-4 ${className}`}>{children}</div>;
}

export interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormSection for grouping related fields
 */
export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
          {title && (
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
