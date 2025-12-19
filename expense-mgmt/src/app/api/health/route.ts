import { NextResponse } from 'next/server';

/**
 * Health Check API
 *
 * Simple endpoint to verify the API is running.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
}

