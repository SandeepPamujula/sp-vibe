import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware
 *
 * Handles:
 * - Authentication verification
 * - Tenant context injection
 * - Role-based route protection
 *
 * Will be fully implemented in Milestone 2.
 */

export function middleware(_request: NextRequest) {
  // For now, just pass through all requests
  // Authentication will be added in Milestone 2
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api/health
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
};
