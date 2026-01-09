/**
 * CurrencyInput Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { CurrencyInput } from './CurrencyInput';

const meta: Meta<typeof CurrencyInput> = {
  title: 'Atoms/CurrencyInput',
  component: CurrencyInput,
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
    label: 'Amount',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Amount',
    value: '12345.67',
  },
};

export const LargeAmount: Story = {
  args: {
    label: 'Amount',
    value: '1234567.89',
  },
};

export const Required: Story = {
  args: {
    label: 'Amount',
    isRequired: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Amount',
    helperText: 'Enter the total expense amount in INR.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Amount',
    value: '0',
    error: 'Amount must be greater than zero.',
  },
};

export const WithDollarCurrency: Story = {
  args: {
    label: 'Amount (USD)',
    currency: '$',
  },
};

export const WithEuroCurrency: Story = {
  args: {
    label: 'Amount (EUR)',
    currency: '€',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Amount',
    value: '5000',
    disabled: true,
  },
};

// Interactive story with state
function InteractiveTemplate() {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      <CurrencyInput
        label="Enter Amount"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        helperText="Type a number to see formatting"
      />
      <div className="text-sm text-zinc-500">
        <p>
          Raw value: <code className="bg-zinc-100 px-1 rounded">{value || '(empty)'}</code>
        </p>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
};
