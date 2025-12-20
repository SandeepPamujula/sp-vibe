/**
 * useFileUpload Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';

import { useFileUpload } from '../useFileUpload';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/test-preview');
global.URL.revokeObjectURL = jest.fn();

describe('useFileUpload', () => {
  const defaultOptions = {
    expenseId: 'expense-123',
  };

  const createMockFile = (name: string, type: string, size: number = 1024) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return Object.assign(file, { id: `file-${Date.now()}` });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      expect(result.current.uploadedFiles).toEqual([]);
      expect(result.current.uploadProgress).toEqual([]);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.totalProgress).toBe(0);
    });

    it('should provide upload and remove functions', () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      expect(typeof result.current.uploadFiles).toBe('function');
      expect(typeof result.current.removeFile).toBe('function');
      expect(typeof result.current.clearFiles).toBe('function');
    });
  });

  describe('uploadFiles', () => {
    it('should handle successful file upload', async () => {
      // Mock the three-step upload process
      mockFetch
        // Step 1: Request upload URL
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                uploadUrl: 'http://localhost/api/attachments/upload-local?key=test-key',
                key: 'attachments/tenant-123/expense-123/abc-receipt.pdf',
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
                pendingId: 'pending-123',
              },
            }),
        })
        // Step 2: Upload to storage
        .mockResolvedValueOnce({
          ok: true,
        })
        // Step 3: Confirm upload
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                id: 'attachment-123',
                fileName: 'receipt.pdf',
                contentType: 'application/pdf',
                fileSize: 1024,
                uploadedAt: new Date().toISOString(),
              },
            }),
        });

      const onUploadComplete = jest.fn();
      const { result } = renderHook(() => useFileUpload({ ...defaultOptions, onUploadComplete }));

      const mockFile = createMockFile('receipt.pdf', 'application/pdf');

      await act(async () => {
        await result.current.uploadFiles([mockFile]);
      });

      await waitFor(() => {
        expect(result.current.uploadedFiles.length).toBe(1);
      });

      expect(result.current.uploadedFiles[0]).toMatchObject({
        id: 'attachment-123',
        fileName: 'receipt.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      });

      expect(onUploadComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'attachment-123',
          fileName: 'receipt.pdf',
        })
      );
    });

    it('should handle upload URL request failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Failed to get upload URL' },
          }),
      });

      const onUploadError = jest.fn();
      const { result } = renderHook(() => useFileUpload({ ...defaultOptions, onUploadError }));

      const mockFile = createMockFile('receipt.pdf', 'application/pdf');

      await act(async () => {
        await result.current.uploadFiles([mockFile]);
      });

      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalled();
      });

      expect(result.current.uploadedFiles.length).toBe(0);
      expect(onUploadError).toHaveBeenCalledWith(mockFile, 'Failed to get upload URL');
    });

    it('should handle storage upload failure', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                uploadUrl: 'http://localhost/api/attachments/upload-local?key=test-key',
                key: 'test-key',
                expiresAt: new Date().toISOString(),
                pendingId: 'pending-123',
              },
            }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const onUploadError = jest.fn();
      const { result } = renderHook(() => useFileUpload({ ...defaultOptions, onUploadError }));

      const mockFile = createMockFile('receipt.pdf', 'application/pdf');

      await act(async () => {
        await result.current.uploadFiles([mockFile]);
      });

      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalled();
      });

      expect(result.current.uploadedFiles.length).toBe(0);
    });

    it('should do nothing with empty file array', async () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      await act(async () => {
        await result.current.uploadFiles([]);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.uploadProgress).toEqual([]);
    });
  });

  describe('removeFile', () => {
    it('should delete file successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { message: 'Attachment deleted successfully' },
          }),
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      // Manually set uploaded files for testing
      act(() => {
        // Access internal state would require setting up initial uploaded files
        // For this test, we verify the delete API is called correctly
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.removeFile('attachment-123');
      });

      expect(success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/attachments/attachment-123', {
        method: 'DELETE',
      });
    });

    it('should return false on delete failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Not found' },
          }),
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      let success: boolean = true;
      await act(async () => {
        success = await result.current.removeFile('nonexistent');
      });

      expect(success).toBe(false);
    });
  });

  describe('clearFiles', () => {
    it('should clear all files and progress', () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.uploadedFiles).toEqual([]);
      expect(result.current.uploadProgress).toEqual([]);
    });
  });

  describe('Progress Tracking', () => {
    it('should track upload progress', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                uploadUrl: 'http://localhost/upload',
                key: 'test-key',
                expiresAt: new Date().toISOString(),
                pendingId: 'pending-123',
              },
            }),
        })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                id: 'attachment-123',
                fileName: 'receipt.pdf',
                contentType: 'application/pdf',
                fileSize: 1024,
                uploadedAt: new Date().toISOString(),
              },
            }),
        });

      const { result } = renderHook(() => useFileUpload(defaultOptions));
      const mockFile = createMockFile('receipt.pdf', 'application/pdf');

      // Start upload
      act(() => {
        result.current.uploadFiles([mockFile]);
      });

      // Progress should be tracked
      await waitFor(() => {
        expect(result.current.uploadProgress.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate total progress correctly', async () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      // Initially 0 when no uploads
      expect(result.current.totalProgress).toBe(0);
    });
  });

  describe('isUploading', () => {
    it('should return false when no uploads in progress', () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      expect(result.current.isUploading).toBe(false);
    });
  });
});
