import { NextResponse } from 'next/server';
import { getByIds } from '@/lib/services/tankerkoenig';

/**
 * GET /api/prices/:stationId/current
 * Lấy giá hiện tại của trạm
 */
export async function GET(request, { params }) {
  try {
    const { stationId } = await params;
    const { stations } = await getByIds([stationId]);
    const station = stations[0];

    if (!station || !station.fuels.length) {
      return NextResponse.json(
        { error: 'Không có dữ liệu giá cho trạm này.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      station_id: stationId,
      isOpen: station.isOpen,
      prices: station.fuels.map((f) => ({
        fuel: f.name,
        category: f.category,
        price: f.price,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
