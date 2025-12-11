/**
 * Unit tests for Response Wrapper
 */

import {
  successResponse,
  errorResponse,
  isSuccessResponse,
  isErrorResponse,
} from '../response';
import type { ApiResponse } from '@/types/response';

describe('Response Wrapper', () => {
  describe('successResponse', () => {
    it('should create a successful response with data', () => {
      const data = { invoiceId: '123', status: 'APPROVED' };
      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        data,
      });
    });

    it('should create a successful response with null data', () => {
      const response = successResponse(null);

      expect(response).toEqual({
        success: true,
        data: null,
      });
    });

    it('should create a successful response with array data', () => {
      const data = [{ invoiceId: '123' }, { invoiceId: '456' }];
      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        data,
      });
    });

    it('should create a successful response with string data', () => {
      const data = 'Success message';
      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        data,
      });
    });

    it('should create a successful response with number data', () => {
      const data = 42;
      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        data,
      });
    });

    it('should preserve type information', () => {
      interface Invoice {
        invoiceId: string;
        vendorName: string;
      }

      const invoice: Invoice = { invoiceId: '123', vendorName: 'Acme' };
      const response = successResponse(invoice);

      expect(response.data).toEqual(invoice);
      expect(response.data?.invoiceId).toBe('123');
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with message only', () => {
      const response = errorResponse('Invoice not found');

      expect(response).toEqual({
        success: false,
        error: {
          message: 'Invoice not found',
        },
      });
    });

    it('should create an error response with message and code', () => {
      const response = errorResponse('Invoice not found', 'INVOICE_NOT_FOUND');

      expect(response).toEqual({
        success: false,
        error: {
          message: 'Invoice not found',
          code: 'INVOICE_NOT_FOUND',
        },
      });
    });

    it('should create an error response with empty message', () => {
      const response = errorResponse('');

      expect(response).toEqual({
        success: false,
        error: {
          message: '',
        },
      });
    });

    it('should not include code when not provided', () => {
      const response = errorResponse('Error message');

      expect(response.error).not.toHaveProperty('code');
    });
  });

  describe('isSuccessResponse', () => {
    it('should return true for successful responses', () => {
      const response: ApiResponse<{ invoiceId: string }> = {
        success: true,
        data: { invoiceId: '123' },
      };

      expect(isSuccessResponse(response)).toBe(true);
    });

    it('should return false for error responses', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Error message',
        },
      };

      expect(isSuccessResponse(response)).toBe(false);
    });

    it('should narrow type for successful responses', () => {
      const response: ApiResponse<{ invoiceId: string }> = {
        success: true,
        data: { invoiceId: '123' },
      };

      if (isSuccessResponse(response)) {
        // TypeScript should know that response.data exists here
        expect(response.data.invoiceId).toBe('123');
      }
    });

    it('should handle responses with null data', () => {
      const response: ApiResponse<null> = {
        success: true,
        data: null,
      };

      expect(isSuccessResponse(response)).toBe(true);
    });
  });

  describe('isErrorResponse', () => {
    it('should return true for error responses', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Error message',
        },
      };

      expect(isErrorResponse(response)).toBe(true);
    });

    it('should return true for error responses with code', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Error message',
          code: 'ERROR_CODE',
        },
      };

      expect(isErrorResponse(response)).toBe(true);
    });

    it('should return false for successful responses', () => {
      const response: ApiResponse<{ invoiceId: string }> = {
        success: true,
        data: { invoiceId: '123' },
      };

      expect(isErrorResponse(response)).toBe(false);
    });

    it('should narrow type for error responses', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Error message',
          code: 'ERROR_CODE',
        },
      };

      if (isErrorResponse(response)) {
        // TypeScript should know that response.error exists here
        expect(response.error.message).toBe('Error message');
        expect(response.error.code).toBe('ERROR_CODE');
      }
    });
  });

  describe('Type Guards Integration', () => {
    it('should work together to handle different response types', () => {
      const successResp: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: '123' },
      };

      const errorResp: ApiResponse = {
        success: false,
        error: { message: 'Error' },
      };

      function handleResponse(response: ApiResponse<{ id: string }> | ApiResponse) {
        if (isSuccessResponse(response)) {
          return `Success: ${response.data.id}`;
        }
        if (isErrorResponse(response)) {
          return `Error: ${response.error.message}`;
        }
        return 'Unknown response';
      }

      expect(handleResponse(successResp)).toBe('Success: 123');
      expect(handleResponse(errorResp)).toBe('Error: Error');
    });
  });
});

