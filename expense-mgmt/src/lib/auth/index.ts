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
