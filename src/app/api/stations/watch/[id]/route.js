import { NextResponse } from 'next/server';
import { getStmts } from '@/lib/database';
import { getStationDetail } from '@/lib/services/tankerkoenig';

/**
 * POST /api/stations/watch/:id
 * Thêm 1 trạm cụ thể vào watchlist (theo UUID)
 * Body: { label }
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { label } = body;

    // Lấy thông tin trạm từ Tankerkönig
    const station = await getStationDetail(id);
    if (!station) {
      return NextResponse.json(
        { error: 'Không tìm thấy trạm.' },
        { status: 404 }
      );
    }

    const stmts = getStmts();

    // Lưu vào DB
    stmts.upsertStation.run({
      id: station.id,
      name: station.name || '',
      brand: station.brand || '',
      street: station.street || '',
      postal_code: station.postalCode || '',
      place: station.place || '',
      lat: station.coords.lat,
      lng: station.coords.lng,
      is_open: station.isOpen ? 1 : 0,
      opening_times: JSON.stringify(station.openingTimes || []),
    });

    stmts.addWatched.run(id, label || `${station.brand} ${station.place}`);

    // Lưu giá hiện tại
    if (station.fuels) {
      for (const fuel of station.fuels) {
        if (fuel.price != null) {
          stmts.insertPrice.run({
            station_id: station.id,
            fuel_name: fuel.name,
            fuel_category: fuel.category,
            price: fuel.price,
          });
        }
      }
    }

    return NextResponse.json({ added: true, station });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/stations/watch/:id
 * Xóa trạm khỏi watchlist
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  const stmts = getStmts();
  stmts.removeWatched.run(id);
  return NextResponse.json({ removed: true });
}
