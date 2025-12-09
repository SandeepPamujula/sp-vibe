/**
 * User model and related types
 * 
 * Defines the User interface and UserRole enum for authentication and role management.
 * Maps to DynamoDB UsersTable.
 */

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
}

/**
 * User model for authentication and role management
 * Maps to DynamoDB UsersTable
 */
export interface User {
  /** User email address - partition key */
  email: string;
  /** User role (admin or accountant) */
  role: UserRole;
  /** User's full name */
  name: string;
  /** Timestamp when user was created (ISO 8601 format) */
  createdAt: string;
  /** Timestamp of last login (ISO 8601 format) */
  lastLogin?: string;
}

