/**
 * ApprovalModal Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { ApprovalModal } from './ApprovalModal';

const meta = {
  title: 'Molecules/ApprovalModal',
  component: ApprovalModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal component for approving or rejecting expenses with optional comments. Supports both approval and rejection workflows with validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    expenseId: {
      control: 'text',
      description: 'The ID of the expense to approve/reject',
    },
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
    onSuccess: {
      action: 'success',
      description: 'Callback when approval/rejection is successful',
    },
  },
} satisfies Meta<typeof ApprovalModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default closed state
 */
export const Closed: Story = {
  args: {
    expenseId: 'expense-123',
    isOpen: false,
    onClose: () => {},
  },
};

/**
 * Default open state
 */
export const Open: Story = {
  args: {
    expenseId: 'expense-123',
    isOpen: true,
    onClose: () => {},
  },
};

/**
 * Interactive wrapper component for Storybook
 */
function InteractiveWrapper(args: Parameters<typeof ApprovalModal>[0]) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#18181b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Open Approval Modal
      </button>
      <ApprovalModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          setIsOpen(false);
          alert('Expense approved/rejected successfully!');
        }}
      />
    </div>
  );
}

/**
 * Interactive example with state management
 */
export const Interactive: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    expenseId: 'expense-123',
    isOpen: true,
  },
};
