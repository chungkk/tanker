import { NextResponse } from 'next/server';
import { getStationDetail } from '@/lib/services/tankerkoenig';

/**
 * GET /api/stations/:id
 * Thông tin chi tiết 1 trạm + giá hiện tại + giờ mở cửa
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const station = await getStationDetail(id);

    if (!station) {
      return NextResponse.json(
        { error: 'Không tìm thấy trạm.' },
        { status: 404 }
      );
    }

    return NextResponse.json(station);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
