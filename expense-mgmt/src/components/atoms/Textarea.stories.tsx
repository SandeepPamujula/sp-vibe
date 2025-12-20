/**
 * Textarea Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Atoms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Description',
    defaultValue:
      'This is a sample description that demonstrates how the textarea looks with content.',
  },
};

export const Required: Story = {
  args: {
    label: 'Purpose',
    placeholder: 'Describe the purpose of this expense...',
    isRequired: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Add any additional comments...',
    helperText: 'Optional: Add any notes for the approver.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Purpose',
    defaultValue: 'Too short',
    error: 'Purpose must be at least 20 characters.',
  },
};

export const WithCharacterCount: Story = {
  args: {
    label: 'Purpose',
    placeholder: 'Describe the purpose...',
    maxLength: 500,
    showCount: true,
    defaultValue: 'This is a sample text to show the character count feature.',
  },
};

export const CharacterCountNearLimit: Story = {
  args: {
    label: 'Purpose',
    maxLength: 100,
    showCount: true,
    defaultValue:
      'This text is intentionally long to demonstrate the warning state when approaching the character limit.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Description',
    defaultValue: 'This field is disabled and cannot be edited.',
    disabled: true,
  },
};

export const LongContent: Story = {
  args: {
    label: 'Detailed Notes',
    defaultValue: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  },
};
