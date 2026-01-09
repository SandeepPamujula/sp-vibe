/**
 * FileUploadZone Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { FileUploadZone, type FileWithPreview } from '../FileUploadZone';

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

function createMockFile(name: string, size: number, type: string): FileWithPreview {
  const file = new File(['content'], name, { type }) as FileWithPreview;
  Object.defineProperty(file, 'size', { value: size, configurable: true });
  file.id = `mock-${name}-${Date.now()}`;
  return file;
}

describe('FileUploadZone', () => {
  const defaultProps = {
    files: [] as FileWithPreview[],
    onFilesChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders drop zone', () => {
      render(<FileUploadZone {...defaultProps} />);
      expect(screen.getByText(/Drop files here or/)).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<FileUploadZone {...defaultProps} label="Attachments" />);
      expect(screen.getByText('Attachments')).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
      render(<FileUploadZone {...defaultProps} label="Attachments" isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('shows file type and size restrictions', () => {
      render(<FileUploadZone {...defaultProps} />);
      expect(screen.getByText(/PDF, PNG, JPEG, HEIC/)).toBeInTheDocument();
      expect(screen.getByText(/Max 10 MB per file/)).toBeInTheDocument();
    });

    it('shows error message', () => {
      render(<FileUploadZone {...defaultProps} error="At least one file is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('At least one file is required');
    });
  });

  describe('file list', () => {
    it('renders list of files', () => {
      const files: FileWithPreview[] = [
        createMockFile('receipt.pdf', 1024, 'application/pdf'),
        createMockFile('photo.png', 2048, 'image/png'),
      ];

      render(<FileUploadZone {...defaultProps} files={files} />);

      expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
      expect(screen.getByText('photo.png')).toBeInTheDocument();
    });

    it('shows file sizes', () => {
      const files: FileWithPreview[] = [createMockFile('receipt.pdf', 1024, 'application/pdf')];

      render(<FileUploadZone {...defaultProps} files={files} />);
      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });

    it('shows file count', () => {
      const files: FileWithPreview[] = [
        createMockFile('file1.pdf', 1024, 'application/pdf'),
        createMockFile('file2.pdf', 1024, 'application/pdf'),
      ];

      render(<FileUploadZone {...defaultProps} files={files} maxFiles={5} />);
      expect(screen.getByText('2 of 5 files selected')).toBeInTheDocument();
    });
  });

  describe('file removal', () => {
    it('calls onFilesChange when removing a file', () => {
      const onFilesChange = jest.fn();
      const file1 = createMockFile('receipt.pdf', 1024, 'application/pdf');
      const file2 = createMockFile('photo.png', 2048, 'image/png');
      const files: FileWithPreview[] = [file1, file2];

      render(<FileUploadZone files={files} onFilesChange={onFilesChange} />);

      const removeButtons = screen.getAllByRole('button', { name: /Remove/ });
      fireEvent.click(removeButtons[0]);

      expect(onFilesChange).toHaveBeenCalledWith([file2]);
    });

    it('revokes object URL when removing file with preview', () => {
      const file = createMockFile('photo.png', 2048, 'image/png');
      file.preview = 'blob:mock-preview';
      const files: FileWithPreview[] = [file];

      render(<FileUploadZone {...defaultProps} files={files} />);

      const removeButton = screen.getByRole('button', { name: /Remove/ });
      fireEvent.click(removeButton);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-preview');
    });
  });

  describe('file input', () => {
    it('has correct accept attribute', () => {
      render(<FileUploadZone {...defaultProps} />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'application/pdf,image/png,image/jpeg,image/heic');
    });

    it('allows multiple file selection', () => {
      render(<FileUploadZone {...defaultProps} />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('multiple');
    });

    it('is hidden but accessible', () => {
      render(<FileUploadZone {...defaultProps} />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveClass('sr-only');
    });
  });

  describe('max files limit', () => {
    it('shows maximum files reached message when limit hit', () => {
      const files: FileWithPreview[] = [
        createMockFile('file1.pdf', 1024, 'application/pdf'),
        createMockFile('file2.pdf', 1024, 'application/pdf'),
      ];

      render(<FileUploadZone {...defaultProps} files={files} maxFiles={2} />);
      expect(screen.getByText('Maximum files reached')).toBeInTheDocument();
    });

    it('disables file input when max files reached', () => {
      const files: FileWithPreview[] = [
        createMockFile('file1.pdf', 1024, 'application/pdf'),
        createMockFile('file2.pdf', 1024, 'application/pdf'),
      ];

      render(<FileUploadZone {...defaultProps} files={files} maxFiles={2} />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeDisabled();
    });
  });

  describe('disabled state', () => {
    it('disables file input when disabled', () => {
      render(<FileUploadZone {...defaultProps} disabled />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeDisabled();
    });

    it('disables remove buttons when disabled', () => {
      const files: FileWithPreview[] = [createMockFile('file1.pdf', 1024, 'application/pdf')];

      render(<FileUploadZone {...defaultProps} files={files} disabled />);
      const removeButton = screen.getByRole('button', { name: /Remove/ });
      expect(removeButton).toBeDisabled();
    });
  });

  describe('file validation', () => {
    it('processes valid files', async () => {
      const onFilesChange = jest.fn();
      render(<FileUploadZone files={[]} onFilesChange={onFilesChange} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = createMockFile('valid.pdf', 1024, 'application/pdf');

      // Create a FileList-like object
      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(onFilesChange).toHaveBeenCalled();
      });
    });
  });

  describe('drag and drop', () => {
    it('shows active state on drag over', () => {
      const { container } = render(<FileUploadZone {...defaultProps} />);
      const dropZone = container.querySelector('.border-dashed');

      fireEvent.dragOver(dropZone!);

      expect(dropZone).toHaveClass('border-zinc-500');
    });

    it('removes active state on drag leave', () => {
      const { container } = render(<FileUploadZone {...defaultProps} />);
      const dropZone = container.querySelector('.border-dashed');

      fireEvent.dragOver(dropZone!);
      fireEvent.dragLeave(dropZone!);

      expect(dropZone).not.toHaveClass('border-zinc-500');
    });
  });
});
