import { NextResponse } from 'next/server';
import { searchStations } from '@/lib/services/tankerkoenig';
import { buildStationList } from '@/lib/services/compare';

/**
 * GET /api/stations/search
 * Tìm trạm xăng theo tọa độ + so sánh giá rẻ/đắt trong khu vực
 * Query: lat, lng, rad (km, max 25)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const rad = searchParams.get('rad') || '5';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Cần có lat và lng.' },
        { status: 400 }
      );
    }

    const data = await searchStations(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(rad)
    );

    return NextResponse.json(buildStationList(data.stations || []));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
