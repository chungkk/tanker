import { NextResponse } from 'next/server';
import { searchStations } from '@/lib/services/tankerkoenig';
import { geocodePostalCode } from '@/lib/services/geocode';
import { buildStationList } from '@/lib/services/compare';

/**
 * GET /api/stations/postalcode/:code
 * Tìm trạm theo mã bưu điện (đổi sang tọa độ rồi tìm như /search)
 * Query: rad (km, mặc định 5, max 25)
 */
export async function GET(request, { params }) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const rad = parseFloat(searchParams.get('rad') || '5');

    if (!/^\d{5}$/.test(code)) {
      return NextResponse.json(
        { error: 'Mã bưu điện Đức phải có 5 chữ số (ví dụ: 06118).' },
        { status: 400 }
      );
    }

    const location = await geocodePostalCode(code);
    if (!location) {
      return NextResponse.json(
        { error: `Không tìm thấy mã bưu điện ${code}.` },
        { status: 404 }
      );
    }

    const data = await searchStations(location.lat, location.lng, rad);

    return NextResponse.json({
      location,
      ...buildStationList(data.stations || []),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
