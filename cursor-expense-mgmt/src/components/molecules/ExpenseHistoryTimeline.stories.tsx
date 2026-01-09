/**
 * ExpenseHistoryTimeline Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExpenseHistoryTimeline } from './ExpenseHistoryTimeline';

// Mock fetch globally
const mockFetch = (url: string) => {
  const expenseId = url.split('/').pop() || '';

  // Mock history data based on expense ID
  const mockHistories: Record<string, any> = {
    'expense-full': {
      success: true,
      data: [
        {
          id: 'history-1',
          expenseId,
          userId: 'user-1',
          action: 'created',
          comments: 'Expense created for office supplies',
          changes: null,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
        {
          id: 'history-2',
          expenseId,
          userId: 'user-1',
          action: 'submitted',
          comments: 'Submitted for approval',
          changes: { status: { from: 'draft', to: 'submitted' } },
          createdAt: new Date('2024-01-15T11:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
        {
          id: 'history-3',
          expenseId,
          userId: 'user-2',
          action: 'approved',
          comments: 'Approved. All documents verified.',
          changes: { status: { from: 'submitted', to: 'approved' } },
          createdAt: new Date('2024-01-15T12:00:00Z'),
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
          },
        },
      ],
    },
    'expense-empty': {
      success: true,
      data: [],
    },
    'expense-single': {
      success: true,
      data: [
        {
          id: 'history-1',
          expenseId,
          userId: 'user-1',
          action: 'created',
          comments: 'Expense created',
          changes: null,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
      ],
    },
    'expense-all-actions': {
      success: true,
      data: [
        {
          id: 'history-1',
          expenseId,
          userId: 'user-1',
          action: 'created',
          comments: 'Expense created',
          changes: null,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
        {
          id: 'history-2',
          expenseId,
          userId: 'user-1',
          action: 'submitted',
          comments: 'Submitted for approval',
          changes: null,
          createdAt: new Date('2024-01-15T11:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
        {
          id: 'history-3',
          expenseId,
          userId: 'user-2',
          action: 'approved',
          comments: 'Approved',
          changes: null,
          createdAt: new Date('2024-01-15T12:00:00Z'),
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
          },
        },
        {
          id: 'history-4',
          expenseId,
          userId: 'user-2',
          action: 'rejected',
          comments: 'Rejected: Missing documentation',
          changes: null,
          createdAt: new Date('2024-01-15T13:00:00Z'),
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
          },
        },
        {
          id: 'history-5',
          expenseId,
          userId: 'user-1',
          action: 'updated',
          comments: 'Updated vendor information',
          changes: null,
          createdAt: new Date('2024-01-15T14:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
      ],
    },
    'expense-no-comments': {
      success: true,
      data: [
        {
          id: 'history-1',
          expenseId,
          userId: 'user-1',
          action: 'created',
          comments: null,
          changes: null,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
        {
          id: 'history-2',
          expenseId,
          userId: 'user-1',
          action: 'submitted',
          comments: null,
          changes: null,
          createdAt: new Date('2024-01-15T11:00:00Z'),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
        },
      ],
    },
    'expense-error': {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Expense not found',
      },
    },
  };

  const mockData = mockHistories[expenseId] || mockHistories['expense-full'];

  return Promise.resolve({
    ok: true,
    json: async () => mockData,
  });
};

// Set up global fetch mock
if (typeof window !== 'undefined') {
  (window as any).fetch = mockFetch;
}

const meta: Meta<typeof ExpenseHistoryTimeline> = {
  title: 'Molecules/ExpenseHistoryTimeline',
  component: ExpenseHistoryTimeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Visual timeline component displaying expense history with icons, badges, and enhanced styling. Shows chronological events with user information, comments, and timestamps.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    expenseId: {
      control: 'text',
      description: 'The ID of the expense to fetch history for',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default timeline with full history
 */
export const Default: Story = {
  args: {
    expenseId: 'expense-full',
  },
};

/**
 * Timeline with all action types
 */
export const AllActions: Story = {
  args: {
    expenseId: 'expense-all-actions',
  },
};

/**
 * Timeline with single entry
 */
export const SingleEntry: Story = {
  args: {
    expenseId: 'expense-single',
  },
};

/**
 * Empty state when no history exists
 */
export const EmptyState: Story = {
  args: {
    expenseId: 'expense-empty',
  },
};

/**
 * Timeline entries without comments
 */
export const NoComments: Story = {
  args: {
    expenseId: 'expense-no-comments',
  },
};

/**
 * Error state when expense is not found
 */
export const ErrorState: Story = {
  args: {
    expenseId: 'expense-error',
  },
};
