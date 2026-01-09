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

// JWT Utilities (Node.js - for API routes)
export {
  signToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenTTL,
  type TokenUserData,
  type VerifyTokenResult,
} from './jwt';

// JWT Utilities (Edge - for middleware)
export {
  verifyTokenEdge,
  decodeTokenEdge,
  isTokenExpiredEdge,
  type EdgeVerifyResult,
} from './jwt-edge';

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

// Request Context (for API routes)
export {
  getRequestUser,
  getRequestTenant,
  getRequestContext,
  requireRequestContext,
  getRequestTenantId,
  requireTenantId,
  TENANT_HEADERS,
  type RequestUser,
  type RequestTenant,
  type RequestContext,
} from './request-context';

// Permissions (Role-based access control)
export {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  canAccessRoute,
  getNavigationForRole,
  ROUTE_PERMISSIONS,
  type RoutePermission,
} from './permissions';
