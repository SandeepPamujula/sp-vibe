/**
 * File-related constants
 * 
 * Centralized constants for file upload validation and processing.
 */

/**
 * Allowed MIME types for invoice file uploads
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf', // PDF files
  'image/png', // PNG images
  'image/jpeg', // JPEG images
  'image/jpg', // JPG images (alias for JPEG)
  'image/heic', // HEIC images (iOS format)
] as const;

/**
 * Maximum file size in bytes (10 MB)
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Maximum file size in MB (for display purposes)
 */
export const MAX_FILE_SIZE_MB = 10;

/**
 * Maximum number of files allowed per invoice submission
 */
export const MAX_FILES_PER_INVOICE = 5;

/**
 * File type descriptions for user-friendly error messages
 */
export const ALLOWED_FILE_TYPES_DESCRIPTION = 'PDF, PNG, JPEG, or HEIC';

