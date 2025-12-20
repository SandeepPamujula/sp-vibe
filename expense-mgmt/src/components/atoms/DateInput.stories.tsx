/**
 * DateInput Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DateInput } from './DateInput';

const meta: Meta<typeof DateInput> = {
  title: 'Atoms/DateInput',
  component: DateInput,
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

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];
const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const Default: Story = {
  args: {
    label: 'Expense Date',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Expense Date',
    defaultValue: today,
  },
};

export const Required: Story = {
  args: {
    label: 'Expense Date',
    isRequired: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Expense Date',
    helperText: 'Select the date when the expense occurred.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Expense Date',
    error: 'Expense date cannot be in the future.',
  },
};

export const WithMinDate: Story = {
  args: {
    label: 'Expense Date',
    min: lastMonth,
    helperText: 'Cannot select a date older than 30 days.',
  },
};

export const WithMaxDate: Story = {
  args: {
    label: 'Expense Date',
    max: today,
    helperText: 'Cannot select a future date.',
  },
};

export const WithDateRange: Story = {
  args: {
    label: 'Expense Date',
    min: lastMonth,
    max: today,
    helperText: 'Select a date within the last 30 days.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Expense Date',
    defaultValue: today,
    disabled: true,
  },
};
