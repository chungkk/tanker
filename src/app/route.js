import { NextResponse } from 'next/server';

/**
 * GET /
 * Redirect đến /api documentation
 */
export async function GET(request) {
  return NextResponse.redirect(new URL('/api', process.env.NEXT_PUBLIC_BASE_URL || request.url));
}
