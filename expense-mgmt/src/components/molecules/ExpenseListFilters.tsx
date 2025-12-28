/**
 * ExpenseListFilters Component
 *
 * Filter controls for expense list view.
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

import { Button, Input, Select, DateInput } from '@/components/atoms';
import type { ExpenseStatus, WorkflowType } from '@/types/entities/base.entity';

export interface ExpenseListFiltersProps {
  /** Callback when filters change */
  onFiltersChange?: (filters: ExpenseFilterState) => void;
}

export interface ExpenseFilterState {
  status: ExpenseStatus | '';
  workflowType: WorkflowType | '';
  search: string;
  startDate: string;
  endDate: string;
}

// Type guard to check if status is a valid ExpenseStatus
function isValidExpenseStatus(value: string): value is ExpenseStatus {
  return ['draft', 'submitted', 'approved', 'rejected'].includes(value);
}

// Type guard to check if workflowType is a valid WorkflowType
function isValidWorkflowType(value: string): value is WorkflowType {
  return ['petty', 'internet'].includes(value);
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const WORKFLOW_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Types' },
  { value: 'petty', label: 'Petty Expense' },
  { value: 'internet', label: 'Internet Expense' },
];

export function ExpenseListFilters({ onFiltersChange }: ExpenseListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ExpenseFilterState>({
    status: (searchParams.get('status') as ExpenseStatus | null) || '',
    workflowType: (searchParams.get('workflowType') as WorkflowType | null) || '',
    search: searchParams.get('search') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  const updateFilters = useCallback(
    (updates: Partial<ExpenseFilterState>) => {
      const newFilters = { ...filters, ...updates };
      setFilters(newFilters);
      onFiltersChange?.(newFilters);

      // Update URL search params
      const params = new URLSearchParams();
      if (newFilters.status && isValidExpenseStatus(newFilters.status)) {
        params.set('status', newFilters.status);
      }
      if (newFilters.workflowType && isValidWorkflowType(newFilters.workflowType)) {
        params.set('workflowType', newFilters.workflowType);
      }
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.startDate) params.set('startDate', newFilters.startDate);
      if (newFilters.endDate) params.set('endDate', newFilters.endDate);
      params.set('page', '1'); // Reset to first page on filter change

      router.push(`/expenses?${params.toString()}`);
    },
    [filters, router, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    const clearedFilters: ExpenseFilterState = {
      status: '',
      workflowType: '',
      search: '',
      startDate: '',
      endDate: '',
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
    router.push('/expenses?page=1');
  }, [router, onFiltersChange]);

  const hasActiveFilters =
    filters.status ||
    filters.workflowType ||
    filters.search ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            label="Search"
            placeholder="Search by vendor name, invoice number..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value as ExpenseStatus | '' })}
        />

        {/* Workflow Type Filter */}
        <Select
          label="Workflow Type"
          options={WORKFLOW_TYPE_OPTIONS}
          value={filters.workflowType}
          onChange={(e) => updateFilters({ workflowType: e.target.value as WorkflowType | '' })}
        />

        {/* Start Date */}
        <DateInput
          label="Start Date"
          value={filters.startDate}
          onChange={(e) => updateFilters({ startDate: e.target.value })}
        />

        {/* End Date */}
        <DateInput
          label="End Date"
          value={filters.endDate}
          onChange={(e) => updateFilters({ endDate: e.target.value })}
        />
      </div>
    </div>
  );
}
