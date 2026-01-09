/**
 * Storage Service
 *
 * Abstraction layer for file storage that supports:
 * - Local filesystem in development
 * - Amazon S3 in production
 *
 * Provides presigned URLs for secure direct uploads from the client.
 */

import { createHash } from 'crypto';
import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import { join, dirname } from 'path';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { awsConfig, s3Config, features } from './config';
import { isDevelopment } from './env';

// ============================================================================
// Types
// ============================================================================

export interface PresignedUrlResult {
  /** Presigned URL for uploading the file */
  uploadUrl: string;
  /** S3 key (or local path) where the file will be stored */
  key: string;
  /** URL expiration timestamp */
  expiresAt: Date;
}

export interface DownloadUrlResult {
  /** Presigned URL for downloading the file */
  downloadUrl: string;
  /** URL expiration timestamp */
  expiresAt: Date;
}

export interface StorageService {
  /** Generate a presigned URL for uploading a file */
  getUploadUrl(params: {
    tenantId: string;
    expenseId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
  }): Promise<PresignedUrlResult>;

  /** Generate a presigned URL for downloading a file */
  getDownloadUrl(key: string): Promise<DownloadUrlResult>;

  /** Delete a file from storage */
  deleteFile(key: string): Promise<void>;
}

// ============================================================================
// S3 Storage Implementation
// ============================================================================

/**
 * S3 client singleton
 */
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: awsConfig.region,
      credentials: awsConfig.isConfigured
        ? {
            accessKeyId: awsConfig.credentials.accessKeyId!,
            secretAccessKey: awsConfig.credentials.secretAccessKey!,
          }
        : undefined,
    });
  }
  return s3Client;
}

/**
 * Generate a unique S3 key for an attachment
 */
function generateS3Key(tenantId: string, expenseId: string, fileName: string): string {
  const timestamp = Date.now();
  const hash = createHash('md5')
    .update(`${tenantId}-${expenseId}-${fileName}-${timestamp}`)
    .digest('hex')
    .slice(0, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `${s3Config.UPLOAD_PREFIX}/${tenantId}/${expenseId}/${hash}-${sanitizedFileName}`;
}

const s3Storage: StorageService = {
  async getUploadUrl({ tenantId, expenseId, fileName, contentType, fileSize }) {
    const client = getS3Client();
    const key = generateS3Key(tenantId, expenseId, fileName);

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
      Metadata: {
        'tenant-id': tenantId,
        'expense-id': expenseId,
        'original-filename': fileName,
      },
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: s3Config.PRESIGNED_URL_EXPIRES,
    });

    const expiresAt = new Date(Date.now() + s3Config.PRESIGNED_URL_EXPIRES * 1000);

    return { uploadUrl, key, expiresAt };
  },

  async getDownloadUrl(key) {
    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(client, command, {
      expiresIn: s3Config.PRESIGNED_URL_EXPIRES,
    });

    const expiresAt = new Date(Date.now() + s3Config.PRESIGNED_URL_EXPIRES * 1000);

    return { downloadUrl, expiresAt };
  },

  async deleteFile(key) {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    });

    await client.send(command);
  },
};

// ============================================================================
// Local Storage Implementation (Development)
// ============================================================================

const LOCAL_STORAGE_DIR = join(process.cwd(), '.local-storage', 'attachments');

const localStorage: StorageService = {
  async getUploadUrl({ tenantId, expenseId, fileName, contentType }) {
    const key = generateS3Key(tenantId, expenseId, fileName);

    // In development, we return a local API endpoint for uploading
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const uploadUrl = `${baseUrl}/api/attachments/upload-local?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`;

    const expiresAt = new Date(Date.now() + s3Config.PRESIGNED_URL_EXPIRES * 1000);

    return { uploadUrl, key, expiresAt };
  },

  async getDownloadUrl(key) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/attachments/download-local?key=${encodeURIComponent(key)}`;

    const expiresAt = new Date(Date.now() + s3Config.PRESIGNED_URL_EXPIRES * 1000);

    return { downloadUrl, expiresAt };
  },

  async deleteFile(key) {
    const filePath = join(LOCAL_STORAGE_DIR, key);
    try {
      await unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  },
};

// ============================================================================
// Local Storage Helpers (for local API routes)
// ============================================================================

/**
 * Save a file to local storage (development only)
 */
export async function saveLocalFile(key: string, data: Buffer): Promise<void> {
  if (!isDevelopment) {
    throw new Error('Local file storage is only available in development');
  }

  const filePath = join(LOCAL_STORAGE_DIR, key);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
}

/**
 * Read a file from local storage (development only)
 */
export async function readLocalFile(key: string): Promise<Buffer> {
  if (!isDevelopment) {
    throw new Error('Local file storage is only available in development');
  }

  const filePath = join(LOCAL_STORAGE_DIR, key);
  return readFile(filePath);
}

// ============================================================================
// Export Storage Service
// ============================================================================

/**
 * Storage service instance
 *
 * Automatically uses S3 in production when configured,
 * falls back to local filesystem in development.
 */
export const storage: StorageService = features.s3Uploads ? s3Storage : localStorage;

/**
 * Check if using S3 storage
 */
export const isUsingS3 = features.s3Uploads;
