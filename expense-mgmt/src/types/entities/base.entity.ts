/**
 * Base Entity Types
 *
 * Re-exports base types inferred from Drizzle schema.
 */

export type {
  Tenant,
  NewTenant,
  User,
  NewUser,
  GlCode,
  NewGlCode,
  ExpenseWorkflow,
  NewExpenseWorkflow,
  WorkflowStep,
  NewWorkflowStep,
  Expense,
  NewExpense,
  ExpenseApproval,
  NewExpenseApproval,
  ExpenseHistory,
  NewExpenseHistory,
  ExpenseAttachment,
  NewExpenseAttachment,
  UserRole,
  WorkflowType,
  ExpenseStatus,
  ExpenseAction,
  ApprovalStatus,
} from '../../../drizzle/schema';
