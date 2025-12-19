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
  Expense,
  NewExpense,
  ExpenseHistory,
  NewExpenseHistory,
  ExpenseAttachment,
  NewExpenseAttachment,
  UserRole,
  WorkflowType,
  ExpenseStatus,
  ExpenseAction,
} from '../../../drizzle/schema';
