/**
 * Test to verify empty string handling in expense schemas
 */

import { createExpenseSchema, updateExpenseSchema } from '../expense.schema';

describe('Expense Schema - Empty String Handling', () => {
  describe('createExpenseSchema', () => {
    it('should accept empty string for natureOfExpense and convert to undefined', () => {
      const input = {
        workflowType: 'petty',
        expenseDate: '2025-12-20',
        vendorName: 'Test Vendor',
        amount: 100,
        natureOfExpense: '', // Empty string
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.natureOfExpense).toBeUndefined();
      }
    });

    it('should validate UUID when natureOfExpense is provided', () => {
      const input = {
        workflowType: 'petty',
        expenseDate: '2025-12-20',
        vendorName: 'Test Vendor',
        amount: 100,
        natureOfExpense: 'invalid-uuid',
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept valid UUID for natureOfExpense', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const input = {
        workflowType: 'petty',
        expenseDate: '2025-12-20',
        vendorName: 'Test Vendor',
        amount: 100,
        natureOfExpense: validUuid,
      };

      const result = createExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.natureOfExpense).toBe(validUuid);
      }
    });
  });

  describe('updateExpenseSchema', () => {
    it('should accept empty string for natureOfExpense and convert to undefined', () => {
      const input = {
        natureOfExpense: '', // Empty string
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.natureOfExpense).toBeUndefined();
      }
    });

    it('should validate UUID when natureOfExpense is provided', () => {
      const input = {
        natureOfExpense: 'invalid-uuid',
      };

      const result = updateExpenseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
