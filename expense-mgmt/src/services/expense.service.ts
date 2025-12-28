/**
 * Expense Service
 *
 * Business logic for expense CRUD operations and workflow integration.
 * Handles creating, updating, submitting, and retrieving expenses.
 */

import { eq, and, desc, asc, like, or, gte, lte, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import type {
  ExpenseWithRelations,
  ExpenseSummary,
  WorkflowStepSummary,
  ApprovalSummary,
} from '@/types/entities';

import {
  expenses,
  expenseApprovals,
  expenseHistory,
  expenseWorkflows,
  workflowSteps,
  users,
  glCodes,
  expenseAttachments,
  type WorkflowType,
  type ExpenseStatus,
} from '../../drizzle/schema';

// ============================================================================
// Types
// ============================================================================

export interface CreateExpenseParams {
  tenantId: string;
  userId: string;
  workflowType?: WorkflowType;
  expenseDate: string;
  invoiceNumber?: string;
  vendorName: string;
  amount: number;
  /** GL Code ID - will be mapped to glCodeId and natureOfExpense (description). Optional for drafts. */
  natureOfExpense?: string;
  purpose?: string;
}

export interface UpdateExpenseParams {
  expenseDate?: string;
  invoiceNumber?: string | null;
  vendorName?: string;
  amount?: number;
  /** GL Code ID - will be mapped to glCodeId and natureOfExpense (description) */
  natureOfExpense?: string;
  purpose?: string | null;
}

export interface SubmitExpenseResult {
  expenseId: string;
  workflowId: string;
  currentStepId: string;
  approvalId: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get GL code by ID for a tenant
 * Returns the GL code details for mapping natureOfExpense
 */
async function getGlCodeById(
  glCodeId: string,
  tenantId: string
): Promise<{ id: string; code: string; description: string } | null> {
  const result = await db
    .select({
      id: glCodes.id,
      code: glCodes.code,
      description: glCodes.description,
    })
    .from(glCodes)
    .where(
      and(eq(glCodes.id, glCodeId), eq(glCodes.tenantId, tenantId), eq(glCodes.isActive, true))
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get workflow for a tenant by workflow type
 */
async function getWorkflowByType(
  tenantId: string,
  workflowType: WorkflowType
): Promise<{ id: string; name: string; code: WorkflowType } | null> {
  const result = await db
    .select({
      id: expenseWorkflows.id,
      name: expenseWorkflows.name,
      code: expenseWorkflows.code,
    })
    .from(expenseWorkflows)
    .where(
      and(
        eq(expenseWorkflows.tenantId, tenantId),
        eq(expenseWorkflows.code, workflowType),
        eq(expenseWorkflows.isActive, true)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get first workflow step for a workflow
 */
async function getFirstWorkflowStep(workflowId: string): Promise<WorkflowStepSummary | null> {
  const result = await db
    .select({
      id: workflowSteps.id,
      stepOrder: workflowSteps.stepOrder,
      name: workflowSteps.name,
      approverRole: workflowSteps.approverRole,
      isFinal: workflowSteps.isFinal,
    })
    .from(workflowSteps)
    .where(and(eq(workflowSteps.workflowId, workflowId), eq(workflowSteps.isActive, true)))
    .orderBy(asc(workflowSteps.stepOrder))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Map expense row to summary
 */
function mapToExpenseSummary(
  expense: typeof expenses.$inferSelect,
  submitterName: string
): ExpenseSummary {
  return {
    id: expense.id,
    expenseDate: expense.expenseDate,
    vendorName: expense.vendorName,
    amount: expense.amount,
    natureOfExpense: expense.natureOfExpense,
    status: expense.status,
    workflowType: expense.workflowType,
    submitterName,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new expense in draft status
 *
 * The `natureOfExpense` param is a GL Code ID. This function will:
 * 1. Look up the GL code to validate it exists (if provided)
 * 2. Store the GL code description as `natureOfExpense` (if provided)
 * 3. Store the GL code ID as `glCodeId` (if provided)
 *
 * For drafts, natureOfExpense can be null and filled in later.
 */
export async function createExpense(params: CreateExpenseParams): Promise<string> {
  const {
    tenantId,
    userId,
    workflowType = 'petty',
    expenseDate,
    invoiceNumber,
    vendorName,
    amount,
    natureOfExpense: glCodeIdInput,
    purpose,
  } = params;

  // Look up GL code to get description (if provided)
  let glCode: { id: string; code: string; description: string } | null = null;

  if (glCodeIdInput) {
    glCode = await getGlCodeById(glCodeIdInput, tenantId);
    if (!glCode) {
      throw new Error('Invalid nature of expense selection');
    }
  }

  // Get workflow for this type (just to validate it exists)
  const workflow = await getWorkflowByType(tenantId, workflowType);
  if (!workflow) {
    throw new Error(`No active workflow found for type: ${workflowType}`);
  }

  // Create the expense with mapped values
  const result = await db
    .insert(expenses)
    .values({
      tenantId,
      submittedBy: userId,
      workflowType,
      expenseDate,
      invoiceNumber: invoiceNumber ?? null,
      vendorName,
      amount: amount.toFixed(2),
      natureOfExpense: glCode?.description ?? null, // Store description or null
      glCodeId: glCode?.id ?? null, // Store GL code ID or null
      purpose: purpose ?? null,
      status: 'draft',
    })
    .returning({ id: expenses.id });

  const expenseId = result[0]?.id;
  if (!expenseId) {
    throw new Error('Failed to create expense');
  }

  // Log history entry for creation
  await db.insert(expenseHistory).values({
    expenseId,
    userId,
    action: 'created',
    comments: 'Expense created',
    changes: { initial: true },
  });

  return expenseId;
}

/**
 * Update an existing expense (draft only)
 *
 * The `natureOfExpense` param is a GL Code ID. This function will:
 * 1. Look up the GL code to validate it exists
 * 2. Store the GL code description as `natureOfExpense`
 * 3. Store the GL code ID as `glCodeId`
 */
export async function updateExpense(
  expenseId: string,
  tenantId: string,
  userId: string,
  updates: UpdateExpenseParams
): Promise<void> {
  // Get current expense
  const current = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.tenantId, tenantId)))
    .limit(1);

  const expense = current[0];
  if (!expense) {
    throw new Error('Expense not found');
  }

  if (expense.status !== 'draft') {
    throw new Error('Only draft expenses can be updated');
  }

  // Build update object
  const updateData: Partial<typeof expenses.$inferInsert> = {
    updatedAt: new Date(),
  };

  const changes: Record<string, { from: unknown; to: unknown }> = {};

  if (updates.expenseDate !== undefined) {
    changes.expenseDate = { from: expense.expenseDate, to: updates.expenseDate };
    updateData.expenseDate = updates.expenseDate;
  }

  if (updates.invoiceNumber !== undefined) {
    changes.invoiceNumber = { from: expense.invoiceNumber, to: updates.invoiceNumber };
    updateData.invoiceNumber = updates.invoiceNumber;
  }

  if (updates.vendorName !== undefined) {
    changes.vendorName = { from: expense.vendorName, to: updates.vendorName };
    updateData.vendorName = updates.vendorName;
  }

  if (updates.amount !== undefined) {
    changes.amount = { from: expense.amount, to: updates.amount.toFixed(2) };
    updateData.amount = updates.amount.toFixed(2);
  }

  // Handle natureOfExpense update (it's a GL Code ID)
  if (updates.natureOfExpense !== undefined) {
    // If natureOfExpense is provided and not empty, validate and update
    if (updates.natureOfExpense) {
      const glCode = await getGlCodeById(updates.natureOfExpense, tenantId);
      if (!glCode) {
        throw new Error('Invalid nature of expense selection');
      }
      changes.natureOfExpense = { from: expense.natureOfExpense, to: glCode.description };
      changes.glCodeId = { from: expense.glCodeId, to: glCode.id };
      updateData.natureOfExpense = glCode.description;
      updateData.glCodeId = glCode.id;
    } else {
      // Clear natureOfExpense (set to null)
      changes.natureOfExpense = { from: expense.natureOfExpense, to: null };
      changes.glCodeId = { from: expense.glCodeId, to: null };
      updateData.natureOfExpense = null;
      updateData.glCodeId = null;
    }
  }

  if (updates.purpose !== undefined) {
    changes.purpose = { from: expense.purpose, to: updates.purpose };
    updateData.purpose = updates.purpose;
  }

  // Update expense
  await db.update(expenses).set(updateData).where(eq(expenses.id, expenseId));

  // Log history entry for update
  if (Object.keys(changes).length > 0) {
    await db.insert(expenseHistory).values({
      expenseId,
      userId,
      action: 'updated',
      comments: 'Expense updated',
      changes,
    });
  }
}

/**
 * Delete a draft expense
 */
export async function deleteExpense(expenseId: string, tenantId: string): Promise<boolean> {
  // Check expense exists and is draft
  const result = await db
    .select({ id: expenses.id, status: expenses.status })
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.tenantId, tenantId)))
    .limit(1);

  const expense = result[0];
  if (!expense) {
    return false;
  }

  if (expense.status !== 'draft') {
    throw new Error('Only draft expenses can be deleted');
  }

  // Delete expense (cascades to history, approvals, attachments)
  await db.delete(expenses).where(eq(expenses.id, expenseId));

  return true;
}

// ============================================================================
// Submission & Workflow
// ============================================================================

/**
 * Submit an expense for approval
 *
 * This function:
 * 1. Validates the expense is in draft status
 * 2. Validates required fields are filled (including natureOfExpense)
 * 3. Links the expense to the appropriate workflow
 * 4. Creates an expense_approval record for the first workflow step
 * 5. Sets the expense's current_step_id to the pending step
 * 6. Updates the expense status to 'submitted'
 */
export async function submitExpense(
  expenseId: string,
  tenantId: string,
  userId: string
): Promise<SubmitExpenseResult> {
  // Get expense with validation
  const expenseResult = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.tenantId, tenantId)))
    .limit(1);

  const expense = expenseResult[0];
  if (!expense) {
    throw new Error('Expense not found');
  }

  if (expense.status !== 'draft') {
    throw new Error('Only draft expenses can be submitted');
  }

  // Verify the submitter is the owner
  if (expense.submittedBy !== userId) {
    throw new Error('Only the expense owner can submit');
  }

  // Validate required fields for submission
  if (!expense.glCodeId || !expense.natureOfExpense) {
    throw new Error('Nature of expense is required for submission');
  }

  if (!expense.amount || parseFloat(expense.amount) <= 0) {
    throw new Error('Valid amount is required for submission');
  }

  // Get workflow for this expense type
  const workflow = await getWorkflowByType(tenantId, expense.workflowType);
  if (!workflow) {
    throw new Error(`No active workflow found for type: ${expense.workflowType}`);
  }

  // Get first workflow step
  const firstStep = await getFirstWorkflowStep(workflow.id);
  if (!firstStep) {
    throw new Error('No active workflow steps found');
  }

  // Create expense approval record for the first step
  const approvalResult = await db
    .insert(expenseApprovals)
    .values({
      expenseId,
      workflowStepId: firstStep.id,
      status: 'pending',
    })
    .returning({ id: expenseApprovals.id });

  const approvalId = approvalResult[0]?.id;
  if (!approvalId) {
    throw new Error('Failed to create approval record');
  }

  // Update expense with workflow info and status
  await db
    .update(expenses)
    .set({
      workflowId: workflow.id,
      currentStepId: firstStep.id,
      status: 'submitted',
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, expenseId));

  // Log history entry for submission
  await db.insert(expenseHistory).values({
    expenseId,
    userId,
    action: 'submitted',
    comments: 'Submitted for approval',
    changes: { status: { from: 'draft', to: 'submitted' } },
  });

  return {
    expenseId,
    workflowId: workflow.id,
    currentStepId: firstStep.id,
    approvalId,
  };
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get expense by ID with all relations
 */
export async function getExpenseById(
  expenseId: string,
  tenantId: string
): Promise<ExpenseWithRelations | null> {
  // Get expense with submitter, approver, and GL code
  const result = await db
    .select({
      expense: expenses,
      submitter: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(expenses)
    .innerJoin(users, eq(users.id, expenses.submittedBy))
    .where(and(eq(expenses.id, expenseId), eq(expenses.tenantId, tenantId)))
    .limit(1);

  const row = result[0];
  if (!row) {
    return null;
  }

  const { expense, submitter } = row;

  // Get approver if exists
  let approver: { id: string; name: string; email: string } | null = null;
  if (expense.approvedBy) {
    const approverResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, expense.approvedBy))
      .limit(1);
    approver = approverResult[0] ?? null;
  }

  // Get GL code if exists
  let glCode: { id: string; code: string; description: string } | null = null;
  if (expense.glCodeId) {
    const glCodeResult = await db
      .select({
        id: glCodes.id,
        code: glCodes.code,
        description: glCodes.description,
      })
      .from(glCodes)
      .where(eq(glCodes.id, expense.glCodeId))
      .limit(1);
    glCode = glCodeResult[0] ?? null;
  }

  // Get workflow info if exists
  let workflow: { id: string; name: string; code: WorkflowType } | null = null;
  if (expense.workflowId) {
    const workflowResult = await db
      .select({
        id: expenseWorkflows.id,
        name: expenseWorkflows.name,
        code: expenseWorkflows.code,
      })
      .from(expenseWorkflows)
      .where(eq(expenseWorkflows.id, expense.workflowId))
      .limit(1);
    workflow = workflowResult[0] ?? null;
  }

  // Get current step if exists
  let currentStep: WorkflowStepSummary | null = null;
  if (expense.currentStepId) {
    const stepResult = await db
      .select({
        id: workflowSteps.id,
        stepOrder: workflowSteps.stepOrder,
        name: workflowSteps.name,
        approverRole: workflowSteps.approverRole,
        isFinal: workflowSteps.isFinal,
      })
      .from(workflowSteps)
      .where(eq(workflowSteps.id, expense.currentStepId))
      .limit(1);
    currentStep = stepResult[0] ?? null;
  }

  // Get approvals with step info
  const approvalsResult = await db
    .select({
      approval: expenseApprovals,
      step: {
        id: workflowSteps.id,
        name: workflowSteps.name,
        stepOrder: workflowSteps.stepOrder,
      },
      approverName: users.name,
    })
    .from(expenseApprovals)
    .innerJoin(workflowSteps, eq(workflowSteps.id, expenseApprovals.workflowStepId))
    .leftJoin(users, eq(users.id, expenseApprovals.approverId))
    .where(eq(expenseApprovals.expenseId, expenseId))
    .orderBy(asc(workflowSteps.stepOrder));

  const approvals: ApprovalSummary[] = approvalsResult.map((r) => ({
    id: r.approval.id,
    status: r.approval.status,
    stepName: r.step.name,
    stepOrder: r.step.stepOrder,
    approverName: r.approverName ?? null,
    comments: r.approval.comments ?? null,
    actedAt: r.approval.actedAt ?? null,
  }));

  // Get attachments (join with expenses to ensure tenant filtering and prevent duplicates)
  const attachmentsResult = await db
    .selectDistinct({
      id: expenseAttachments.id,
      fileName: expenseAttachments.fileName,
      contentType: expenseAttachments.contentType,
      fileSize: expenseAttachments.fileSize,
      uploadedAt: expenseAttachments.uploadedAt,
    })
    .from(expenseAttachments)
    .innerJoin(expenses, eq(expenses.id, expenseAttachments.expenseId))
    .where(and(eq(expenseAttachments.expenseId, expenseId), eq(expenses.tenantId, tenantId)))
    .orderBy(asc(expenseAttachments.uploadedAt));

  // Get history count
  const historyCountResult = await db
    .select()
    .from(expenseHistory)
    .where(eq(expenseHistory.expenseId, expenseId));

  return {
    ...expense,
    submitter,
    approver,
    glCode,
    workflow,
    currentStep,
    approvals,
    attachments: attachmentsResult,
    historyCount: historyCountResult.length,
  };
}

/**
 * Get expenses list for a tenant with optional filters
 */
export async function getExpenses(
  tenantId: string,
  options?: {
    status?: ExpenseStatus;
    workflowType?: WorkflowType;
    submittedBy?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ expenses: ExpenseSummary[]; total: number }> {
  const {
    status,
    workflowType,
    submittedBy,
    search,
    startDate,
    endDate,
    limit = 10,
    offset = 0,
  } = options ?? {};

  // Build where conditions
  const conditions = [eq(expenses.tenantId, tenantId)];

  if (status) {
    conditions.push(eq(expenses.status, status));
  }

  if (workflowType) {
    conditions.push(eq(expenses.workflowType, workflowType));
  }

  if (submittedBy) {
    conditions.push(eq(expenses.submittedBy, submittedBy));
  }

  // Text search in vendor name and invoice number
  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        like(expenses.vendorName, searchPattern),
        like(expenses.invoiceNumber ?? sql`''`, searchPattern)
      )!
    );
  }

  // Date range filtering
  if (startDate) {
    conditions.push(gte(expenses.expenseDate, startDate));
  }

  if (endDate) {
    conditions.push(lte(expenses.expenseDate, endDate));
  }

  // Get total count
  const countResult = await db
    .select()
    .from(expenses)
    .where(and(...conditions));

  const total = countResult.length;

  // Get expenses with submitter
  const result = await db
    .select({
      expense: expenses,
      submitterName: users.name,
    })
    .from(expenses)
    .innerJoin(users, eq(users.id, expenses.submittedBy))
    .where(and(...conditions))
    .orderBy(desc(expenses.createdAt))
    .limit(limit)
    .offset(offset);

  const expensesList = result.map((r) => mapToExpenseSummary(r.expense, r.submitterName));

  return { expenses: expensesList, total };
}

/**
 * Get pending expenses for approval (for approvers)
 */
export async function getPendingExpensesForApproval(
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ expenses: ExpenseSummary[]; total: number }> {
  const { limit = 50, offset = 0 } = options ?? {};

  const conditions = [eq(expenses.tenantId, tenantId), eq(expenses.status, 'submitted')];

  // Get total count
  const countResult = await db
    .select()
    .from(expenses)
    .where(and(...conditions));

  const total = countResult.length;

  // Get expenses with submitter
  const result = await db
    .select({
      expense: expenses,
      submitterName: users.name,
    })
    .from(expenses)
    .innerJoin(users, eq(users.id, expenses.submittedBy))
    .where(and(...conditions))
    .orderBy(asc(expenses.createdAt))
    .limit(limit)
    .offset(offset);

  const expensesList = result.map((r) => mapToExpenseSummary(r.expense, r.submitterName));

  return { expenses: expensesList, total };
}

/**
 * Get GL codes for a tenant
 */
export async function getGlCodes(
  tenantId: string
): Promise<Array<{ id: string; code: string; description: string }>> {
  const result = await db
    .select({
      id: glCodes.id,
      code: glCodes.code,
      description: glCodes.description,
    })
    .from(glCodes)
    .where(and(eq(glCodes.tenantId, tenantId), eq(glCodes.isActive, true)))
    .orderBy(asc(glCodes.code));

  return result;
}
