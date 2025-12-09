/**
 * TypeScript Interfaces and Types
 * 
 * Central export point for all application data models and types.
 * Import from this file for convenience, or import directly from specific files
 * for better tree-shaking.
 * 
 * @example
 * ```typescript
 * // Convenient import (all types)
 * import { User, Invoice, ApiResponse } from '@/types';
 * 
 * // Direct import (better for tree-shaking)
 * import { User, UserRole } from '@/types/user';
 * import { Invoice, InvoiceStatus } from '@/types/invoice';
 * ```
 */

// User types
export { UserRole } from './user';
export type { User } from './user';

// Invoice types
export { InvoiceStatus } from './invoice';
export type { Invoice, InvoiceFileMetadata } from './invoice';

// Invoice History types (unified comments and audit trail)
export { InvoiceHistoryEntryType } from './invoice-history';
export type { InvoiceHistoryEntry } from './invoice-history';

// API Response types
export type { ApiResponse } from './response';
