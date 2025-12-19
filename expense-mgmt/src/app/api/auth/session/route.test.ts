/**
 * @jest-environment node
 */
import { cookies } from 'next/headers';

import { SESSION_CONFIG } from '@/constants/auth.constants';
import { signToken, type TokenUserData } from '@/lib/auth/jwt';

import { GET, DELETE } from './route';

// Mock next/headers cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockUser: TokenUserData = {
  userId: 'user-session-test',
  email: 'session@example.com',
  name: 'Session User',
  role: 'admin',
  tenantId: 'tenant-session',
  tenantSlug: 'session-corp',
};

describe('Session API Routes', () => {
  let mockCookieStore: {
    get: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    mockCookieStore = {
      get: jest.fn(),
      delete: jest.fn(),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/session', () => {
    it('should return session for valid token', async () => {
      const token = signToken(mockUser);
      mockCookieStore.get.mockReturnValue({ value: token });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session).toBeDefined();
      expect(data.data.session.user.id).toBe(mockUser.userId);
      expect(data.data.session.user.email).toBe(mockUser.email);
      expect(data.data.session.tenant.tenantId).toBe(mockUser.tenantId);
    });

    it('should return 401 when no session cookie exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('No valid session');
    });

    it('should return 401 for invalid token', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'invalid-token' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/auth/session', () => {
    it('should clear session and return success', async () => {
      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Logged out successfully');
      expect(mockCookieStore.delete).toHaveBeenCalledWith(SESSION_CONFIG.COOKIE_NAME);
    });

    it('should call cookies().delete with correct cookie name', async () => {
      await DELETE();

      expect(mockCookieStore.delete).toHaveBeenCalledTimes(1);
      expect(mockCookieStore.delete).toHaveBeenCalledWith('expense_session');
    });
  });
});
