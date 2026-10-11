import { NextResponse } from 'next/server';
import { getStmts } from '@/lib/database';

/**
 * GET /api/stations/:id
 * Lấy thông tin chi tiết 1 trạm + giá hiện tại
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const stmts = getStmts();

    const station = stmts.getStation.get(id);
    if (!station) {
      return NextResponse.json(
        { error: 'Trạm không tồn tại trong DB.' },
        { status: 404 }
      );
    }

    const prices = stmts.getCurrentPrices.all(station.id);

    return NextResponse.json({
      ...station,
      opening_times: JSON.parse(station.opening_times || '[]'),
      current_prices: prices,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
