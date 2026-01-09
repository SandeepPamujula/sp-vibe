/**
 * File Upload Constants
 *
 * Allowed file types, size limits, and upload configuration.
 */

/**
 * Allowed MIME types for attachments
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/heic',
] as const;

/**
 * File extension to MIME type mapping
 */
export const EXTENSION_MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.heic': 'image/heic',
};

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  /** Maximum file size: 10 MB */
  MAX_SIZE: 10 * 1024 * 1024,
  /** Maximum files per expense */
  MAX_FILES: 5,
} as const;

/**
 * S3 configuration
 */
export const S3_CONFIG = {
  /** Presigned URL expiration in seconds (1 hour) */
  PRESIGNED_URL_EXPIRES: 60 * 60,
  /** Upload folder prefix */
  UPLOAD_PREFIX: 'attachments',
} as const;
