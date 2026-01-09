/**
 * Session Management Tests
 *
 * @jest-environment node
 */

import { signToken } from '../jwt';
import type { TokenUserData } from '../jwt';

// Note: Testing session.ts functions that use next/headers is complex
// because they depend on the Next.js request context.
// These tests focus on the exported functions' behavior.

// Mock user data for testing
const mockUserData: TokenUserData = {
  userId: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenantId: 'test-tenant-id',
  tenantSlug: 'test-tenant',
};

describe('Session Utilities', () => {
  describe('Token generation for session', () => {
    it('should create a valid token for session storage', () => {
      const token = signToken(mockUserData);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include all user data in the token', () => {
      const token = signToken(mockUserData);

      // Decode the token payload (middle part)
      const payload = JSON.parse(atob(token.split('.')[1]!));

      expect(payload.sub).toBe(mockUserData.userId);
      expect(payload.email).toBe(mockUserData.email);
      expect(payload.name).toBe(mockUserData.name);
      expect(payload.role).toBe(mockUserData.role);
      expect(payload.tenantId).toBe(mockUserData.tenantId);
      expect(payload.tenantSlug).toBe(mockUserData.tenantSlug);
    });

    it('should include iat and exp claims', () => {
      const token = signToken(mockUserData);
      const payload = JSON.parse(atob(token.split('.')[1]!));

      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
      expect(typeof payload.iat).toBe('number');
      expect(typeof payload.exp).toBe('number');
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });
  });

  // Integration tests for session management would require:
  // 1. Mocking next/headers cookies() function
  // 2. Setting up a proper Next.js test environment
  // These are better suited for E2E tests with Playwright or Cypress
});
