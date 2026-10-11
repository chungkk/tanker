import { NextResponse } from 'next/server';
import { addStationsToWatch } from '@/lib/services/collector';

/**
 * POST /api/stations/watch
 * Thêm trạm xăng vào watchlist (bắt đầu thu thập giá)
 * Body: { lat, lng, radius, label }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lng, radius = 5, label } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Cần có lat và lng để tìm trạm.' },
        { status: 400 }
      );
    }

    const result = await addStationsToWatch(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      label
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
