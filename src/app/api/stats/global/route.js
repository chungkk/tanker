import { NextResponse } from 'next/server';
import { searchStations } from '@/lib/services/tankerkoenig';
import { summarizeFuels } from '@/lib/services/compare';

/**
 * GET /api/stats/global
 * Giá trung bình tham khảo — mẫu các trạm trong bán kính 25 km quanh tâm nước Đức
 * (Tankerkönig không có endpoint thống kê toàn quốc)
 */
export async function GET() {
  try {
    const { stations } = await searchStations(51.1657, 10.4515, 25);

    return NextResponse.json({
      region: 'Germany (mẫu 25 km quanh tâm nước Đức)',
      timestamp: new Date().toISOString(),
      averages: summarizeFuels(stations),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
