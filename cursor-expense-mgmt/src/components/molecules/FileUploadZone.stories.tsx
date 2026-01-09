/**
 * FileUploadZone Component Stories
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FileUploadZone, type FileWithPreview } from './FileUploadZone';

const meta: Meta<typeof FileUploadZone> = {
  title: 'Molecules/FileUploadZone',
  component: FileUploadZone,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create mock files
function createMockFile(name: string, size: number, type: string): FileWithPreview {
  const file = new File([''], name, { type }) as FileWithPreview;
  Object.defineProperty(file, 'size', { value: size });
  file.id = `mock-${name}`;
  return file;
}

export const Empty: Story = {
  args: {
    files: [],
    onFilesChange: () => {},
    label: 'Attachments',
  },
};

export const WithLabel: Story = {
  args: {
    files: [],
    onFilesChange: () => {},
    label: 'Receipt Attachments',
    isRequired: true,
  },
};

export const WithFiles: Story = {
  args: {
    files: [
      createMockFile('receipt-jan-2024.pdf', 1024 * 500, 'application/pdf'),
      createMockFile('invoice-001.png', 1024 * 1024 * 2, 'image/png'),
    ],
    onFilesChange: () => {},
    label: 'Attachments',
  },
};

export const MaxFilesReached: Story = {
  args: {
    files: [
      createMockFile('file1.pdf', 1024 * 100, 'application/pdf'),
      createMockFile('file2.pdf', 1024 * 200, 'application/pdf'),
      createMockFile('file3.pdf', 1024 * 300, 'application/pdf'),
      createMockFile('file4.pdf', 1024 * 400, 'application/pdf'),
      createMockFile('file5.pdf', 1024 * 500, 'application/pdf'),
    ],
    onFilesChange: () => {},
    label: 'Attachments',
    maxFiles: 5,
  },
};

export const WithError: Story = {
  args: {
    files: [],
    onFilesChange: () => {},
    label: 'Attachments',
    error: 'At least one attachment is required.',
  },
};

export const Disabled: Story = {
  args: {
    files: [createMockFile('existing-file.pdf', 1024 * 500, 'application/pdf')],
    onFilesChange: () => {},
    label: 'Attachments',
    disabled: true,
  },
};

export const CustomLimits: Story = {
  args: {
    files: [],
    onFilesChange: () => {},
    label: 'Documents',
    maxFiles: 3,
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

// Interactive story with state
function InteractiveTemplate() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  return (
    <div className="space-y-4">
      <FileUploadZone files={files} onFilesChange={setFiles} label="Upload Receipts" isRequired />
      <div className="text-sm text-zinc-500">
        <p>Files selected: {files.length}</p>
        {files.length > 0 && (
          <ul className="list-disc list-inside mt-2">
            {files.map((file) => (
              <li key={file.id}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
};

// Mixed file types
export const MixedFileTypes: Story = {
  args: {
    files: [
      createMockFile('receipt.pdf', 1024 * 500, 'application/pdf'),
      createMockFile('photo.png', 1024 * 1024 * 1.5, 'image/png'),
      createMockFile('scan.jpeg', 1024 * 800, 'image/jpeg'),
    ],
    onFilesChange: () => {},
    label: 'Attachments',
  },
};

// Large files
export const LargeFiles: Story = {
  args: {
    files: [
      createMockFile('large-document.pdf', 1024 * 1024 * 8, 'application/pdf'),
      createMockFile('high-res-image.png', 1024 * 1024 * 5, 'image/png'),
    ],
    onFilesChange: () => {},
    label: 'Large File Upload',
  },
};
