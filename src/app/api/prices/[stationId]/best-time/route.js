import { NextResponse } from 'next/server';
import { findBestTime } from '@/lib/services/forecast';

/**
 * GET /api/prices/:stationId/best-time
 * Tìm thời điểm giá rẻ nhất trong ngày
 * Query: fuel (bắt buộc)
 */
export async function GET(request, { params }) {
  try {
    const { stationId } = await params;
    const { searchParams } = new URL(request.url);
    const fuel = searchParams.get('fuel');

    if (!fuel) {
      return NextResponse.json(
        { error: 'Cần có tham số fuel (ví dụ: ?fuel=Diesel)' },
        { status: 400 }
      );
    }

    const result = findBestTime(stationId, fuel);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
