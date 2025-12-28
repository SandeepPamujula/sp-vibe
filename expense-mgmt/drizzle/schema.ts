/**
 * Drizzle ORM Schema
 *
 * Multi-tenant expense management system schema.
 * All tables include tenant_id for row-level isolation.
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================================================
// Enums
// ============================================================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'approver']);

export const workflowTypeEnum = pgEnum('workflow_type', ['petty', 'internet']);

export const expenseStatusEnum = pgEnum('expense_status', [
  'draft',
  'submitted',
  'approved',
  'rejected',
]);

export const expenseActionEnum = pgEnum('expense_action', [
  'created',
  'submitted',
  'approved',
  'rejected',
  'updated',
]);

export const approvalStatusEnum = pgEnum('approval_status', [
  'pending',
  'approved',
  'rejected',
  'skipped', // For auto-skip based on amount thresholds
]);

// ============================================================================
// Tables
// ============================================================================

/**
 * Tenants table - Top-level multi-tenancy entity
 */
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Users table - Application users scoped to tenants
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * GL Codes table - General Ledger codes per tenant
 */
export const glCodes = pgTable('gl_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Expense Workflows table - Configurable approval workflows per tenant
 *
 * Each tenant has workflows (petty, internet, etc.) with configurable steps.
 * Currently configured for single-level approval, extensible to multi-level.
 */
export const expenseWorkflows = pgTable('expense_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(), // e.g., "Petty Cash", "Internet Expense"
  code: workflowTypeEnum('code').notNull(), // petty | internet
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Workflow Steps table - Approval levels within a workflow
 *
 * Defines the sequence of approvals required.
 * For single-level: one step with isFinal=true
 * For multi-level: multiple steps with stepOrder 1, 2, 3...
 */
export const workflowSteps = pgTable('workflow_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => expenseWorkflows.id, { onDelete: 'cascade' }),
  stepOrder: integer('step_order').notNull().default(1), // 1 for single-level
  name: varchar('name', { length: 100 }).notNull(), // e.g., "Approver Review"
  description: text('description'),
  approverRole: userRoleEnum('approver_role').notNull(), // Role required to approve
  amountThreshold: decimal('amount_threshold', { precision: 12, scale: 2 }), // Optional: skip if below
  isFinal: boolean('is_final').notNull().default(true), // true for single-level
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Expenses table - Main expense records
 */
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  submittedBy: uuid('submitted_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  workflowId: uuid('workflow_id').references(() => expenseWorkflows.id, { onDelete: 'set null' }),
  currentStepId: uuid('current_step_id').references(() => workflowSteps.id, {
    onDelete: 'set null',
  }),
  workflowType: workflowTypeEnum('workflow_type').notNull().default('petty'),
  expenseDate: date('expense_date').notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  vendorName: varchar('vendor_name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  natureOfExpense: varchar('nature_of_expense', { length: 255 }), // Nullable for drafts
  glCodeId: uuid('gl_code_id').references(() => glCodes.id, { onDelete: 'set null' }),
  purpose: text('purpose'),
  status: expenseStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Expense Approvals table - Tracks each approval decision
 *
 * One record per workflow step for each expense.
 * For single-level: one approval record per expense.
 * For multi-level: one record per step in the workflow.
 */
export const expenseApprovals = pgTable('expense_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id')
    .notNull()
    .references(() => expenses.id, { onDelete: 'cascade' }),
  workflowStepId: uuid('workflow_step_id')
    .notNull()
    .references(() => workflowSteps.id, { onDelete: 'restrict' }),
  approverId: uuid('approver_id').references(() => users.id, { onDelete: 'set null' }),
  status: approvalStatusEnum('status').notNull().default('pending'),
  comments: text('comments'),
  actedAt: timestamp('acted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Expense History table - Audit trail for expense changes
 */
export const expenseHistory = pgTable('expense_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id')
    .notNull()
    .references(() => expenses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  action: expenseActionEnum('action').notNull(),
  comments: text('comments'),
  changes: jsonb('changes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Expense Attachments table - File attachments for expenses
 */
export const expenseAttachments = pgTable('expense_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id')
    .notNull()
    .references(() => expenses.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  s3Key: varchar('s3_key', { length: 512 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// Relations
// ============================================================================

/**
 * Tenant relations
 */
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  expenses: many(expenses),
  glCodes: many(glCodes),
  workflows: many(expenseWorkflows),
}));

/**
 * User relations
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  submittedExpenses: many(expenses, { relationName: 'submitter' }),
  approvedExpenses: many(expenses, { relationName: 'approver' }),
  expenseHistoryEntries: many(expenseHistory),
  expenseApprovals: many(expenseApprovals),
}));

/**
 * GL Code relations
 */
export const glCodesRelations = relations(glCodes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [glCodes.tenantId],
    references: [tenants.id],
  }),
  expenses: many(expenses),
}));

/**
 * Expense Workflow relations
 */
export const expenseWorkflowsRelations = relations(expenseWorkflows, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [expenseWorkflows.tenantId],
    references: [tenants.id],
  }),
  steps: many(workflowSteps),
  expenses: many(expenses),
}));

/**
 * Workflow Step relations
 */
export const workflowStepsRelations = relations(workflowSteps, ({ one, many }) => ({
  workflow: one(expenseWorkflows, {
    fields: [workflowSteps.workflowId],
    references: [expenseWorkflows.id],
  }),
  approvals: many(expenseApprovals),
  currentExpenses: many(expenses, { relationName: 'currentStep' }),
}));

/**
 * Expense relations
 */
export const expensesRelations = relations(expenses, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [expenses.tenantId],
    references: [tenants.id],
  }),
  submitter: one(users, {
    fields: [expenses.submittedBy],
    references: [users.id],
    relationName: 'submitter',
  }),
  approver: one(users, {
    fields: [expenses.approvedBy],
    references: [users.id],
    relationName: 'approver',
  }),
  workflow: one(expenseWorkflows, {
    fields: [expenses.workflowId],
    references: [expenseWorkflows.id],
  }),
  currentStep: one(workflowSteps, {
    fields: [expenses.currentStepId],
    references: [workflowSteps.id],
    relationName: 'currentStep',
  }),
  glCode: one(glCodes, {
    fields: [expenses.glCodeId],
    references: [glCodes.id],
  }),
  history: many(expenseHistory),
  attachments: many(expenseAttachments),
  approvals: many(expenseApprovals),
}));

/**
 * Expense Approval relations
 */
export const expenseApprovalsRelations = relations(expenseApprovals, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseApprovals.expenseId],
    references: [expenses.id],
  }),
  workflowStep: one(workflowSteps, {
    fields: [expenseApprovals.workflowStepId],
    references: [workflowSteps.id],
  }),
  approver: one(users, {
    fields: [expenseApprovals.approverId],
    references: [users.id],
  }),
}));

/**
 * Expense History relations
 */
export const expenseHistoryRelations = relations(expenseHistory, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseHistory.expenseId],
    references: [expenses.id],
  }),
  user: one(users, {
    fields: [expenseHistory.userId],
    references: [users.id],
  }),
}));

/**
 * Expense Attachments relations
 */
export const expenseAttachmentsRelations = relations(expenseAttachments, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseAttachments.expenseId],
    references: [expenses.id],
  }),
}));

// ============================================================================
// Type Exports (for use with Drizzle's $inferSelect and $inferInsert)
// ============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type GlCode = typeof glCodes.$inferSelect;
export type NewGlCode = typeof glCodes.$inferInsert;

export type ExpenseWorkflow = typeof expenseWorkflows.$inferSelect;
export type NewExpenseWorkflow = typeof expenseWorkflows.$inferInsert;

export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type NewWorkflowStep = typeof workflowSteps.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type ExpenseApproval = typeof expenseApprovals.$inferSelect;
export type NewExpenseApproval = typeof expenseApprovals.$inferInsert;

export type ExpenseHistory = typeof expenseHistory.$inferSelect;
export type NewExpenseHistory = typeof expenseHistory.$inferInsert;

export type ExpenseAttachment = typeof expenseAttachments.$inferSelect;
export type NewExpenseAttachment = typeof expenseAttachments.$inferInsert;

// Enum type exports
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type WorkflowType = (typeof workflowTypeEnum.enumValues)[number];
export type ExpenseStatus = (typeof expenseStatusEnum.enumValues)[number];
export type ExpenseAction = (typeof expenseActionEnum.enumValues)[number];
export type ApprovalStatus = (typeof approvalStatusEnum.enumValues)[number];
