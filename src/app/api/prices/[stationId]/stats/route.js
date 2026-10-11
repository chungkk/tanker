import { NextResponse } from 'next/server';
import { getStmts } from '@/lib/database';

/**
 * GET /api/prices/:stationId/stats
 * Thống kê giá (min, max, avg) trong N ngày
 * Query: days (mặc định 7)
 */
export async function GET(request, { params }) {
  try {
    const { stationId } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const stmts = getStmts();

    const since = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    const stats = stmts.getStats.all(stationId, since);

    return NextResponse.json({
      station_id: stationId,
      period_days: days,
      fuels: stats,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
