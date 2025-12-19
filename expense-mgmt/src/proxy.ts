/**
 * Proxy (Next.js 16+)
 *
 * Handles authentication and tenant context for all routes.
 * Note: In Next.js 16, middleware.ts is renamed to proxy.ts
 *
 * Features:
 * - Verifies session token on protected routes
 * - Injects tenant context into request headers for API routes
 * - Redirects unauthenticated users to login page
 * - Allows public routes to pass through without auth
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_CONFIG } from '@/constants/auth.constants';
import { verifyTokenEdge } from '@/lib/auth/jwt-edge';

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/tenants',
  '/api/auth/users',
  '/api/auth/mock-sso',
  '/api/health',
];

/**
 * Routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ['/login'];

/**
 * Check if a path matches any of the patterns
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Exact match
    if (pathname === pattern) return true;
    // Prefix match for paths like /api/auth/*
    if (pattern.endsWith('*') && pathname.startsWith(pattern.slice(0, -1))) return true;
    return false;
  });
}

/**
 * Custom headers to inject tenant context
 */
const TENANT_HEADERS = {
  USER_ID: 'x-user-id',
  USER_EMAIL: 'x-user-email',
  USER_NAME: 'x-user-name',
  USER_ROLE: 'x-user-role',
  TENANT_ID: 'x-tenant-id',
  TENANT_SLUG: 'x-tenant-slug',
} as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_CONFIG.COOKIE_NAME);
  const token = sessionCookie?.value;

  // Verify token if present
  let authToken = null;
  if (token) {
    const result = await verifyTokenEdge(token);
    if (result.success && result.token) {
      authToken = result.token;
    }
  }

  const isAuthenticated = authToken !== null;
  const isPublicRoute = matchesPath(pathname, PUBLIC_ROUTES);
  const isAuthRoute = matchesPath(pathname, AUTH_ROUTES);

  // Handle auth routes (login page) when already authenticated
  if (isAuthRoute && isAuthenticated) {
    // Redirect to expenses page if already logged in
    return NextResponse.redirect(new URL('/expenses', request.url));
  }

  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated on protected route
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter to return after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For authenticated requests, inject tenant context into headers
  const requestHeaders = new Headers(request.headers);

  if (authToken) {
    requestHeaders.set(TENANT_HEADERS.USER_ID, authToken.userId);
    requestHeaders.set(TENANT_HEADERS.USER_EMAIL, authToken.email);
    requestHeaders.set(TENANT_HEADERS.USER_NAME, authToken.name);
    requestHeaders.set(TENANT_HEADERS.USER_ROLE, authToken.role);
    requestHeaders.set(TENANT_HEADERS.TENANT_ID, authToken.tenantId);
    requestHeaders.set(TENANT_HEADERS.TENANT_SLUG, authToken.tenantSlug);
  }

  // Continue with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
