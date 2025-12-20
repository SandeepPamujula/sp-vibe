/**
 * Nature of Expense DTOs
 *
 * Data transfer objects for Nature of Expense selection.
 * Options are populated from GL Codes (/api/gl-codes).
 */

/**
 * Nature of Expense select option for dropdowns
 *
 * Usage:
 * - Display `description` (or `code - description`) to users
 * - Submit `value` (GL Code ID) as `natureOfExpense` when creating/updating expenses
 * - The backend will automatically map to both `glCodeId` and `natureOfExpense` (description)
 */
export interface NatureOfExpenseOption {
  /** GL Code ID - submit this as `natureOfExpense` */
  value: string;
  /** Display label (typically same as description) */
  label: string;
  /** GL code number for reference (e.g., "5100") */
  code: string;
  /** Nature of expense description (e.g., "Office Supplies") */
  description: string;
}

/**
 * Transform API response to select options
 *
 * @example
 * const { data } = await fetch('/api/gl-codes').then(r => r.json());
 * const options = toNatureOfExpenseOptions(data);
 */
export function toNatureOfExpenseOptions(
  glCodes: Array<{ id: string; code: string; description: string }>
): NatureOfExpenseOption[] {
  return glCodes.map((gl) => ({
    value: gl.id,
    label: gl.description,
    code: gl.code,
    description: gl.description,
  }));
}
