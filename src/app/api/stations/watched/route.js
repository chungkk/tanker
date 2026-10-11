import { NextResponse } from 'next/server';
import { getStmts } from '@/lib/database';

/**
 * GET /api/stations/watched
 * Lấy danh sách trạm đang theo dõi + giá hiện tại
 */
export async function GET() {
  try {
    const stmts = getStmts();
    const watched = stmts.getWatched.all();

    const result = watched.map((station) => {
      const prices = stmts.getCurrentPrices.all(station.id);
      return {
        ...station,
        opening_times: JSON.parse(station.opening_times || '[]'),
        current_prices: prices,
      };
    });

    return NextResponse.json({ count: result.length, stations: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
