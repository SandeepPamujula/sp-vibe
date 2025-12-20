/**
 * useFileUpload Hook
 *
 * React hook for handling file uploads to the expense management system.
 * Manages the presigned URL flow: request URL -> upload to storage -> confirm.
 */

'use client';

import { useState, useCallback } from 'react';

import type { FileWithPreview } from '@/components/molecules/FileUploadZone';

// ============================================================================
// Types
// ============================================================================

export interface UploadedFile {
  /** Attachment ID from database */
  id: string;
  /** Original file name */
  fileName: string;
  /** MIME type */
  contentType: string;
  /** File size in bytes */
  fileSize: number;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Local preview URL (for images) */
  preview?: string;
}

export interface UploadProgress {
  /** File being uploaded */
  file: File;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: 'pending' | 'uploading' | 'confirming' | 'complete' | 'error';
  /** Error message if failed */
  error?: string;
}

export interface UseFileUploadOptions {
  /** Expense ID to attach files to */
  expenseId: string;
  /** Callback when a file is successfully uploaded */
  onUploadComplete?: (file: UploadedFile) => void;
  /** Callback when upload fails */
  onUploadError?: (file: File, error: string) => void;
}

export interface UseFileUploadReturn {
  /** Currently uploaded files */
  uploadedFiles: UploadedFile[];
  /** Upload progress for pending files */
  uploadProgress: UploadProgress[];
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Upload multiple files */
  uploadFiles: (files: FileWithPreview[]) => Promise<void>;
  /** Remove an uploaded file */
  removeFile: (fileId: string) => Promise<boolean>;
  /** Clear all uploaded files */
  clearFiles: () => void;
  /** Total upload progress (0-100) */
  totalProgress: number;
}

// ============================================================================
// API Helpers
// ============================================================================

interface UploadUrlResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    key: string;
    expiresAt: string;
    pendingId: string;
  };
  error?: { message: string };
}

interface ConfirmResponse {
  success: boolean;
  data?: {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
  };
  error?: { message: string };
}

async function requestUploadUrl(
  expenseId: string,
  file: File
): Promise<{ uploadUrl: string; key: string }> {
  const response = await fetch('/api/attachments/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      expenseId,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  const data: UploadUrlResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to get upload URL');
  }

  return { uploadUrl: data.data.uploadUrl, key: data.data.key };
}

async function uploadToStorage(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

async function confirmUpload(expenseId: string, file: File, s3Key: string): Promise<UploadedFile> {
  const response = await fetch('/api/attachments/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      expenseId,
      fileName: file.name,
      s3Key,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  const data: ConfirmResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to confirm upload');
  }

  return {
    id: data.data.id,
    fileName: data.data.fileName,
    contentType: data.data.contentType,
    fileSize: data.data.fileSize,
    uploadedAt: new Date(data.data.uploadedAt),
  };
}

async function deleteAttachment(attachmentId: string): Promise<boolean> {
  const response = await fetch(`/api/attachments/${attachmentId}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  return data.success;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useFileUpload({
  expenseId,
  onUploadComplete,
  onUploadError,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const isUploading = uploadProgress.some(
    (p) => p.status === 'pending' || p.status === 'uploading' || p.status === 'confirming'
  );

  const totalProgress =
    uploadProgress.length === 0
      ? 0
      : uploadProgress.reduce((sum, p) => sum + p.progress, 0) / uploadProgress.length;

  const updateProgress = useCallback((file: File, updates: Partial<UploadProgress>) => {
    setUploadProgress((prev) => prev.map((p) => (p.file === file ? { ...p, ...updates } : p)));
  }, []);

  const uploadSingleFile = useCallback(
    async (file: FileWithPreview): Promise<UploadedFile | null> => {
      try {
        // Step 1: Request presigned URL
        updateProgress(file, { status: 'uploading', progress: 20 });
        const { uploadUrl, key } = await requestUploadUrl(expenseId, file);

        // Step 2: Upload to storage
        updateProgress(file, { progress: 50 });
        await uploadToStorage(uploadUrl, file);

        // Step 3: Confirm upload
        updateProgress(file, { status: 'confirming', progress: 80 });
        const uploadedFile = await confirmUpload(expenseId, file, key);

        // Add preview if available
        if (file.preview) {
          uploadedFile.preview = file.preview;
        }

        updateProgress(file, { status: 'complete', progress: 100 });
        return uploadedFile;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        updateProgress(file, { status: 'error', error: errorMessage });
        onUploadError?.(file, errorMessage);
        return null;
      }
    },
    [expenseId, onUploadError, updateProgress]
  );

  const uploadFiles = useCallback(
    async (files: FileWithPreview[]): Promise<void> => {
      if (files.length === 0) return;

      // Initialize progress tracking
      setUploadProgress((prev) => [
        ...prev,
        ...files.map((file) => ({
          file,
          progress: 0,
          status: 'pending' as const,
        })),
      ]);

      // Upload files sequentially to avoid overwhelming the server
      for (const file of files) {
        const uploadedFile = await uploadSingleFile(file);
        if (uploadedFile) {
          setUploadedFiles((prev) => [...prev, uploadedFile]);
          onUploadComplete?.(uploadedFile);
        }
      }

      // Clean up completed/errored progress entries after a delay
      setTimeout(() => {
        setUploadProgress((prev) =>
          prev.filter((p) => p.status !== 'complete' && p.status !== 'error')
        );
      }, 2000);
    },
    [uploadSingleFile, onUploadComplete]
  );

  const removeFile = useCallback(async (fileId: string): Promise<boolean> => {
    const success = await deleteAttachment(fileId);
    if (success) {
      setUploadedFiles((prev) => {
        const file = prev.find((f) => f.id === fileId);
        if (file?.preview) {
          URL.revokeObjectURL(file.preview);
        }
        return prev.filter((f) => f.id !== fileId);
      });
    }
    return success;
  }, []);

  const clearFiles = useCallback(() => {
    // Revoke all preview URLs
    uploadedFiles.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadedFiles([]);
    setUploadProgress([]);
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    uploadProgress,
    isUploading,
    uploadFiles,
    removeFile,
    clearFiles,
    totalProgress,
  };
}
