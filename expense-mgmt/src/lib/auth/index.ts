/**
 * Authentication Module
 *
 * Exports for authentication and authorization utilities.
 */

// Mock SSO Provider
export {
  getTestUsers,
  getAvailableTenants,
  mockSsoAuthenticate,
  getUserById,
  type AzureAdUserProfile,
  type TestUser,
  type MockSsoResult,
} from './mock-sso';

// JWT Utilities
export {
  signToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenTTL,
  type TokenUserData,
  type VerifyTokenResult,
} from './jwt';

// Session Management
export {
  createSession,
  getSession,
  clearSession,
  refreshSession,
  hasValidSession,
  getTenantContext,
  requireSession,
  type SessionResult,
} from './session';
