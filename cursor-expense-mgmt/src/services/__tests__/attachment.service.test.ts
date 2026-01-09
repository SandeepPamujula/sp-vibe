/**
 * @jest-environment node
 */

// Mock the schema before importing anything that uses it
jest.mock('../../../drizzle/schema', () => ({
  expenseAttachments: {
    id: 'id',
    expenseId: 'expense_id',
    fileName: 'file_name',
    s3Key: 's3_key',
    contentType: 'content_type',
    fileSize: 'file_size',
    uploadedAt: 'uploaded_at',
  },
  expenses: {
    id: 'id',
    tenantId: 'tenant_id',
    status: 'status',
  },
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value, type: 'eq' })),
  and: jest.fn((...conditions) => ({ conditions, type: 'and' })),
}));

// Track mock calls
let mockDbResult: unknown[] = [];
const mockInsertResult = [
  {
    id: 'attachment-123',
    expenseId: 'expense-456',
    fileName: 'receipt.pdf',
    s3Key: 'attachments/tenant-123/expense-456/abc-receipt.pdf',
    contentType: 'application/pdf',
    fileSize: 1024,
    uploadedAt: new Date(),
  },
];

// Mock the database with chained methods
jest.mock('@/lib/db', () => {
  const createChain = (result: unknown[] = []) => ({
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(() => result),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn(() => result),
  });

  return {
    db: {
      select: jest.fn(() => createChain(mockDbResult)),
      insert: jest.fn(() => ({
        values: jest.fn(() => ({
          returning: jest.fn(() => mockInsertResult),
        })),
      })),
      delete: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve()),
      })),
    },
  };
});

// Mock the storage service
const mockGetUploadUrl = jest.fn();
const mockGetDownloadUrl = jest.fn();
const mockDeleteFile = jest.fn();

jest.mock('@/lib/storage', () => ({
  storage: {
    getUploadUrl: (...args: unknown[]) => mockGetUploadUrl(...args),
    getDownloadUrl: (...args: unknown[]) => mockGetDownloadUrl(...args),
    deleteFile: (...args: unknown[]) => mockDeleteFile(...args),
  },
}));

// Import after all mocks are set up
import { db } from '@/lib/db';

import {
  getAttachmentCount,
  validateExpenseOwnership,
  requestUploadUrl,
  confirmUpload,
  getExpenseAttachments,
} from '../attachment.service';

describe('Attachment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbResult = [];
  });

  describe('getAttachmentCount', () => {
    it('should return the count of attachments for an expense', async () => {
      mockDbResult = [{ id: '1' }, { id: '2' }];

      // Need to reset the mock with new result
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => mockDbResult),
      }));

      const count = await getAttachmentCount('expense-123');

      expect(db.select).toHaveBeenCalled();
      expect(count).toBe(2);
    });

    it('should return 0 when no attachments exist', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => []),
      }));

      const count = await getAttachmentCount('expense-123');

      expect(count).toBe(0);
    });
  });

  describe('validateExpenseOwnership', () => {
    it('should return true when expense belongs to tenant', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => [{ id: 'expense-123' }]),
      }));

      const result = await validateExpenseOwnership('expense-123', 'tenant-123');

      expect(result).toBe(true);
    });

    it('should return false when expense not found', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      const result = await validateExpenseOwnership('expense-123', 'tenant-123');

      expect(result).toBe(false);
    });
  });

  describe('requestUploadUrl', () => {
    beforeEach(() => {
      mockGetUploadUrl.mockResolvedValue({
        uploadUrl: 'https://storage.example.com/upload',
        key: 'attachments/tenant-123/expense-456/abc-receipt.pdf',
        expiresAt: new Date(Date.now() + 3600000),
      });
    });

    it('should throw error when expense not found', async () => {
      (db.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []),
      }));

      await expect(
        requestUploadUrl({
          tenantId: 'tenant-123',
          expenseId: 'expense-456',
          fileName: 'receipt.pdf',
          contentType: 'application/pdf',
          fileSize: 1024,
        })
      ).rejects.toThrow('Expense not found or access denied');
    });

    it('should throw error when max files reached', async () => {
      // First call for validateExpenseOwnership - expense exists
      // Second call for getAttachmentCount - 5 files already
      let callCount = 0;
      (db.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => {
          callCount++;
          if (callCount === 1) {
            // validateExpenseOwnership query - return with limit
            return {
              limit: jest.fn(() => [{ id: 'expense-456' }]),
            };
          }
          // getAttachmentCount query - return 5 files
          return [{}, {}, {}, {}, {}];
        }),
      }));

      await expect(
        requestUploadUrl({
          tenantId: 'tenant-123',
          expenseId: 'expense-456',
          fileName: 'receipt.pdf',
          contentType: 'application/pdf',
          fileSize: 1024,
        })
      ).rejects.toThrow('Maximum 5 attachments allowed per expense');
    });

    it('should return upload URL when valid', async () => {
      let callCount = 0;
      (db.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn(() => {
          callCount++;
          if (callCount === 1) {
            return { limit: jest.fn(() => [{ id: 'expense-456' }]) };
          }
          return []; // No existing attachments
        }),
      }));

      const result = await requestUploadUrl({
        tenantId: 'tenant-123',
        expenseId: 'expense-456',
        fileName: 'receipt.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      });

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('expiresAt');
      expect(result).toHaveProperty('pendingId');
      expect(mockGetUploadUrl).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        expenseId: 'expense-456',
        fileName: 'receipt.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      });
    });
  });

  describe('confirmUpload', () => {
    it('should create an attachment record', async () => {
      const result = await confirmUpload({
        expenseId: 'expense-456',
        fileName: 'receipt.pdf',
        s3Key: 'attachments/tenant-123/expense-456/abc-receipt.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      });

      expect(db.insert).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'attachment-123');
      expect(result).toHaveProperty('fileName', 'receipt.pdf');
      expect(result).toHaveProperty('contentType', 'application/pdf');
      expect(result).toHaveProperty('fileSize', 1024);
      expect(result).toHaveProperty('uploadedAt');
    });
  });

  describe('getExpenseAttachments', () => {
    it('should return empty array when no attachments', async () => {
      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => []),
      }));

      const result = await getExpenseAttachments('expense-123');

      expect(result).toEqual([]);
    });

    it('should return formatted attachments', async () => {
      const mockAttachments = [
        {
          id: 'att-1',
          fileName: 'receipt1.pdf',
          contentType: 'application/pdf',
          fileSize: 1024,
          uploadedAt: new Date('2024-01-01'),
        },
        {
          id: 'att-2',
          fileName: 'receipt2.png',
          contentType: 'image/png',
          fileSize: 2048,
          uploadedAt: new Date('2024-01-02'),
        },
      ];

      (db.select as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn(() => mockAttachments),
      }));

      const result = await getExpenseAttachments('expense-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'att-1',
        fileName: 'receipt1.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
        uploadedAt: new Date('2024-01-01'),
      });
    });
  });
});

describe('Attachment Service - Function Exports', () => {
  it('should export all required functions', () => {
    expect(typeof getAttachmentCount).toBe('function');
    expect(typeof validateExpenseOwnership).toBe('function');
    expect(typeof requestUploadUrl).toBe('function');
    expect(typeof confirmUpload).toBe('function');
    expect(typeof getExpenseAttachments).toBe('function');
  });
});
