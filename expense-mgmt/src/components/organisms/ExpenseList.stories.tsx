/**
 * ExpenseList Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ExpenseList } from './ExpenseList';

// Mock expenses data
const mockExpenses = [
  {
    id: 'exp-1',
    expenseDate: '2024-01-15',
    vendorName: 'Office Supplies Co',
    amount: '1500.00',
    natureOfExpense: 'Office Supplies',
    status: 'submitted',
    workflowType: 'petty',
    submitterName: 'John Doe',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'exp-2',
    expenseDate: '2024-01-20',
    vendorName: 'Travel Agency',
    amount: '5000.00',
    natureOfExpense: 'Travel & Transportation',
    status: 'approved',
    workflowType: 'petty',
    submitterName: 'Jane Smith',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: 'exp-3',
    expenseDate: '2024-01-25',
    vendorName: 'Vendor Inc',
    amount: '2500.00',
    natureOfExpense: null,
    status: 'draft',
    workflowType: 'petty',
    submitterName: 'Bob Johnson',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'exp-4',
    expenseDate: '2024-02-01',
    vendorName: 'Rejected Vendor',
    amount: '1000.00',
    natureOfExpense: 'Miscellaneous',
    status: 'rejected',
    workflowType: 'petty',
    submitterName: 'Alice Brown',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-02'),
  },
];

// Mock fetch for Storybook
global.fetch = async (url: RequestInfo | URL) => {
  const urlString = url.toString();

  // Mock expenses list endpoint
  if (urlString.includes('/api/expenses')) {
    // Check for different scenarios based on query params
    if (urlString.includes('page=2')) {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: mockExpenses.slice(0, 2),
          meta: {
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
        }),
      } as Response;
    }

    if (urlString.includes('status=submitted')) {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: [mockExpenses[0]],
          meta: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        }),
      } as Response;
    }

    // Default response
    return {
      ok: true,
      json: async () => ({
        success: true,
        data: mockExpenses,
        meta: {
          page: 1,
          limit: 10,
          total: 4,
          totalPages: 1,
        },
      }),
    } as Response;
  }

  return {
    ok: false,
    json: async () => ({ success: false, error: { message: 'Not found' } }),
  } as Response;
};

const meta: Meta<typeof ExpenseList> = {
  title: 'Organisms/ExpenseList',
  component: ExpenseList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete expense list view with filtering, pagination, and table display. Shows expenses with status badges, currency formatting, and navigation links.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state showing a list of expenses with all status types.
 */
export const Default: Story = {
  render: () => {
    return <ExpenseList />;
  },
};

/**
 * Loading state - shows spinner while fetching expenses.
 */
export const Loading: Story = {
  render: () => {
    global.fetch = () =>
      new Promise(() => {
        // Never resolve to show loading state
      }) as Promise<Response>;
    return <ExpenseList />;
  },
};

/**
 * Empty state when no expenses are found.
 */
export const Empty: Story = {
  render: () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        }),
      } as Response;
    };
    return <ExpenseList />;
  },
};

/**
 * With pagination controls visible (multiple pages).
 */
export const WithPagination: Story = {
  render: () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: mockExpenses,
          meta: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
        }),
      } as Response;
    };
    return <ExpenseList />;
  },
};

/**
 * With initial filters applied.
 */
export const WithFilters: Story = {
  render: () => {
    return (
      <ExpenseList
        initialFilters={{
          status: 'submitted',
          workflowType: 'petty',
          search: '',
          startDate: '',
          endDate: '',
        }}
      />
    );
  },
};

/**
 * Error state when API request fails.
 */
export const ErrorState: Story = {
  render: () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          success: false,
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch expenses. Please try again later.',
          },
        }),
      } as Response;
    };
    return <ExpenseList />;
  },
};

/**
 * Many expenses displayed in the table (10 items).
 */
export const ManyExpenses: Story = {
  render: () => {
    const manyExpenses = Array.from({ length: 10 }, (_, i) => ({
      id: `exp-${i + 1}`,
      expenseDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
      vendorName: `Vendor ${i + 1}`,
      amount: `${(i + 1) * 1000}.00`,
      natureOfExpense: `Expense Type ${i + 1}`,
      status: (['draft', 'submitted', 'approved', 'rejected'] as const)[i % 4],
      workflowType: 'petty' as const,
      submitterName: `User ${i + 1}`,
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
    }));

    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: manyExpenses,
          meta: {
            page: 1,
            limit: 10,
            total: 10,
            totalPages: 1,
          },
        }),
      } as Response;
    };
    return <ExpenseList />;
  },
};
