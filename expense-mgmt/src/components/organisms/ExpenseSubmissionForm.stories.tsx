/**
 * ExpenseSubmissionForm Stories
 *
 * Interactive demos of the expense submission form component.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExpenseSubmissionForm } from './ExpenseSubmissionForm';

// Mock fetch for Storybook
global.fetch = async (url: RequestInfo | URL) => {
  const urlString = url.toString();

  // Mock GL Codes endpoint
  if (urlString.includes('/api/gl-codes')) {
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { id: '1', code: '5100', description: 'Office Supplies' },
          { id: '2', code: '5200', description: 'Travel & Transportation' },
          { id: '3', code: '5300', description: 'Meals & Entertainment' },
          { id: '4', code: '5400', description: 'Utilities' },
        ],
      }),
    } as Response;
  }

  // Mock create expense endpoint
  if (urlString.includes('/api/expenses') && !urlString.includes('[expenseId]')) {
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'mock-expense-id' },
      }),
    } as Response;
  }

  // Mock update expense endpoint
  if (urlString.includes('/api/expenses/') && !urlString.includes('submit')) {
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'mock-expense-id' },
      }),
    } as Response;
  }

  // Mock submit expense endpoint
  if (urlString.includes('/submit')) {
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'mock-expense-id', status: 'submitted' },
      }),
    } as Response;
  }

  return {
    ok: false,
    json: async () => ({ success: false, error: { message: 'Not found' } }),
  } as Response;
};

const meta = {
  title: 'Organisms/ExpenseSubmissionForm',
  component: ExpenseSubmissionForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Complete form for creating and submitting petty expenses. Handles form validation, file uploads, and submission workflow.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExpenseSubmissionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state of the expense submission form with all fields empty.
 */
export const Default: Story = {
  args: {
    onSuccess: (_expenseId: string) => {
      alert(`Expense ${_expenseId} submitted successfully!`);
    },
    onCancel: () => {
      alert('Form cancelled');
    },
  },
};

/**
 * Form with success callback handler to see what happens after submission.
 */
export const WithCallbacks: Story = {
  args: {
    onSuccess: (_expenseId: string) => {
      alert(`Success! Expense ID: ${_expenseId}`);
    },
    onCancel: () => {
      alert('Cancelled!');
    },
  },
};

/**
 * Interactive form demo - try filling out and submitting the form.
 */
export const Interactive: Story = {
  args: {
    onSuccess: (_expenseId: string) => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Try filling out the form with sample data and see validation in action.',
      },
    },
  },
};
