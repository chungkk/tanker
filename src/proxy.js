import { NextResponse } from 'next/server';

/**
 * Rate limiter middleware cho Next.js
 * Thay thế Express rateLimit middleware
 * Config: 60 requests / 60 giây per IP
 */

const WINDOW_MS = 60000; // 1 phút
const MAX_REQUESTS = 60;

// In-memory store (sẽ reset khi server restart)
const hits = new Map();

// Dọn dẹp entries cũ mỗi phút
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits) {
      if (now - data.start > WINDOW_MS) hits.delete(key);
    }
  }, WINDOW_MS);
}

export function proxy(request) {
  // Chỉ apply cho /api/* routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const now = Date.now();
  const record = hits.get(ip);

  if (!record || now - record.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return NextResponse.next();
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Tối đa ${MAX_REQUESTS} requests mỗi ${WINDOW_MS / 1000} giây.`,
        retryAfter: Math.ceil((record.start + WINDOW_MS - now) / 1000),
      },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
