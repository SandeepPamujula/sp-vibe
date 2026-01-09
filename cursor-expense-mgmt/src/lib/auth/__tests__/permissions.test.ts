/**
 * @jest-environment node
 */
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  canAccessRoute,
  getNavigationForRole,
} from '../permissions';

describe('Permission Utilities', () => {
  describe('hasPermission', () => {
    it('should return true when admin has expense:create', () => {
      expect(hasPermission('admin', 'expense:create')).toBe(true);
    });

    it('should return true when approver has expense:approve', () => {
      expect(hasPermission('approver', 'expense:approve')).toBe(true);
    });

    it('should return false when admin does not have expense:approve', () => {
      expect(hasPermission('admin', 'expense:approve')).toBe(false);
    });

    it('should return true when admin has audit:view', () => {
      expect(hasPermission('admin', 'audit:view')).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      expect(hasAllPermissions('admin', ['expense:create', 'expense:read'])).toBe(true);
    });

    it('should return false when user is missing a permission', () => {
      expect(hasAllPermissions('admin', ['expense:create', 'expense:approve'])).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      expect(hasAllPermissions('admin', [])).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      expect(hasAnyPermission('admin', ['expense:approve', 'expense:create'])).toBe(true);
    });

    it('should return false when user has none of the permissions', () => {
      expect(hasAnyPermission('admin', ['expense:approve', 'report:generate'])).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(hasAnyPermission('admin', [])).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return admin permissions', () => {
      const permissions = getRolePermissions('admin');
      expect(permissions).toContain('expense:create');
      expect(permissions).toContain('audit:view');
      expect(permissions).not.toContain('expense:approve');
    });

    it('should return approver permissions', () => {
      const permissions = getRolePermissions('approver');
      expect(permissions).toContain('expense:approve');
      expect(permissions).toContain('report:generate');
      expect(permissions).toContain('expense:view-all');
    });
  });

  describe('canAccessRoute', () => {
    it('should allow admin access to /expenses', () => {
      const result = canAccessRoute('admin', '/expenses');
      expect(result.allowed).toBe(true);
    });

    it('should allow approver access to /expenses', () => {
      const result = canAccessRoute('approver', '/expenses');
      expect(result.allowed).toBe(true);
    });

    it('should deny admin access to /approvals', () => {
      const result = canAccessRoute('admin', '/approvals');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should allow approver access to /approvals', () => {
      const result = canAccessRoute('approver', '/approvals');
      expect(result.allowed).toBe(true);
    });

    it('should deny admin access to /reports', () => {
      const result = canAccessRoute('admin', '/reports');
      expect(result.allowed).toBe(false);
    });

    it('should allow approver access to /reports', () => {
      const result = canAccessRoute('approver', '/reports');
      expect(result.allowed).toBe(true);
    });

    it('should allow access to routes not in ROUTE_PERMISSIONS', () => {
      const result = canAccessRoute('admin', '/some-other-route');
      expect(result.allowed).toBe(true);
    });

    it('should handle nested routes', () => {
      const result = canAccessRoute('admin', '/approvals/pending');
      expect(result.allowed).toBe(false);
    });
  });

  describe('getNavigationForRole', () => {
    it('should return only expenses for admin', () => {
      const nav = getNavigationForRole('admin');
      expect(nav.length).toBe(1);
      expect(nav[0].href).toBe('/expenses');
    });

    it('should return all navigation items for approver', () => {
      const nav = getNavigationForRole('approver');
      expect(nav.length).toBe(3);
      expect(nav.map((n) => n.href)).toContain('/expenses');
      expect(nav.map((n) => n.href)).toContain('/approvals');
      expect(nav.map((n) => n.href)).toContain('/reports');
    });
  });
});
