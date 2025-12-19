/**
 * @jest-environment node
 */
import jwt from 'jsonwebtoken';

import { authConfig } from '../config';

import {
  signToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenTTL,
  type TokenUserData,
} from './jwt';

// Mock user data for testing
const mockUser: TokenUserData = {
  userId: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenantId: 'tenant-123',
  tenantSlug: 'acme',
};

describe('JWT Utilities', () => {
  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      const token = signToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in payload', () => {
      const token = signToken(mockUser);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.sub).toBe(mockUser.userId);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.name).toBe(mockUser.name);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.tenantId).toBe(mockUser.tenantId);
      expect(decoded.tenantSlug).toBe(mockUser.tenantSlug);
    });

    it('should set iat and exp claims', () => {
      const token = signToken(mockUser);
      const decoded = jwt.decode(token) as Record<string, unknown>;

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
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

    it('should return AuthToken with correct properties', () => {
      const token = signToken(mockUser);
      const result = verifyToken(token);

      expect(result.token?.userId).toBe(mockUser.userId);
      expect(result.token?.email).toBe(mockUser.email);
      expect(result.token?.name).toBe(mockUser.name);
      expect(result.token?.role).toBe(mockUser.role);
      expect(result.token?.tenantId).toBe(mockUser.tenantId);
      expect(result.token?.tenantSlug).toBe(mockUser.tenantSlug);
      expect(result.token?.issuedAt).toBeInstanceOf(Date);
      expect(result.token?.expiresAt).toBeInstanceOf(Date);
    });

    it('should fail for invalid token', () => {
      const result = verifyToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
      expect(result.token).toBeUndefined();
    });

    it('should fail for expired token', () => {
      // Create a token that expired 1 hour ago
      const expiredToken = jwt.sign({ sub: mockUser.userId }, authConfig.jwtSecret, {
        expiresIn: '-1h',
      });

      const result = verifyToken(expiredToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token has expired');
    });

    it('should fail for token with wrong secret', () => {
      const wrongSecretToken = jwt.sign({ sub: mockUser.userId }, 'wrong-secret', {
        expiresIn: '1h',
      });

      const result = verifyToken(wrongSecretToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      const token = signToken(mockUser);
      const decoded = decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe(mockUser.userId);
      expect(decoded?.email).toBe(mockUser.email);
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeToken('not-a-valid-jwt');

      expect(decoded).toBeNull();
    });

    it('should decode even with wrong secret (no verification)', () => {
      const wrongSecretToken = jwt.sign(
        { sub: mockUser.userId, email: mockUser.email },
        'different-secret',
        { expiresIn: '1h' }
      );

      const decoded = decodeToken(wrongSecretToken);

      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe(mockUser.userId);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', () => {
      const token = signToken(mockUser);

      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredToken = jwt.sign({ sub: mockUser.userId }, authConfig.jwtSecret, {
        expiresIn: '-1h',
      });

      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const tokenNoExp = jwt.sign({ sub: mockUser.userId }, authConfig.jwtSecret, {
        noTimestamp: true,
      });

      expect(isTokenExpired(tokenNoExp)).toBe(true);
    });
  });

  describe('getTokenTTL', () => {
    it('should return positive TTL for valid non-expired token', () => {
      const token = signToken(mockUser);
      const ttl = getTokenTTL(token);

      expect(ttl).toBeGreaterThan(0);
      // Should be close to 24 hours (86400 seconds) with some buffer
      expect(ttl).toBeLessThanOrEqual(86400);
      expect(ttl).toBeGreaterThan(86300); // At least ~24 hours minus 100 seconds
    });

    it('should return 0 for expired token', () => {
      const expiredToken = jwt.sign({ sub: mockUser.userId }, authConfig.jwtSecret, {
        expiresIn: '-1h',
      });

      expect(getTokenTTL(expiredToken)).toBe(0);
    });

    it('should return 0 for invalid token', () => {
      expect(getTokenTTL('invalid-token')).toBe(0);
    });
  });
});
