/**
 * ExpenseListFilters Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExpenseListFilters } from './ExpenseListFilters';

const meta: Meta<typeof ExpenseListFilters> = {
  title: 'Molecules/ExpenseListFilters',
  component: ExpenseListFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Filter controls for expense list view. Supports filtering by status, workflow type, text search, and date range.',
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-7xl mx-auto p-6 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with no active filters.
 */
export const Default: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/expenses',
        query: {},
      },
    },
  },
};

/**
 * Filters with some active filters applied.
 */
export const WithActiveFilters: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/expenses',
        query: {
          status: 'submitted',
          workflowType: 'petty',
          search: 'office supplies',
        },
      },
    },
  },
};

/**
 * Filters with date range applied.
 */
export const WithDateRange: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/expenses',
        query: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
    },
  },
};

/**
 * All filters active with values.
 */
export const WithAllFilters: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/expenses',
        query: {
          status: 'approved',
          workflowType: 'petty',
          search: 'vendor',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
    },
  },
};

/**
 * With callback handler to demonstrate filter change events.
 */
export const WithCallback: Story = {
  render: () => {
    const handleFiltersChange = () => {
      // Filter change handler - no-op in Storybook
    };
    return <ExpenseListFilters onFiltersChange={handleFiltersChange} />;
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/expenses',
        query: {},
      },
    },
  },
};
