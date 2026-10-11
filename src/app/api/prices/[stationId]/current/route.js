import { NextResponse } from 'next/server';
import { getStmts } from '@/lib/database';

/**
 * GET /api/prices/:stationId/current
 * Lấy giá hiện tại của trạm
 */
export async function GET(request, { params }) {
  try {
    const { stationId } = await params;
    const stmts = getStmts();
    const prices = stmts.getCurrentPrices.all(stationId);

    if (!prices.length) {
      return NextResponse.json(
        { error: 'Không có dữ liệu giá cho trạm này.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      station_id: stationId,
      prices: prices.map((p) => ({
        fuel: p.fuel_name,
        category: p.fuel_category,
        price: p.price,
        updated: p.recorded_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
