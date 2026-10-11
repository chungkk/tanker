import { NextResponse } from 'next/server';
import { getStmts } from '@/lib/database';

/**
 * GET /api/prices/:stationId/history
 * Lấy lịch sử giá của trạm
 * Query: fuel (tên nhiên liệu), days (số ngày, mặc định 7)
 */
export async function GET(request, { params }) {
  try {
    const { stationId } = await params;
    const { searchParams } = new URL(request.url);
    const fuel = searchParams.get('fuel');
    const days = parseInt(searchParams.get('days') || '7');

    const stmts = getStmts();

    const start = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();
    const end = new Date().toISOString();

    let history;
    if (fuel) {
      history = stmts.getPriceHistory.all(stationId, fuel, start, end);
    } else {
      history = stmts.getPriceHistoryAll.all(stationId, start, end);
    }

    // Nhóm theo fuel type
    const grouped = {};
    for (const record of history) {
      if (!grouped[record.fuel_name]) grouped[record.fuel_name] = [];
      grouped[record.fuel_name].push({
        time: record.recorded_at,
        price: record.price,
      });
    }

    return NextResponse.json({
      station_id: stationId,
      period: { start, end, days },
      graphs: grouped,
      total_points: history.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
