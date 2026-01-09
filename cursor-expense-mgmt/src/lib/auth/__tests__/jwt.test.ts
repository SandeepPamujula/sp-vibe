/**
 * @jest-environment node
 */
import { signToken, verifyToken, decodeToken, isTokenExpired, getTokenTTL } from '../jwt';
import type { TokenUserData } from '../jwt';

// Mock user data for testing
const mockUser: TokenUserData = {
  userId: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenantId: 'test-tenant-id',
  tenantSlug: 'test-tenant',
};

describe('JWT Utilities', () => {
  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      const token = signToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // JWT has 3 parts separated by dots
      expect(token.split('.').length).toBe(3);
    });

    it('should include user data in token payload', () => {
      const token = signToken(mockUser);
      const decoded = decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(mockUser.userId);
      expect(decoded?.email).toBe(mockUser.email);
      expect(decoded?.name).toBe(mockUser.name);
      expect(decoded?.role).toBe(mockUser.role);
      expect(decoded?.tenantId).toBe(mockUser.tenantId);
      expect(decoded?.tenantSlug).toBe(mockUser.tenantSlug);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = signToken(mockUser);
      const result = verifyToken(token);

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token?.userId).toBe(mockUser.userId);
      expect(result.token?.email).toBe(mockUser.email);
    });

    it('should reject an invalid token', () => {
      const result = verifyToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject a tampered token', () => {
      const token = signToken(mockUser);
      // Tamper with the token
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const result = verifyToken(tamperedToken);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      const token = signToken(mockUser);
      const decoded = decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(mockUser.userId);
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeToken('not-a-jwt');

      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for a fresh token', () => {
      const token = signToken(mockUser);
      const expired = isTokenExpired(token);

      expect(expired).toBe(false);
    });

    it('should return true for invalid token', () => {
      const expired = isTokenExpired('invalid-token');

      expect(expired).toBe(true);
    });
  });

  describe('getTokenTTL', () => {
    it('should return positive TTL for fresh token', () => {
      const token = signToken(mockUser);
      const ttl = getTokenTTL(token);

      expect(ttl).toBeGreaterThan(0);
      // Should be close to 24 hours (86400 seconds)
      expect(ttl).toBeLessThanOrEqual(86400);
    });

    it('should return 0 for invalid token', () => {
      const ttl = getTokenTTL('invalid-token');

      expect(ttl).toBe(0);
    });
  });
});
