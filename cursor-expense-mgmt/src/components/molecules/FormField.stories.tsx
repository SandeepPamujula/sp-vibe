/**
 * FormField, FormRow, FormSection Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input, DateInput, CurrencyInput, Textarea, Select } from '../atoms';

import { FormField, FormRow, FormSection } from './FormField';

const meta: Meta<typeof FormSection> = {
  title: 'Molecules/FormLayout',
  component: FormSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleColumn: Story = {
  render: () => (
    <FormSection title="Contact Information" description="Enter your contact details.">
      <FormRow cols={1}>
        <FormField>
          <Input label="Full Name" placeholder="John Doe" isRequired />
        </FormField>
        <FormField>
          <Input label="Email" type="email" placeholder="john@example.com" isRequired />
        </FormField>
        <FormField>
          <Input label="Phone" type="tel" placeholder="+91 98765 43210" />
        </FormField>
      </FormRow>
    </FormSection>
  ),
};

export const TwoColumns: Story = {
  render: () => (
    <FormSection title="Expense Details" description="Enter the expense information.">
      <FormRow cols={2}>
        <FormField>
          <DateInput label="Expense Date" isRequired />
        </FormField>
        <FormField>
          <CurrencyInput label="Amount" isRequired />
        </FormField>
        <FormField>
          <Input label="Invoice Number" placeholder="INV-2024-001" />
        </FormField>
        <FormField>
          <Input label="Vendor Name" placeholder="Office Supplies Ltd." isRequired />
        </FormField>
      </FormRow>
    </FormSection>
  ),
};

export const ThreeColumns: Story = {
  render: () => (
    <FormSection title="Quick Entry" description="Fast expense entry with minimal fields.">
      <FormRow cols={3}>
        <FormField>
          <DateInput label="Date" isRequired />
        </FormField>
        <FormField>
          <Input label="Description" placeholder="Lunch meeting" isRequired />
        </FormField>
        <FormField>
          <CurrencyInput label="Amount" isRequired />
        </FormField>
      </FormRow>
    </FormSection>
  ),
};

export const MixedLayout: Story = {
  render: () => (
    <FormSection
      title="Complete Expense Form"
      description="Fill in all the details for your expense."
    >
      <FormRow cols={2}>
        <FormField>
          <DateInput label="Expense Date" isRequired />
        </FormField>
        <FormField>
          <CurrencyInput label="Amount" isRequired />
        </FormField>
      </FormRow>

      <FormRow cols={2}>
        <FormField>
          <Input label="Vendor Name" placeholder="Enter vendor name" isRequired />
        </FormField>
        <FormField>
          <Input label="Invoice Number" placeholder="INV-2024-001" />
        </FormField>
      </FormRow>

      <FormRow cols={2}>
        <FormField>
          <Input label="Nature of Expense" placeholder="Office supplies, Travel, etc." isRequired />
        </FormField>
        <FormField>
          <Select
            label="GL Code"
            options={[
              { value: '5001', label: '5001 - Office Supplies' },
              { value: '5002', label: '5002 - Travel' },
              { value: '5003', label: '5003 - Utilities' },
            ]}
            placeholder="Select GL Code"
          />
        </FormField>
      </FormRow>

      <FormRow cols={1}>
        <FormField span="full">
          <Textarea
            label="Purpose"
            placeholder="Describe the purpose of this expense..."
            maxLength={500}
            showCount
          />
        </FormField>
      </FormRow>
    </FormSection>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <div className="space-y-8">
      <FormSection title="Basic Information" description="Enter the basic expense details.">
        <FormRow cols={2}>
          <FormField>
            <DateInput label="Expense Date" isRequired />
          </FormField>
          <FormField>
            <CurrencyInput label="Amount" isRequired />
          </FormField>
        </FormRow>
      </FormSection>

      <FormSection title="Vendor Details" description="Information about the vendor.">
        <FormRow cols={2}>
          <FormField>
            <Input label="Vendor Name" placeholder="Enter vendor name" isRequired />
          </FormField>
          <FormField>
            <Input label="Invoice Number" placeholder="INV-2024-001" />
          </FormField>
        </FormRow>
      </FormSection>

      <FormSection title="Additional Details">
        <FormRow cols={1}>
          <FormField>
            <Textarea label="Notes" placeholder="Any additional notes..." />
          </FormField>
        </FormRow>
      </FormSection>
    </div>
  ),
};

export const WithSpanning: Story = {
  render: () => (
    <FormSection title="With Spanning Fields">
      <FormRow cols={2}>
        <FormField>
          <Input label="First Name" placeholder="John" />
        </FormField>
        <FormField>
          <Input label="Last Name" placeholder="Doe" />
        </FormField>
        <FormField span={2}>
          <Input label="Full Address" placeholder="123 Main St, City, Country" />
        </FormField>
        <FormField>
          <Input label="City" placeholder="City" />
        </FormField>
        <FormField>
          <Input label="Postal Code" placeholder="12345" />
        </FormField>
      </FormRow>
    </FormSection>
  ),
};
