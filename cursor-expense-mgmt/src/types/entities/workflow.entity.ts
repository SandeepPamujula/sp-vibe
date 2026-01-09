/**
 * Workflow Entity Types
 *
 * Extended workflow types with relations and approval details.
 */

import type {
  ApprovalStatus,
  ExpenseApproval,
  ExpenseWorkflow,
  User,
  WorkflowType,
} from './base.entity';

/**
 * Workflow step with basic info for display
 */
export interface WorkflowStepSummary {
  id: string;
  stepOrder: number;
  name: string;
  approverRole: string;
  isFinal: boolean;
}

/**
 * Workflow with its approval steps
 */
export interface WorkflowWithSteps extends ExpenseWorkflow {
  steps: WorkflowStepSummary[];
}

/**
 * Expense approval with approver and step details
 */
export interface ExpenseApprovalWithDetails extends ExpenseApproval {
  approver?: Pick<User, 'id' | 'name' | 'email'> | null;
  workflowStep: WorkflowStepSummary;
}

/**
 * Summary of approval status for an expense
 */
export interface ApprovalSummary {
  id: string;
  status: ApprovalStatus;
  stepName: string;
  stepOrder: number;
  approverName?: string | null;
  comments?: string | null;
  actedAt?: Date | null;
}

/**
 * Workflow configuration for a tenant
 */
export interface TenantWorkflowConfig {
  tenantId: string;
  workflows: Array<{
    id: string;
    name: string;
    code: WorkflowType;
    isActive: boolean;
    stepCount: number;
  }>;
}
