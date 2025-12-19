/**
 * Attachment DTOs
 *
 * Data transfer objects for file upload operations.
 */

/**
 * File upload request
 */
export interface UploadAttachmentDto {
  expenseId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

/**
 * Upload presigned URL response
 */
export interface UploadPresignedUrl {
  uploadUrl: string;
  s3Key: string;
  expiresAt: Date;
}

/**
 * Delete attachment request
 */
export interface DeleteAttachmentDto {
  attachmentId: string;
}
