/**
 * NatureOfExpenseSelect Component Stories
 *
 * Dropdown for selecting "Nature of Expense" in expense forms.
 * The selected value (GL Code ID) should be submitted as `natureOfExpense`.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { NatureOfExpenseOption } from '@/types/dto/nature-of-expense.dto';

import { NatureOfExpenseSelect } from './NatureOfExpenseSelect';

const sampleOptions: NatureOfExpenseOption[] = [
  { value: 'gl-1', label: 'Office Supplies', code: '5100', description: 'Office Supplies' },
  {
    value: 'gl-2',
    label: 'Travel & Transportation',
    code: '5200',
    description: 'Travel & Transportation',
  },
  {
    value: 'gl-3',
    label: 'Meals & Entertainment',
    code: '5300',
    description: 'Meals & Entertainment',
  },
  {
    value: 'gl-4',
    label: 'Software & Subscriptions',
    code: '5400',
    description: 'Software & Subscriptions',
  },
  {
    value: 'gl-5',
    label: 'Equipment & Hardware',
    code: '5500',
    description: 'Equipment & Hardware',
  },
  {
    value: 'gl-6',
    label: 'Professional Services',
    code: '5600',
    description: 'Professional Services',
  },
  { value: 'gl-7', label: 'Utilities', code: '5700', description: 'Utilities' },
  {
    value: 'gl-8',
    label: 'Marketing & Advertising',
    code: '5800',
    description: 'Marketing & Advertising',
  },
];

const manyOptions: NatureOfExpenseOption[] = Array.from({ length: 25 }, (_, i) => ({
  value: `gl-${i + 1}`,
  label: `Expense Category ${i + 1}`,
  code: String(5000 + i),
  description: `Expense Category ${i + 1}`,
}));

const meta: Meta<typeof NatureOfExpenseSelect> = {
  title: 'Molecules/NatureOfExpenseSelect',
  component: NatureOfExpenseSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
    defaultValue: 'gl-2',
  },
};

export const Required: Story = {
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
    isRequired: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
    helperText: 'Select the category that best describes this expense.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
    error: 'Nature of expense is required.',
  },
};

export const Loading: Story = {
  args: {
    label: 'Nature of Expense',
    options: [],
    isLoading: true,
  },
};

export const ShowGlCode: Story = {
  name: 'Show GL Code Numbers',
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
    showCode: true,
    helperText: 'Options show GL code numbers for reference.',
  },
};

export const DescriptionOnly: Story = {
  name: 'Description Only (No GL Code)',
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
    showCode: false,
    helperText: 'Options show only the expense category name.',
  },
};

export const ManyOptions: Story = {
  args: {
    label: 'Nature of Expense',
    options: manyOptions,
    helperText: 'Shows count hint when more than 10 options',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Nature of Expense',
    options: sampleOptions,
    defaultValue: 'gl-3',
    disabled: true,
  },
};

export const EmptyOptions: Story = {
  args: {
    label: 'Nature of Expense',
    options: [],
    helperText: 'No expense categories available',
  },
};
