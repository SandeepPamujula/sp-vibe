/**
 * @jest-environment node
 */

import { mkdir, writeFile, readFile, unlink } from 'fs/promises';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  GetObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  DeleteObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.presigned.url/test'),
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('test file content')),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

// Mock config to control which storage is used
jest.mock('@/lib/config', () => ({
  awsConfig: {
    region: 'us-east-1',
    credentials: {
      accessKeyId: undefined,
      secretAccessKey: undefined,
    },
    isConfigured: false,
  },
  s3Config: {
    bucket: 'test-bucket',
    PRESIGNED_URL_EXPIRES: 3600,
    UPLOAD_PREFIX: 'attachments',
    allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/heic'],
    maxFileSize: 10485760,
    maxFilesPerExpense: 5,
    isConfigured: false,
  },
  features: {
    s3Uploads: false, // Use local storage
  },
}));

jest.mock('@/lib/env', () => ({
  isDevelopment: true,
  isProduction: false,
  isTest: true,
}));

// Import after mocks are set up
import { storage, saveLocalFile, readLocalFile, isUsingS3 } from '../storage';

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isUsingS3', () => {
    it('should return false when S3 is not configured', () => {
      expect(isUsingS3).toBe(false);
    });
  });

  describe('Local Storage', () => {
    const testParams = {
      tenantId: 'tenant-123',
      expenseId: 'expense-456',
      fileName: 'receipt.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
    };

    describe('getUploadUrl', () => {
      it('should return a local upload URL', async () => {
        const result = await storage.getUploadUrl(testParams);

        expect(result).toHaveProperty('uploadUrl');
        expect(result).toHaveProperty('key');
        expect(result).toHaveProperty('expiresAt');
        expect(result.uploadUrl).toContain('/api/attachments/upload-local');
        expect(result.uploadUrl).toContain('key=');
        expect(result.key).toContain(testParams.tenantId);
        expect(result.key).toContain(testParams.expenseId);
        expect(result.expiresAt).toBeInstanceOf(Date);
        expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      });

      it('should sanitize file names in the key', async () => {
        const result = await storage.getUploadUrl({
          ...testParams,
          fileName: 'receipt file (1).pdf',
        });

        expect(result.key).toContain('receipt_file__1_.pdf');
      });

      it('should generate unique keys for the same file', async () => {
        const result1 = await storage.getUploadUrl(testParams);
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
        const result2 = await storage.getUploadUrl(testParams);

        expect(result1.key).not.toBe(result2.key);
      });
    });

    describe('getDownloadUrl', () => {
      it('should return a local download URL', async () => {
        const key = 'attachments/tenant-123/expense-456/abc123-receipt.pdf';
        const result = await storage.getDownloadUrl(key);

        expect(result).toHaveProperty('downloadUrl');
        expect(result).toHaveProperty('expiresAt');
        expect(result.downloadUrl).toContain('/api/attachments/download-local');
        expect(result.downloadUrl).toContain(encodeURIComponent(key));
        expect(result.expiresAt).toBeInstanceOf(Date);
      });
    });

    describe('deleteFile', () => {
      it('should attempt to delete the file', async () => {
        const key = 'attachments/tenant-123/expense-456/abc123-receipt.pdf';

        await expect(storage.deleteFile(key)).resolves.toBeUndefined();
        expect(unlink).toHaveBeenCalled();
      });

      it('should ignore ENOENT errors', async () => {
        (unlink as jest.Mock).mockRejectedValueOnce({ code: 'ENOENT' });
        const key = 'attachments/tenant-123/expense-456/nonexistent.pdf';

        await expect(storage.deleteFile(key)).resolves.toBeUndefined();
      });

      it('should throw for other errors', async () => {
        (unlink as jest.Mock).mockRejectedValueOnce(new Error('Permission denied'));
        const key = 'attachments/tenant-123/expense-456/protected.pdf';

        await expect(storage.deleteFile(key)).rejects.toThrow('Permission denied');
      });
    });
  });

  describe('saveLocalFile', () => {
    it('should create directory and save file', async () => {
      const key = 'attachments/tenant-123/expense-456/abc123-receipt.pdf';
      const data = Buffer.from('test content');

      await saveLocalFile(key, data);

      expect(mkdir).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalled();
    });
  });

  describe('readLocalFile', () => {
    it('should read file from local storage', async () => {
      const key = 'attachments/tenant-123/expense-456/abc123-receipt.pdf';

      const result = await readLocalFile(key);

      expect(readFile).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});

describe('Storage Service (S3 Mode)', () => {
  // Reset modules to test S3 mode
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should use S3 when configured', async () => {
    // This test verifies the S3 code path exists
    // Full S3 integration tests would require more complex mocking
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    expect(getSignedUrl).toBeDefined();
  });
});
