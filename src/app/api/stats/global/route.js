import { NextResponse } from 'next/server';

/**
 * GET /api/stats/global
 * Thống kê giá trung bình toàn quốc (từ Tankerkönig)
 */
export async function GET() {
  try {
    // Dynamic import to avoid issues with server-side config loading
    const { TANKERKOENIG_BASE_URL, TANKERKOENIG_API_KEY } = await import('@/lib/config');

    const url = `${TANKERKOENIG_BASE_URL}/json/list.php?apikey=${TANKERKOENIG_API_KEY}&lat=51.1657&lng=10.4515&rad=25&sort=price&type=all`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok === false) {
      return NextResponse.json(
        { error: data.message || 'Tankerkönig error' },
        { status: 500 }
      );
    }

    // Tính giá trung bình từ kết quả
    const stations = data.stations || [];
    const fuelAverages = {};

    for (const s of stations) {
      if (s.e5) {
        if (!fuelAverages['Super E5']) fuelAverages['Super E5'] = { total: 0, count: 0 };
        fuelAverages['Super E5'].total += s.e5;
        fuelAverages['Super E5'].count++;
      }
      if (s.e10) {
        if (!fuelAverages['Super E10']) fuelAverages['Super E10'] = { total: 0, count: 0 };
        fuelAverages['Super E10'].total += s.e10;
        fuelAverages['Super E10'].count++;
      }
      if (s.diesel) {
        if (!fuelAverages.Diesel) fuelAverages.Diesel = { total: 0, count: 0 };
        fuelAverages.Diesel.total += s.diesel;
        fuelAverages.Diesel.count++;
      }
    }

    const averages = {};
    for (const [fuel, data] of Object.entries(fuelAverages)) {
      averages[fuel] = {
        avg_price: Math.round((data.total / data.count) * 1000) / 1000,
        sample_size: data.count,
      };
    }

    return NextResponse.json({
      region: 'Germany (center sample)',
      timestamp: new Date().toISOString(),
      averages,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
