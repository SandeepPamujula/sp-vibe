/**
 * Report DTOs
 *
 * Data transfer objects for report generation.
 */

import type { ExpenseStatus, WorkflowType } from '../../../drizzle/schema';

/**
 * Report generation request
 */
export interface GenerateReportDto {
  reportType: 'expense-summary' | 'expense-detail' | 'audit-trail';
  startDate: string;
  endDate: string;
  workflowType?: WorkflowType;
  status?: ExpenseStatus;
  format: 'excel' | 'pdf';
}

/**
 * Report download response
 */
export interface ReportDownloadResponse {
  downloadUrl: string;
  fileName: string;
  expiresAt: Date;
}
