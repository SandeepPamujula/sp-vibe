/**
 * @jest-environment node
 */
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  canAccessRoute,
  ROUTE_PERMISSIONS,
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

  describe('getRolePermissions', () => {
    it('should return all permissions for admin', () => {
      const permissions = getRolePermissions('admin');

      expect(permissions).toContain('expense:create');
      expect(permissions).toContain('expense:read');
      expect(permissions).toContain('expense:submit');
      expect(permissions).toContain('audit:view');
      expect(permissions).not.toContain('expense:approve');
    });

    it('should return all permissions for approver', () => {
      const permissions = getRolePermissions('approver');

      expect(permissions).toContain('expense:approve');
      expect(permissions).toContain('expense:reject');
      expect(permissions).toContain('report:generate');
      expect(permissions).toContain('expense:view-all');
    });
  });

  describe('canAccessRoute', () => {
    it('should grant access when role is allowed for route', () => {
      const result = canAccessRoute('approver', '/approvals');
      expect(result.allowed).toBe(true);
    });

    it('should deny access when role lacks required permission', () => {
      const result = canAccessRoute('admin', '/approvals');
      expect(result.allowed).toBe(false);
    });

    it('should grant access when route has no restrictions', () => {
      const result = canAccessRoute('admin', '/unknown-route');
      expect(result.allowed).toBe(true);
    });

    it('should grant admin access to /expenses', () => {
      const result = canAccessRoute('admin', '/expenses');
      expect(result.allowed).toBe(true);
    });

    it('should grant approver access to /expenses', () => {
      const result = canAccessRoute('approver', '/expenses');
      expect(result.allowed).toBe(true);
    });

    it('should grant approver access to /reports', () => {
      const result = canAccessRoute('approver', '/reports');
      expect(result.allowed).toBe(true);
    });

    it('should deny admin access to /reports', () => {
      const result = canAccessRoute('admin', '/reports');
      expect(result.allowed).toBe(false);
    });

    it('should support nested route matching', () => {
      const result = canAccessRoute('approver', '/expenses/123');
      expect(result.allowed).toBe(true);
    });
  });

  describe('ROUTE_PERMISSIONS', () => {
    it('should have expense route configured', () => {
      const expenseRoute = ROUTE_PERMISSIONS.find((r) => r.path === '/expenses');
      expect(expenseRoute).toBeDefined();
      expect(expenseRoute?.roles).toContain('admin');
      expect(expenseRoute?.roles).toContain('approver');
    });

    it('should have approvals route configured for approvers only', () => {
      const approvalRoute = ROUTE_PERMISSIONS.find((r) => r.path === '/approvals');
      expect(approvalRoute).toBeDefined();
      expect(approvalRoute?.roles).toContain('approver');
      expect(approvalRoute?.permissions).toContain('expense:approve');
    });

    it('should have reports route configured', () => {
      const reportRoute = ROUTE_PERMISSIONS.find((r) => r.path === '/reports');
      expect(reportRoute).toBeDefined();
      expect(reportRoute?.permissions).toContain('report:generate');
    });
  });
});
