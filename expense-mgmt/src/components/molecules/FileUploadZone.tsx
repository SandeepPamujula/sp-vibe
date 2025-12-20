/**
 * FileUploadZone Component
 *
 * Drag and drop file upload zone with file list preview.
 */

'use client';

import { useCallback, useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

import { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS } from '@/constants';

export interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export interface FileUploadZoneProps {
  /** Currently selected files */
  files: FileWithPreview[];
  /** Handler when files change */
  onFilesChange: (files: FileWithPreview[]) => void;
  /** Maximum number of files */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed MIME types */
  accept?: readonly string[];
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Required field indicator */
  isRequired?: boolean;
}

/**
 * Generate unique ID for file tracking
 */
function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file extension icon based on MIME type
 */
function getFileIcon(mimeType: string | undefined): string {
  if (!mimeType) return '📎';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  return '📎';
}

export function FileUploadZone({
  files,
  onFilesChange,
  maxFiles = FILE_SIZE_LIMITS.MAX_FILES,
  maxSize = FILE_SIZE_LIMITS.MAX_SIZE,
  accept = ALLOWED_MIME_TYPES,
  error,
  disabled = false,
  label,
  isRequired = false,
}: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!accept.includes(file.type)) {
        return `File type not allowed: ${file.name}`;
      }
      if (file.size > maxSize) {
        return `File too large: ${file.name} (max ${formatFileSize(maxSize)})`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const processFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setLocalError(null);
      const fileArray = Array.from(newFiles);
      const remainingSlots = maxFiles - files.length;

      if (fileArray.length > remainingSlots) {
        setLocalError(`Can only add ${remainingSlots} more file(s). Maximum ${maxFiles} files.`);
        return;
      }

      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          const fileWithPreview = file as FileWithPreview;
          fileWithPreview.id = generateFileId();
          if (file.type.startsWith('image/')) {
            fileWithPreview.preview = URL.createObjectURL(file);
          }
          validFiles.push(fileWithPreview);
        }
      }

      if (errors.length > 0) {
        setLocalError(errors.join(', '));
      }

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    },
    [files, maxFiles, validateFile, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [disabled, processFiles]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      const fileToRemove = files.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      onFilesChange(files.filter((f) => f.id !== fileId));
      setLocalError(null);
    },
    [files, onFilesChange]
  );

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const acceptString = accept.join(',');
  const canAddMore = files.length < maxFiles;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={canAddMore && !disabled ? openFilePicker : undefined}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${
            isDragActive
              ? 'border-zinc-500 bg-zinc-50 dark:bg-zinc-800/50'
              : displayError
                ? 'border-red-300 dark:border-red-800'
                : 'border-zinc-300 dark:border-zinc-600'
          }
          ${canAddMore && !disabled ? 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500' : 'cursor-default'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          multiple
          onChange={handleInputChange}
          disabled={disabled || !canAddMore}
          className="sr-only"
          aria-label="File upload"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <UploadIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {canAddMore ? (
                <>
                  Drop files here or{' '}
                  <span className="text-zinc-900 dark:text-white underline">browse</span>
                </>
              ) : (
                'Maximum files reached'
              )}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              PDF, PNG, JPEG, HEIC • Max {formatFileSize(maxSize)} per file • Up to {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <p className="mt-1.5 text-sm text-red-500" role="alert">
          {displayError}
        </p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
            >
              {/* Preview or Icon */}
              {file.preview ? (
                /* eslint-disable-next-line @next/next/no-img-element -- blob URLs from createObjectURL not supported by next/image */
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <span className="w-10 h-10 flex items-center justify-center text-xl">
                  {getFileIcon(file.type)}
                </span>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                disabled={disabled}
                className="p-1 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                aria-label={`Remove ${file.name}`}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Files count */}
      {files.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {files.length} of {maxFiles} files selected
        </p>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
