/**
 * GlCodeSelect Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { GlCodeSelectOption } from '@/types/dto/gl-code.dto';

import { GlCodeSelect } from './GlCodeSelect';

const sampleGlCodes: GlCodeSelectOption[] = [
  { value: '1', label: '5001 - Office Supplies', code: '5001', description: 'Office Supplies' },
  { value: '2', label: '5002 - Travel Expenses', code: '5002', description: 'Travel Expenses' },
  { value: '3', label: '5003 - Utilities', code: '5003', description: 'Utilities' },
  { value: '4', label: '5004 - Marketing', code: '5004', description: 'Marketing' },
  {
    value: '5',
    label: '5005 - Professional Services',
    code: '5005',
    description: 'Professional Services',
  },
  { value: '6', label: '5006 - Equipment', code: '5006', description: 'Equipment' },
  { value: '7', label: '5007 - Insurance', code: '5007', description: 'Insurance' },
  { value: '8', label: '5008 - Rent', code: '5008', description: 'Rent' },
];

const manyGlCodes: GlCodeSelectOption[] = Array.from({ length: 25 }, (_, i) => ({
  value: String(i + 1),
  label: `${5000 + i} - Description for code ${5000 + i}`,
  code: String(5000 + i),
  description: `Description for code ${5000 + i}`,
}));

const meta: Meta<typeof GlCodeSelect> = {
  title: 'Molecules/GlCodeSelect',
  component: GlCodeSelect,
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
    label: 'GL Code',
    options: sampleGlCodes,
  },
};

export const WithValue: Story = {
  args: {
    label: 'GL Code',
    options: sampleGlCodes,
    defaultValue: '2',
  },
};

export const Required: Story = {
  args: {
    label: 'GL Code',
    options: sampleGlCodes,
    isRequired: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'GL Code',
    options: sampleGlCodes,
    helperText: 'Select the General Ledger code for this expense.',
  },
};

export const WithError: Story = {
  args: {
    label: 'GL Code',
    options: sampleGlCodes,
    error: 'GL Code is required for this expense type.',
  },
};

export const Loading: Story = {
  args: {
    label: 'GL Code',
    options: [],
    isLoading: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    label: 'GL Code',
    options: sampleGlCodes,
    placeholder: 'Choose a GL code...',
  },
};

export const DescriptionOnly: Story = {
  args: {
    label: 'GL Code',
    options: sampleGlCodes,
    showCode: false,
  },
};

export const ManyOptions: Story = {
  args: {
    label: 'GL Code',
    options: manyGlCodes,
    helperText: 'Shows count hint when more than 10 options',
  },
};

export const Disabled: Story = {
  args: {
    label: 'GL Code',
    options: sampleGlCodes,
    defaultValue: '3',
    disabled: true,
  },
};

export const EmptyOptions: Story = {
  args: {
    label: 'GL Code',
    options: [],
    helperText: 'No GL codes available',
  },
};
