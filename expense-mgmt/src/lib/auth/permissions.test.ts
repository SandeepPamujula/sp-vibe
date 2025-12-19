/**
 * @jest-environment node
 */
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissions,
  canAccessRoute,
  canAccessPath,
  getRoutePermission,
} from './permissions';

describe('Permission Utilities', () => {
  describe('hasPermission', () => {
    it('should return true for admin with expense:create', () => {
      expect(hasPermission('admin', 'expense:create')).toBe(true);
    });

    it('should return true for admin with expense:read', () => {
      expect(hasPermission('admin', 'expense:read')).toBe(true);
    });

    it('should return false for admin with expense:approve', () => {
      // admin cannot approve expenses
      expect(hasPermission('admin', 'expense:approve')).toBe(false);
    });

    it('should return true for approver with expense:approve', () => {
      expect(hasPermission('approver', 'expense:approve')).toBe(true);
    });

    it('should return true for approver with report:generate', () => {
      expect(hasPermission('approver', 'report:generate')).toBe(true);
    });

    it('should return true for both roles with audit:view', () => {
      expect(hasPermission('admin', 'audit:view')).toBe(true);
      expect(hasPermission('approver', 'audit:view')).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when role has all permissions', () => {
      expect(hasAllPermissions('admin', ['expense:create', 'expense:read'])).toBe(true);
    });

    it('should return false when role lacks one permission', () => {
      expect(hasAllPermissions('admin', ['expense:create', 'expense:approve'])).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      expect(hasAllPermissions('admin', [])).toBe(true);
    });

    it('should work correctly for approver role', () => {
      expect(
        hasAllPermissions('approver', ['expense:approve', 'expense:reject', 'report:generate'])
      ).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when role has at least one permission', () => {
      expect(hasAnyPermission('admin', ['expense:create', 'expense:approve'])).toBe(true);
    });

    it('should return false when role has no matching permissions', () => {
      expect(hasAnyPermission('admin', ['expense:approve', 'expense:reject'])).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(hasAnyPermission('admin', [])).toBe(false);
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions for admin', () => {
      const permissions = getPermissions('admin');

      expect(permissions).toContain('expense:create');
      expect(permissions).toContain('expense:read');
      expect(permissions).toContain('expense:submit');
      expect(permissions).toContain('audit:view');
      expect(permissions).not.toContain('expense:approve');
    });

    it('should return all permissions for approver', () => {
      const permissions = getPermissions('approver');

      expect(permissions).toContain('expense:approve');
      expect(permissions).toContain('expense:reject');
      expect(permissions).toContain('report:generate');
      expect(permissions).toContain('expense:view-all');
    });
  });

  describe('canAccessRoute', () => {
    it('should grant access when role has all required permissions', () => {
      expect(canAccessRoute('approver', ['expense:approve', 'expense:reject'], true)).toBe(true);
    });

    it('should deny access when role lacks a required permission', () => {
      expect(canAccessRoute('admin', ['expense:approve'], true)).toBe(false);
    });

    it('should grant access when requireAll is false and role has one permission', () => {
      expect(canAccessRoute('admin', ['expense:create', 'expense:approve'], false)).toBe(true);
    });

    it('should grant access for empty permissions array', () => {
      expect(canAccessRoute('admin', [], true)).toBe(true);
      expect(canAccessRoute('approver', [], false)).toBe(true);
    });
  });

  describe('getRoutePermission', () => {
    it('should return permission config for /expenses', () => {
      const config = getRoutePermission('/expenses');

      expect(config).toBeDefined();
      expect(config?.path).toBe('/expenses');
      expect(config?.permissions).toContain('expense:read');
    });

    it('should return permission config for /approvals', () => {
      const config = getRoutePermission('/approvals');

      expect(config).toBeDefined();
      expect(config?.permissions).toContain('expense:approve');
      expect(config?.requireAll).toBe(false);
    });

    it('should return undefined for unknown route', () => {
      const config = getRoutePermission('/unknown');

      expect(config).toBeUndefined();
    });

    it('should match nested routes with prefix', () => {
      const config = getRoutePermission('/expenses/123');

      expect(config).toBeDefined();
      expect(config?.path).toBe('/expenses');
    });
  });

  describe('canAccessPath', () => {
    it('should allow admin to access /expenses', () => {
      expect(canAccessPath('admin', '/expenses')).toBe(true);
    });

    it('should allow approver to access /expenses', () => {
      expect(canAccessPath('approver', '/expenses')).toBe(true);
    });

    it('should allow approver to access /approvals', () => {
      expect(canAccessPath('approver', '/approvals')).toBe(true);
    });

    it('should deny admin access to /approvals (no approve permission)', () => {
      expect(canAccessPath('admin', '/approvals')).toBe(false);
    });

    it('should allow approver to access /reports', () => {
      expect(canAccessPath('approver', '/reports')).toBe(true);
    });

    it('should deny admin access to /reports (no report:generate permission)', () => {
      expect(canAccessPath('admin', '/reports')).toBe(false);
    });

    it('should allow access to undefined routes', () => {
      expect(canAccessPath('admin', '/unknown-route')).toBe(true);
      expect(canAccessPath('approver', '/unknown-route')).toBe(true);
    });
  });
});
